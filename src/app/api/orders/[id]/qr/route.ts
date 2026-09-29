import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { getLocalOrder } from "@/lib/orders-store";
import { getQrImageBuffer } from "@/lib/qr-image";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = params.id;
    if (!token) {
      return new NextResponse("Not Found", { status: 404 });
    }

    let order: any = null;

    if (isSupabaseConfigured) {
      try {
        // 1. Try finding by confirmation_token (unguessable UUID)
        const { data: byToken, error: tokenErr } = await supabaseAdmin
          .from("orders")
          .select("id, confirmation_token, payment_method, payment_status, order_status")
          .eq("confirmation_token", token)
          .maybeSingle();

        if (!tokenErr && byToken) {
          order = byToken;
        } else {
          // 2. Fallback to order id
          const { data: byId } = await supabaseAdmin
            .from("orders")
            .select("id, confirmation_token, payment_method, payment_status, order_status")
            .eq("id", token)
            .maybeSingle();
          if (byId) order = byId;
        }
      } catch (dbErr) {
        console.warn("DB QR verification lookup fallback:", dbErr);
      }
    }

    if (!order) {
      order = getLocalOrder(token);
    }

    if (order) {
      const isUpi =
        order.payment_method === "upi" ||
        order.payment_method === "upi_gpay";

      if (!isUpi) {
        return new NextResponse(
          "Forbidden: QR code is only available for UPI orders",
          { status: 403 }
        );
      }
    }

    const imageBuffer = getQrImageBuffer();
    if (!imageBuffer) {
      return new NextResponse("QR image unavailable", { status: 500 });
    }

    return new Response(new Uint8Array(imageBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (err: any) {
    console.error("QR Route Error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
