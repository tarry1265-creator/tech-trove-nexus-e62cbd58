import { corsHeaders } from '@supabase/supabase-js/cors'

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { customerEmail, adminEmail, productName, quantity, price, orderId, customerName, orderItems, totalAmount } = await req.json();

    // Support both old format (orderItems array) and new format (single product)
    const items = orderItems || [{ product_name: productName, quantity: quantity || 1, unit_price: price || 0 }];
    const total = totalAmount || (price ? price * (quantity || 1) : 0);
    const adminTo = adminEmail || "Brainhubtek@gmail.com";
    const name = customerName || "Valued Customer";
    const orderRef = orderId || "unknown";

    if (!customerEmail || (!orderItems && !productName)) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: customerEmail and (orderItems or productName)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const productListHtml = items
      .map((item: any) => `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #eee;font-size:14px;">${item.product_name}</td>
          <td style="padding:12px;border-bottom:1px solid #eee;font-size:14px;text-align:center;">${item.quantity}</td>
          <td style="padding:12px;border-bottom:1px solid #eee;font-size:14px;text-align:right;">₦${Number(item.unit_price).toLocaleString()}</td>
        </tr>
      `).join("");

    const customerEmailHtml = `
      <div style="font-family:'Poppins',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
        <div style="background:#285A48;padding:30px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:24px;">BRAINHUB</h1>
          <p style="color:#B0E4CC;margin:8px 0 0;font-size:14px;">Order Confirmation</p>
        </div>
        <div style="padding:30px;">
          <h2 style="color:#091413;margin:0 0 16px;">Hi ${name}! 🎉</h2>
          <p style="color:#555;font-size:14px;line-height:1.6;">
            Thank you for your purchase! Your order has been received and is being processed.
          </p>
          <p style="color:#555;font-size:14px;line-height:1.6;">
            <strong>Order ID:</strong> #${String(orderRef).slice(0, 8)}
          </p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            <thead>
              <tr style="background:#f5f5f5;">
                <th style="padding:12px;text-align:left;font-size:13px;color:#666;">Product</th>
                <th style="padding:12px;text-align:center;font-size:13px;color:#666;">Qty</th>
                <th style="padding:12px;text-align:right;font-size:13px;color:#666;">Price</th>
              </tr>
            </thead>
            <tbody>${productListHtml}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding:12px;font-weight:bold;font-size:14px;">Total</td>
                <td style="padding:12px;text-align:right;font-weight:bold;font-size:16px;color:#408A71;">₦${Number(total).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
          <div style="background:#f0faf5;border-left:4px solid #408A71;padding:16px;margin:20px 0;border-radius:4px;">
            <p style="color:#091413;font-size:14px;margin:0;line-height:1.6;">
              📦 <strong>Delivery Info:</strong> You will be contacted shortly regarding when you'll receive your product(s). Stay tuned!
            </p>
          </div>
          <p style="color:#999;font-size:12px;margin-top:30px;">
            If you have any questions, please contact us at Brainhubtek@gmail.com
          </p>
        </div>
      </div>
    `;

    const adminEmailHtml = `
      <div style="font-family:'Poppins',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
        <div style="background:#285A48;padding:30px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:24px;">BRAINHUB</h1>
          <p style="color:#B0E4CC;margin:8px 0 0;font-size:14px;">New Order Notification</p>
        </div>
        <div style="padding:30px;">
          <h2 style="color:#091413;margin:0 0 16px;">New Order Received! 🛒</h2>
          <p style="color:#555;font-size:14px;line-height:1.6;">
            <strong>Customer:</strong> ${name} (${customerEmail})
          </p>
          <p style="color:#555;font-size:14px;line-height:1.6;">
            <strong>Order ID:</strong> #${String(orderRef).slice(0, 8)}
          </p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            <thead>
              <tr style="background:#f5f5f5;">
                <th style="padding:12px;text-align:left;font-size:13px;color:#666;">Product</th>
                <th style="padding:12px;text-align:center;font-size:13px;color:#666;">Qty</th>
                <th style="padding:12px;text-align:right;font-size:13px;color:#666;">Price</th>
              </tr>
            </thead>
            <tbody>${productListHtml}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding:12px;font-weight:bold;font-size:14px;">Total</td>
                <td style="padding:12px;text-align:right;font-weight:bold;font-size:16px;color:#408A71;">₦${Number(total).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
          <p style="color:#555;font-size:14px;">Please process this order and arrange delivery.</p>
        </div>
      </div>
    `;

    // Send customer email
    const customerRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "BRAINHUB <onboarding@resend.dev>",
        to: [customerEmail],
        subject: `Order Confirmed - #${String(orderRef).slice(0, 8)} | BRAINHUB`,
        html: customerEmailHtml,
      }),
    });

    const customerResult = await customerRes.json();
    console.log("Customer email result:", JSON.stringify(customerResult));

    // Send admin email
    const adminRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "BRAINHUB Orders <onboarding@resend.dev>",
        to: [adminTo],
        subject: `New Order from ${name} - #${String(orderRef).slice(0, 8)}`,
        html: adminEmailHtml,
      }),
    });

    const adminResult = await adminRes.json();
    console.log("Admin email result:", JSON.stringify(adminResult));

    return new Response(
      JSON.stringify({ success: true, customerResult, adminResult }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Email sending error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
