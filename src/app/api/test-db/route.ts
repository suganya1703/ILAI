import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const result: any = {
    isSupabaseConfigured,
    url: process.env.SUPABASE_URL ? "SUPABASE_URL is set" : (process.env.NEXT_PUBLIC_SUPABASE_URL ? "NEXT_PUBLIC_SUPABASE_URL is set" : "NONE"),
    serviceRoleSet: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    anonKeySet: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  };

  if (!isSupabaseConfigured) {
    result.error = "Supabase is not configured on this environment!";
    return NextResponse.json(result);
  }

  // 1. Test SELECT from orders
  try {
    const { data, error } = await supabaseAdmin.from("orders").select("id, order_number, created_at").limit(3);
    result.selectOrders = {
      success: !error,
      error: error || null,
      count: data?.length || 0,
      data: data || null,
    };
  } catch (e: any) {
    result.selectOrdersException = e.message;
  }

  // 2. Test INSERT to orders
  const testId = crypto.randomUUID();
  const testToken = crypto.randomUUID();
  try {
    const { error: insertErr } = await supabaseAdmin.from("orders").insert({
      id: testId,
      order_number: "TEST-DIAGNOSTIC-" + Date.now().toString().slice(-4),
      confirmation_token: testToken,
      customer_name: "Diagnostic Test",
      customer_email: "diag@test.com",
      customer_mobile: "9999999999",
      address_line: "123 Diagnostic St",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600001",
      payment_method: "upi",
      payment_status: "Pending verification",
      order_status: "Pending verification",
      subtotal: 45,
      delivery_charge: 40,
      total_amount: 85,
    });

    result.insertTest = {
      success: !insertErr,
      error: insertErr || null,
    };

    // Clean up test order if succeeded
    if (!insertErr) {
      await supabaseAdmin.from("orders").delete().eq("id", testId);
    }
  } catch (e: any) {
    result.insertException = e.message;
  }

  return NextResponse.json(result);
}
