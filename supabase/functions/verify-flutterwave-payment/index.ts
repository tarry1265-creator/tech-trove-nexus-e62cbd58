import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[VERIFY-FLUTTERWAVE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const flwSecretKey = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
    if (!flwSecretKey) throw new Error("FLUTTERWAVE_SECRET_KEY is not set");

    const { transaction_id, tx_ref } = await req.json();
    logStep("Verifying payment", { transaction_id, tx_ref });

    if (!transaction_id) throw new Error("No transaction_id provided");

    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transaction_id)}/verify`,
      {
        headers: {
          Authorization: `Bearer ${flwSecretKey}`,
        },
      }
    );

    const data = await response.json();
    logStep("Flutterwave verify response", { status: data.status, txStatus: data?.data?.status });

    if (data.status !== "success") {
      throw new Error(data.message || "Verification failed");
    }

    const txData = data.data;

    return new Response(
      JSON.stringify({
        status: txData.status === "successful" ? "success" : txData.status,
        amount: txData.amount,
        currency: txData.currency,
        tx_ref: txData.tx_ref,
        transaction_id: txData.id,
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
