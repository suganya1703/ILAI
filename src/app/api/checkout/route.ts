import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { siteConfig } from "@/config/site";
import { productContent, getCurrentPrice } from "@/config/content";
import { sendOrderReceivedEmail } from "@/lib/email";
import { isValidTamilNaduPincode } from "@/lib/utils";
import { saveLocalOrder, getNextLocalOrderNumber } from "@/lib/orders-store";
import { OrderStatus, PaymentStatus } from "@/types";

// Helper to strip script/HTML tags and enforce character boundaries
function sanitizeText(input: unknown, maxLength: number): string {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .replace(/[<>]/g, "") // Strip HTML tag angle brackets to prevent stored XSS
    .slice(0, maxLength);
}

// Validation and sanitization schema for checkout form (Server-Side)
const checkoutSchema = z.object({
  customer_name: z
    .string()
    .min(2, "Full Name must be at least 2 characters")
    .max(100, "Full Name cannot exceed 100 characters")
    .transform((val) => sanitizeText(val, 100)),
  customer_email: z
    .string()
    .email("Valid email address is required for order confirmation")
    .max(255, "Email address cannot exceed 255 characters")
    .transform((val) => val.trim().toLowerCase()),
  customer_mobile: z
    .string()
    .transform((val) => val.trim().replace(/\D/g, "").slice(-10))
    .refine((val) => /^[6-9]\d{9}$/.test(val), {
      message: "Mobile must be a valid 10-digit Indian phone number starting with 6-9",
    }),
  address_line: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(300, "Address cannot exceed 300 characters")
    .transform((val) => sanitizeText(val, 300)),
  city: z
    .string()
    .min(2, "City is required")
    .max(60, "City cannot exceed 60 characters")
    .transform((val) => sanitizeText(val, 60)),
  state: z
    .string()
    .default("Tamil Nadu")
    .transform((val) => sanitizeText(val || "Tamil Nadu", 50)),
  pincode: z
    .string()
    .transform((val) => val.trim().replace(/\D/g, ""))
    .refine((val) => /^\d{6}$/.test(val), {
      message: "PIN code must be a valid 6-digit number",
    }),
  payment_method: z.enum(["upi", "upi_gpay", "cod", "razorpay"]),
  items: z
    .array(
      z.object({
        productId: z.string().transform((val) => sanitizeText(val, 50)),
        quantity: z
          .number()
          .int("Quantity must be a whole number")
          .min(1, "Minimum quantity is 1 pack")
          .max(10, "Maximum quantity is 10 packs per item"),
      })
    )
    .min(1, "Cart cannot be empty"),
});

