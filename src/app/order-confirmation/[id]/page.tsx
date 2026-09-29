import React from "react";
import { Metadata } from "next";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { getLocalOrder } from "@/lib/orders-store";
import { Order } from "@/types";
import { OrderConfirmationClient } from "./order-confirmation-client";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Confirmation | ILAI",
  description: "Your order details and payment confirmation for ILAI Eco-Friendly Sanitary Pads.",
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  let orderData: Order | null = null;

  if (isSupabaseConfigured) {
    try {
      // 1. Try finding order by unguessable confirmation_token (UUID)
      const { data: byToken, error: tokenErr } = await supabaseAdmin
        .from("orders")
        .select("*, order_items(*)")
        .eq("confirmation_token", id)
        .maybeSingle();

      if (!tokenErr && byToken) {
        orderData = byToken;
      } else {
        // 2. Fallback to order id
        const { data: byId } = await supabaseAdmin
          .from("orders")
          .select("*, order_items(*)")
          .eq("id", id)
          .maybeSingle();
        if (byId) orderData = byId;
      }
    } catch (e) {
      console.warn("Order confirmation DB fetch fallback:", e);
    }
  }

  // 3. Retrieve from local persistent orders store if not found in Supabase
  if (!orderData && id) {
    orderData = getLocalOrder(id);
  }

  return <OrderConfirmationClient initialOrder={orderData} id={id} />;
}
