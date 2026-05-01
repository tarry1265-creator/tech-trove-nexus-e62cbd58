import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { deviceName, deviceModel, damageDescription, imageUrl } = await req.json();

    if (!deviceName || !damageDescription) {
      return new Response(
        JSON.stringify({ error: "Device name and damage description are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Use AI to format the repair request professionally
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant that formats device repair requests for WhatsApp messages. 
            Create a clear, professional, and concise message that includes all the repair details.
            The message should be friendly but professional.
            Keep the message under 500 characters.
            Format it nicely with emojis for better readability.
            Start with a greeting and end with a request for a quote or callback.
            Do not include any markdown formatting, just plain text suitable for WhatsApp.
            ${imageUrl ? "IMPORTANT: The customer has provided a photo of the damage. Include the image URL in your message so the repair team can view it. Make sure to mention they can click the link to see the photo." : ""}`,
          },
          {
            role: "user",
            content: `Please format this repair request for WhatsApp:
            
Device: ${deviceName}
${deviceModel ? `Model/Serial: ${deviceModel}` : ""}
Damage Description: ${damageDescription}
${imageUrl ? `Photo of damage: ${imageUrl}` : ""}`,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", errorText);
      throw new Error("Failed to process repair request with AI");
    }

    const aiData = await aiResponse.json();
    const formattedMessage = aiData.choices?.[0]?.message?.content || 
      `🔧 Repair Request

📱 Device: ${deviceName}
${deviceModel ? `📋 Model: ${deviceModel}\n` : ""}
❌ Issue: ${damageDescription}
${imageUrl ? `\n📸 Photo: ${imageUrl}` : ""}

Please let me know the repair cost and timeline. Thank you!`;

    return new Response(
      JSON.stringify({ message: formattedMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error processing repair request:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to process request";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
