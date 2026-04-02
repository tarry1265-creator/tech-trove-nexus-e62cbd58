import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[FLUTTERWAVE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const flwSecretKey = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
    if (!flwSecretKey) throw new Error("FLUTTERWAVE_SECRET_KEY is not set");

    const { items, shippingInfo, callbackUrl } = await req.json();
    if (!items || items.length === 0) throw new Error("No items provided");
    logStep("Received items", { count: items.length });

    // Calculate total in Naira
    const totalAmount = items.reduce((sum: number, item: any) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 1;
      return sum + price * quantity;
    }, 0);

    if (totalAmount <= 0) {
      throw new Error(`Invalid total amount: ${totalAmount}`);
    }

    const txRef = `FLW-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const payload = {
      tx_ref: txRef,
      amount: totalAmount,
      currency: "NGN",
      redirect_url: callbackUrl || "http://localhost:3000/payment-success",
      customer: {
        email: shippingInfo?.email || `customer_${Date.now()}@placeholder.com`,
        phonenumber: shippingInfo?.phone || "",
        name: shippingInfo?.name || "Customer",
      },
      customizations: {
        title: "TechTrove",
        description: "Payment for your order",
      },
      meta: {
        items: JSON.stringify(items.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        }))),
        shipping_name: shippingInfo?.name || "",
        shipping_address: shippingInfo?.address || "",
        shipping_city: shippingInfo?.city || "",
        shipping_state: shippingInfo?.state || "",
        shipping_phone: shippingInfo?.phone || "",
      },
    };

    logStep("Creating Flutterwave payment", { amount: totalAmount, txRef });

    const response = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${flwSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    logStep("Flutterwave response", { status: data.status, message: data.message });

    if (data.status !== "success") {
      throw new Error(data.message || "Failed to create Flutterwave payment");
    }

    return new Response(
      JSON.stringify({
        payment_link: data.data.link,
        tx_ref: txRef,
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