async function getSequentialOrderNumber(): Promise<string> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseAdmin.rpc("get_next_order_number");
      if (!error && data) {
        return String(data).trim();
      }
    } catch (e) {
      console.warn("Supabase order sequence fallback:", e);
    }
  }
  return getNextLocalOrderNumber();
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    // Rate limit: max 5 checkout/order creations per minute per IP
    const limitCheck = rateLimit({
      key: `checkout_rate:${ip}`,
      limit: 5,
      windowMs: 60 * 1000,
    });

    if (!limitCheck.success) {
      return NextResponse.json(
        { error: "Too many checkout requests. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validatedData = checkoutSchema.parse(body);

    // 1. Fetch current settings from database & calculate server-authoritative pricing
    // Dynamically uses ₹45 during active promotional offer, and ₹60 automatically after it ends
    const unitPrice = getCurrentPrice();
    let deliveryCharge = siteConfig.defaultDeliveryCharge;

    let settings: any = null;

    if (isSupabaseConfigured) {
      try {
        const settingsRes = await supabaseAdmin
          .from("store_settings")
          .select("*")
          .eq("id", 1)
          .single();
        settings = settingsRes.data;
      } catch (e) {
        console.warn("Store settings fetch fallback:", e);
      }
    }

    if (settings && settings.delivery_charge !== undefined) {
      deliveryCharge = Number(settings.delivery_charge);
    }

    // 2. Server-Side Tamil Nadu & PIN Code Restriction Check
    const pinCheck = isValidTamilNaduPincode(validatedData.pincode, settings?.allowed_pincodes);
    if (!pinCheck.isValid) {
      return NextResponse.json(
        { error: pinCheck.errorReason || "Right now we deliver only within Tamil Nadu." },
        { status: 400 }
      );
    }

    // 3. Minimum Packs Per Order Check
    const totalQuantity = validatedData.items.reduce((acc, item) => acc + item.quantity, 0);
    const minPacksRequired = settings?.min_packs_per_order !== undefined ? Number(settings.min_packs_per_order) : 1;
    if (totalQuantity < minPacksRequired) {
      return NextResponse.json(
        { error: `Minimum order quantity is ${minPacksRequired} pack(s).` },
        { status: 400 }
      );
    }

    // 4. Server-Authoritative Price & Delivery Charge Calculation
    const subtotal = totalQuantity * unitPrice;
    
    // Free delivery threshold logic
    const freeDeliveryThreshold = settings?.free_delivery_threshold ? Number(settings.free_delivery_threshold) : 0;
    if (freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold) {
      deliveryCharge = 0;
    }

    // 5. Cash on Delivery (COD) Validation
    if (validatedData.payment_method === "cod") {
      const codEnabled = settings?.cod_enabled !== undefined ? Boolean(settings.cod_enabled) : true;
      const codMinOrderValue = settings?.cod_min_order_value ? Number(settings.cod_min_order_value) : 0;

      if (!codEnabled) {
        return NextResponse.json(
          { error: "Cash on Delivery is currently unavailable." },
          { status: 400 }
        );
      }

      if (codMinOrderValue > 0 && subtotal < codMinOrderValue) {
        return NextResponse.json(
          { error: `Cash on Delivery requires a minimum subtotal of ₹${codMinOrderValue}.` },
          { status: 400 }
        );
      }
    }

    const totalAmount = subtotal + deliveryCharge;

    // 5. Payment and Order Status Wording (Never auto-confirm)
    // UPI orders: "Pending verification". COD orders: "Pending confirmation".
    const isCod = validatedData.payment_method === "cod";
    const initialPaymentStatus: PaymentStatus = isCod ? "Cash on Delivery" : "Pending verification";
    const initialOrderStatus: OrderStatus = isCod ? "Pending confirmation" : "Pending verification";

    // 6. Generate sequential Order ID (ILAI-2026-0001, ILAI-2026-0002, ...)
    const generatedOrderNumber = await getSequentialOrderNumber();
    // Generate private unguessable confirmation token (UUID)
    const confirmationToken = crypto.randomUUID();

    // 7. Create Order Record in Supabase (persistent database)
    let createdOrder: any = null;
    if (isSupabaseConfigured) {
      try {
        const { data: order, error: orderError } = await supabaseAdmin
          .from("orders")
          .insert({
            order_number: generatedOrderNumber,
            confirmation_token: confirmationToken,
            customer_name: validatedData.customer_name,
            customer_email: validatedData.customer_email,
            customer_mobile: validatedData.customer_mobile,
            address_line: validatedData.address_line,
            city: validatedData.city,
            state: "Tamil Nadu", // Fixed to Tamil Nadu
            pincode: validatedData.pincode,
            payment_method: validatedData.payment_method,
            payment_status: initialPaymentStatus,
            order_status: initialOrderStatus,
            subtotal,
            delivery_charge: deliveryCharge,
            total_amount: totalAmount,
          })
          .select("*")
          .single();

        if (orderError) {
          console.error("[Supabase Orders Insert Error]:", orderError);
        } else if (order) {
          createdOrder = order;
        }
      } catch (dbErr) {
        console.error("[Supabase Orders Exception]:", dbErr);
      }
    }

    if (!createdOrder) {
      const generatedId = crypto.randomUUID();
      createdOrder = {
        id: generatedId,
        confirmation_token: confirmationToken,
        order_number: generatedOrderNumber,
        customer_name: validatedData.customer_name,
        customer_email: validatedData.customer_email,
        customer_mobile: validatedData.customer_mobile,
        address_line: validatedData.address_line,
        city: validatedData.city,
        state: "Tamil Nadu",
        pincode: validatedData.pincode,
        payment_method: validatedData.payment_method,
        payment_status: initialPaymentStatus,
        order_status: initialOrderStatus,
        subtotal,
        delivery_charge: deliveryCharge,
        total_amount: totalAmount,
        created_at: new Date().toISOString(),
      };
    }

    // 7. Create Order Items
    const orderItemRecords = validatedData.items.map((item) => ({
      order_id: createdOrder.id,
      product_id: productContent.id,
      product_name: productContent.name,
      unit_price: unitPrice,
      quantity: item.quantity,
      total_price: item.quantity * unitPrice,
    }));

    if (isSupabaseConfigured) {
      try {
        const { error: itemsErr } = await supabaseAdmin.from("order_items").insert(orderItemRecords);
        if (itemsErr) console.error("[Supabase Order Items Insert Error]:", itemsErr);

        await supabaseAdmin.from("order_status_history").insert({
          order_id: createdOrder.id,
          status: initialOrderStatus,
          note: isCod
            ? "Order received - Pending confirmation (COD)"
            : "UPI payment submitted - Pending verification",
        });
      } catch (e) {
        console.error("[Supabase Items/History Exception]:", e);
      }
    }

    // 8. Persist Order in Local Store (Secondary fallback for offline dev)
    const fullOrderForEmail = {
      ...createdOrder,
      confirmation_token: createdOrder.confirmation_token || confirmationToken,
      order_items: orderItemRecords,
    };
    saveLocalOrder(fullOrderForEmail);

    // 9. Send Automatic Email to Customer (awaited so Vercel keeps the lambda alive until email dispatch completes)
    try {
      const emailResult = await sendOrderReceivedEmail(fullOrderForEmail);
      if (!emailResult.success) {
        console.warn("[Email Notification Notice]:", emailResult.error);
      }
    } catch (e) {
      console.error("[Email Notification Exception]:", e);
    }

    const finalToken = createdOrder.confirmation_token || confirmationToken;

    return NextResponse.json({
      success: true,
      orderId: createdOrder.id,
      orderNumber: createdOrder.order_number,
      confirmationToken: finalToken,
      totalAmount,
      paymentMethod: validatedData.payment_method,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Checkout API error:", err);
    return NextResponse.json(
      { error: "Internal server error during checkout" },
      { status: 500 }
    );
  }
}
