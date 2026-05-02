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
    const {
      customerEmail,
      customerName,
      customerPhone,
      orderItems,
      orderId,
      totalAmount,
      shippingAddress,
      shippingCity,
      shippingState,
      fulfillmentType,
    } = await req.json();

    if (!customerEmail || !orderItems || !orderId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const name = customerName || "Valued Customer";
    const phone = customerPhone || "Not provided";
    const isPickup = fulfillmentType === "pickup";
    const PICKUP_LOCATION = "BRAINHUB TECH Store, Lagos, Nigeria";
    const fullAddress = isPickup
      ? PICKUP_LOCATION
      : ([shippingAddress, shippingCity, shippingState].filter(Boolean).join(", ") || "Not provided");
    const fulfillmentBadge = isPickup ? "🏬 PICKUP" : "🚚 DELIVERY";
    const fulfillmentLabel = isPickup ? "In-store pickup" : "Home delivery";
    const dispatcherEmail = Deno.env.get("DISPATCHER_EMAIL") || "Brainhubtek@gmail.com";
    const siteUrl = "https://tech-trove-nexus.lovable.app";

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
            <p style="color:#333;font-size:14px;margin:0 0 6px;line-height:1.6;">
              ${isPickup
                ? `🏬 <strong>Pickup:</strong> Please collect your order at <strong>${PICKUP_LOCATION}</strong>. We'll call you on ${phone} as soon as it's ready.`
                : `📦 <strong>Delivery:</strong> Your order will be delivered to <strong>${fullAddress}</strong>. You'll be contacted shortly to confirm timing.`}
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
          <div style="display:inline-block;background:${isPickup ? '#fff4e0' : '#e0f4ff'};color:${isPickup ? '#8a5a00' : '#0a4a78'};padding:6px 14px;border-radius:20px;font-size:12px;font-weight:bold;margin-bottom:14px;letter-spacing:0.5px;">${fulfillmentBadge}</div>
          <h2 style="color:#333;margin:0 0 16px;">New Order Received! 🛒</h2>
          <p style="color:#555;font-size:14px;"><strong>Customer:</strong> ${name} (${customerEmail})</p>
          <p style="color:#555;font-size:14px;"><strong>Phone:</strong> ${phone}</p>
          <p style="color:#555;font-size:14px;"><strong>Fulfillment:</strong> ${fulfillmentLabel}</p>
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
          <p style="color:#555;font-size:14px;"><strong>${isPickup ? 'Pickup location' : 'Delivery Address'}:</strong> ${fullAddress}</p>
          <p style="color:#555;font-size:14px;">${isPickup ? 'Notify the customer when the order is ready for collection.' : 'Please process this order and arrange delivery.'}</p>
        </div>
      </div>
    `;

    // Dispatcher notification email - large, action-focused
    const waText = encodeURIComponent(
      `New BRAINHUB order #${orderId.slice(0,8)}\nCustomer: ${name}\nPhone: ${phone}\nAddress: ${fullAddress}\nTotal: ₦${Number(totalAmount).toLocaleString()}`
    );
    const dispatchPortalLink = `${siteUrl}/dispatch?order=${orderId}`;
    const dispatcherEmailHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
        <div style="background:#285A48;padding:30px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:26px;">🚚 NEW DELIVERY</h1>
          <p style="color:#B0E4CC;margin:8px 0 0;font-size:14px;">Action required</p>
        </div>
        <div style="padding:30px;">
          <div style="background:#f0faf5;border-left:4px solid #285A48;padding:18px;margin:0 0 20px;border-radius:4px;">
            <p style="margin:0 0 8px;font-size:13px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Deliver to</p>
            <p style="margin:0 0 6px;font-size:20px;font-weight:bold;color:#091413;">${name}</p>
            <p style="margin:0 0 12px;font-size:16px;color:#333;">📞 <a href="tel:${phone}" style="color:#285A48;text-decoration:none;font-weight:bold;">${phone}</a></p>
            <p style="margin:0;font-size:15px;color:#333;line-height:1.5;">📍 ${fullAddress}</p>
          </div>
          <p style="color:#555;font-size:14px;margin:0 0 8px;"><strong>Order ID:</strong> #${orderId.slice(0, 8)}</p>
          <table style="width:100%;border-collapse:collapse;margin:14px 0 20px;">
            <thead>
              <tr style="background:#f5f5f5;">
                <th style="padding:10px;text-align:left;font-size:12px;color:#666;">Item</th>
                <th style="padding:10px;text-align:center;font-size:12px;color:#666;">Qty</th>
              </tr>
            </thead>
            <tbody>${orderItems.map((it: any) => `<tr><td style="padding:10px;border-bottom:1px solid #eee;font-size:13px;">${it.product_name}</td><td style="padding:10px;border-bottom:1px solid #eee;font-size:13px;text-align:center;">${it.quantity}</td></tr>`).join("")}</tbody>
          </table>
          <p style="margin:0 0 20px;font-size:16px;color:#091413;"><strong>Total: ₦${Number(totalAmount).toLocaleString()}</strong></p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${dispatchPortalLink}" style="display:inline-block;background:#285A48;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;">Open in Dispatch Portal</a>
          </div>
          <div style="text-align:center;margin:12px 0;">
            <a href="https://wa.me/?text=${waText}" style="display:inline-block;background:#25D366;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">📲 Forward via WhatsApp</a>
          </div>
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

    // Send dispatcher email
    try {
      const dispatcherResult = await transporter.sendMail({
        from: "BRAINHUB Dispatch <" + GMAIL_USER + ">",
        to: dispatcherEmail,
        subject: `🚚 New Delivery - ${name} - #${orderId.slice(0, 8)}`,
        html: dispatcherEmailHtml,
      });
      console.log("Dispatcher email sent:", dispatcherResult.messageId);
    } catch (dispErr) {
      console.error("Dispatcher email failed:", dispErr);
    }

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
