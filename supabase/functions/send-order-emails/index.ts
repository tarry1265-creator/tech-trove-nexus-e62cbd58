import nodemailer from "npm:nodemailer@6.9.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GMAIL_USER = Deno.env.get("GMAIL_USER");
const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { customerEmail, customerName, customerPhone, orderItems, orderId, totalAmount } = await req.json();

    if (!customerEmail || !orderItems || !orderId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const name = customerName || "Valued Customer";
    const phone = customerPhone || "Not provided";

    const productListHtml = orderItems
      .map((item: any) => `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #eee;font-size:14px;">${item.product_name}</td>
          <td style="padding:12px;border-bottom:1px solid #eee;font-size:14px;text-align:center;">${item.quantity}</td>
          <td style="padding:12px;border-bottom:1px solid #eee;font-size:14px;text-align:right;">₦${Number(item.unit_price).toLocaleString()}</td>
        </tr>
      `).join("");

    // Customer confirmation email
    const customerEmailHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
        <div style="background:#285A48;padding:30px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:24px;">BRAINHUB</h1>
          <p style="color:#B0E4CC;margin:8px 0 0;font-size:14px;">Order Confirmation</p>
        </div>
        <div style="padding:30px;">
          <h2 style="color:#333;margin:0 0 16px;">Hi ${name}! 🎉</h2>
          <p style="color:#555;font-size:14px;line-height:1.6;">
            Thank you for your purchase! Your order has been received and is being processed.
          </p>
          <p style="color:#555;font-size:14px;"><strong>Order ID:</strong> #${orderId.slice(0, 8)}</p>
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
                <td style="padding:12px;text-align:right;font-weight:bold;font-size:16px;color:#285A48;">₦${Number(totalAmount).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
          <div style="background:#f0faf5;border-left:4px solid #285A48;padding:16px;margin:20px 0;border-radius:4px;">
            <p style="color:#333;font-size:14px;margin:0;line-height:1.6;">
              📦 <strong>Delivery Info:</strong> You will be contacted shortly regarding when you'll receive your product(s). Stay tuned!
            </p>
          </div>
          <p style="color:#999;font-size:12px;margin-top:30px;">
            If you have any questions, please contact us at Brainhubtek@gmail.com
          </p>
        </div>
      </div>
    `;

    // Admin notification email
    const adminEmailHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
        <div style="background:#285A48;padding:30px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:24px;">BRAINHUB</h1>
          <p style="color:#B0E4CC;margin:8px 0 0;font-size:14px;">New Order Notification</p>
        </div>
        <div style="padding:30px;">
          <h2 style="color:#333;margin:0 0 16px;">New Order Received! 🛒</h2>
          <p style="color:#555;font-size:14px;"><strong>Customer:</strong> ${name} (${customerEmail})</p>
          <p style="color:#555;font-size:14px;"><strong>Phone:</strong> ${phone}</p>
          <p style="color:#555;font-size:14px;"><strong>Order ID:</strong> #${orderId.slice(0, 8)}</p>
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
                <td style="padding:12px;text-align:right;font-weight:bold;font-size:16px;color:#285A48;">₦${Number(totalAmount).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
          <p style="color:#555;font-size:14px;">Please process this order and arrange delivery.</p>
        </div>
      </div>
    `;

    // Send customer email
    const customerResult = await transporter.sendMail({
      from: "BRAINHUB <" + GMAIL_USER + ">",
      to: customerEmail,
      subject: `Order Confirmed - #${orderId.slice(0, 8)} | BRAINHUB`,
      html: customerEmailHtml,
    });
    console.log("Customer email sent:", customerResult.messageId);

    // Send admin email
    const adminResult = await transporter.sendMail({
      from: "BRAINHUB Orders <" + GMAIL_USER + ">",
      to: "Brainhubtek@gmail.com",
      subject: `New Order from ${name} - #${orderId.slice(0, 8)}`,
      html: adminEmailHtml,
    });
    console.log("Admin email sent:", adminResult.messageId);

    return new Response(
      JSON.stringify({ success: true }),
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
