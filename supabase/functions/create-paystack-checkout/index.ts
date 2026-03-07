import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[PAYSTACK-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const paystackKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackKey) throw new Error("PAYSTACK_SECRET_KEY is not set");

    const { items, shippingInfo, callbackUrl } = await req.json();
    if (!items || items.length === 0) throw new Error("No items provided");
    logStep("Received items", { count: items.length });

    // Calculate total in kobo (Paystack uses kobo for NGN)
    const totalAmount = Math.round(
      items.reduce((sum: number, item: any) => sum + item.price * item.quantity * 100, 0)
    );

    logStep("Calculated total", { totalAmount });

    // Build metadata
    const metadata = {
      items: items.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      shipping: {
        name: shippingInfo?.name || "",
        address: shippingInfo?.address || "",
        city: shippingInfo?.city || "",
        state: shippingInfo?.state || "",
        phone: shippingInfo?.phone || "",
      },
    };

    const payload: any = {
      amount: totalAmount,
      currency: "NGN",
      callback_url: callbackUrl || "http://localhost:3000/payment-success",
      metadata,
    };

    // Add email if provided
    if (shippingInfo?.email) {
      payload.email = shippingInfo.email;
    } else {
      // Paystack requires an email - use a placeholder if none provided
      payload.email = `customer_${Date.now()}@placeholder.com`;
    }

    logStep("Initializing Paystack transaction", { email: payload.email });

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    logStep("Paystack response", { status: data.status, message: data.message });

    if (!data.status) {
      throw new Error(data.message || "Failed to initialize Paystack transaction");
    }

    return new Response(
      JSON.stringify({
        authorization_url: data.data.authorization_url,
        access_code: data.data.access_code,
        reference: data.data.reference,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
