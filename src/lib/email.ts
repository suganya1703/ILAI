import nodemailer, { type Transporter } from "nodemailer";
import { Order } from "@/types";
import { siteConfig } from "@/config/site";
import { formatINR } from "./utils";

// Sender configuration using Gmail SMTP settings
export const SENDER_NAME = process.env.GMAIL_SENDER_NAME || "ILAI";
export const SENDER_EMAIL = process.env.GMAIL_SMTP_USER || "info.ilaiofficial@gmail.com";
export const REPLY_TO_EMAIL = process.env.GMAIL_SMTP_USER || "info.ilaiofficial@gmail.com";

let cachedTransporter: Transporter | null = null;
let lastTransporterKey = "";

export function getMailTransporter(): Transporter | null {
  const user = (process.env.GMAIL_SMTP_USER || "info.ilaiofficial@gmail.com").trim();
  const rawPass = (process.env.GMAIL_APP_PASSWORD || "goauueyoqorssbuk").trim();

  if (!user || !rawPass || rawPass === "your_gmail_app_password_here" || rawPass.includes("placeholder")) {
    return null;
  }

  // Strip spaces if user pasted "xxxx yyyy zzzz wwww" format
  const pass = rawPass.replace(/\s+/g, "").trim();

  const host = (process.env.GMAIL_SMTP_HOST || "smtp.gmail.com").trim();
  const port = Number(process.env.GMAIL_SMTP_PORT) || 465;
  const currentKey = `${host}:${port}:${user}:${pass}`;

  if (cachedTransporter && lastTransporterKey === currentKey) {
    return cachedTransporter;
  }

  // Use nodemailer's native Gmail service configuration for maximum compatibility on cloud/Vercel
  if (host === "smtp.gmail.com" || user.endsWith("@gmail.com")) {
    cachedTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  } else {
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }

  lastTransporterKey = currentKey;
  return cachedTransporter;
}

/**
 * 1. AUTOMATIC EMAIL — sent immediately when a customer places an order
 * Subject: "We've received your ILAI order [Order ID]"
 */
export async function sendOrderReceivedEmail(order: Order): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!order.customer_email || !order.customer_email.trim()) {
    console.warn(`[Gmail SMTP Warning] Cannot send order received email: customer_email is blank for order ${order.order_number}`);
    return { success: false, error: "Customer email is blank" };
  }

  const transporter = getMailTransporter();

  if (!transporter) {
    const msg = `[Gmail SMTP Simulation - No Valid App Password] Automatic Order Received email to ${order.customer_email} for order ${order.order_number}`;
    console.log(msg);
    return { success: true, data: { simulated: true, message: msg } };
  }

  try {
    const isCod = order.payment_method === "cod";
    const cleanNum = (order.order_number || "").replace(/^(IL)+ILAI-/i, "ILAI-");
    const cleanMob = (order.customer_mobile || "").replace(/\D/g, "").slice(-10);
    const trackUrl = `${siteConfig.url}/track?id=${encodeURIComponent(cleanNum)}&mobile=${encodeURIComponent(cleanMob)}`;
    const confirmUrl = order.confirmation_token
      ? `${siteConfig.url}/order-confirmation/${order.confirmation_token}`
      : `${siteConfig.url}/order-confirmation/${order.id}`;

    const itemsListHtml = (order.order_items || [])
      .map(
        (item) => `
          <tr>
            <td style="padding: 12px 10px; border-bottom: 1px solid #E2DCCB; font-size: 14px; color: #263618;">
              <strong>${escapeHtml(item.product_name)}</strong>
            </td>
            <td style="padding: 12px 10px; border-bottom: 1px solid #E2DCCB; text-align: center; font-size: 14px; color: #263618;">
              ${item.quantity}
            </td>
            <td style="padding: 12px 10px; border-bottom: 1px solid #E2DCCB; text-align: right; font-size: 14px; font-weight: 600; color: #506638;">
              ${formatINR(item.total_price)}
            </td>
          </tr>`
      )
      .join("");

    const calloutHtml = isCod
      ? `
        <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 700; color: #506638;">
          🌿 Thank you for choosing ILAI!
        </p>
        <p style="margin: 0 0 8px 0; font-size: 14px; line-height: 1.5; color: #263618;">
          Order received. Pay cash on delivery. We will confirm your order shortly.
        </p>
        <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #263618;">
          Our team will verify your delivery address and dispatch your package across Tamil Nadu.
        </p>`
      : `
        <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 700; color: #506638;">
          🌿 Thank you for choosing ILAI!
        </p>
        <p style="margin: 0 0 8px 0; font-size: 14px; line-height: 1.5; color: #263618;">
          We have received your order and payment details.
        </p>
        <p style="margin: 0 0 8px 0; font-size: 14px; line-height: 1.5; color: #263618;">
          Our team will verify your payment and confirm your order as soon as possible.
        </p>
        <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #263618;">
          Your order confirmation and delivery details will be shared once the payment is verified.
        </p>`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>We've received your ILAI order</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F6F2E6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #263618;">
  <div style="max-width: 600px; margin: 24px auto; background-color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #E2DCCB; box-shadow: 0 4px 12px rgba(38, 54, 24, 0.05);">
    
    <!-- Brand Header -->
    <div style="background-color: #506638; padding: 28px 24px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 28px; letter-spacing: 2px; font-weight: 800;">ILAI</h1>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #EDE8D8; letter-spacing: 0.5px;">Sustainable Femcare &bull; Banana Fibre &amp; Water Hyacinth</p>
    </div>

    <!-- Main Content -->
    <div style="padding: 28px 24px;">
      
      <!-- Thank You & Verification Callout -->
      <div style="background-color: #F4F1EA; border-left: 4px solid #506638; border-radius: 6px; padding: 18px 20px; margin-bottom: 24px;">
        ${calloutHtml}
      </div>

      <!-- Order Meta Badge -->
      <table style="width: 100%; background-color: #FAFAF7; border: 1px solid #E2DCCB; border-radius: 8px; padding: 14px; margin-bottom: 24px; border-collapse: separate;">
        <tr>
          <td style="font-size: 13px; color: #5F6F50;">Order ID:</td>
          <td style="font-size: 15px; font-weight: 700; color: #506638; text-align: right;">${escapeHtml(cleanNum)}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #5F6F50; padding-top: 6px;">Payment Method:</td>
          <td style="font-size: 13px; font-weight: 600; color: #263618; text-align: right; padding-top: 6px;">
            ${isCod ? 'Cash on Delivery (COD)' : 'UPI / GPay'}
          </td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #5F6F50; padding-top: 6px;">Status:</td>
          <td style="font-size: 12px; font-weight: 700; color: #92400E; text-align: right; padding-top: 6px;">
            <span style="background-color: #FEF3C7; padding: 3px 8px; border-radius: 10px;">${escapeHtml(order.order_status)}</span>
          </td>
        </tr>
      </table>

      <!-- Items Table -->
      <h2 style="font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #506638; margin: 0 0 10px 0; border-bottom: 2px solid #506638; padding-bottom: 6px;">
        Order Summary
      </h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
        <thead>
          <tr style="background-color: #EDE8D8; color: #263618; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
            <th style="padding: 8px 10px; text-align: left;">Product</th>
            <th style="padding: 8px 10px; text-align: center;">Qty</th>
            <th style="padding: 8px 10px; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsListHtml}
        </tbody>
      </table>

      <!-- Price Breakdown -->
      <div style="text-align: right; border-top: 1px dashed #E2DCCB; padding-top: 12px; margin-bottom: 24px;">
        <div style="font-size: 13px; color: #5F6F50; margin-bottom: 4px;">
          Subtotal: <span style="color: #263618; font-weight: 600;">${formatINR(order.subtotal)}</span>
        </div>
        <div style="font-size: 13px; color: #5F6F50; margin-bottom: 8px;">
          Delivery Charge: <span style="color: #263618; font-weight: 600;">${order.delivery_charge === 0 ? "FREE" : formatINR(order.delivery_charge)}</span>
        </div>
        <div style="font-size: 17px; font-weight: 800; color: #506638;">
          Total Amount: <span>${formatINR(order.total_amount)}</span>
        </div>
      </div>

      <!-- Delivery Address -->
      <h2 style="font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #506638; margin: 0 0 10px 0; border-bottom: 2px solid #506638; padding-bottom: 6px;">
        Delivery Address
      </h2>
      <div style="background-color: #FAFAF7; border: 1px solid #E2DCCB; border-radius: 8px; padding: 14px; font-size: 14px; line-height: 1.5; color: #263618;">
        <p style="margin: 0 0 4px 0; font-weight: 700;">${escapeHtml(order.customer_name)}</p>
        <p style="margin: 0 0 4px 0;">${escapeHtml(order.address_line)}</p>
        <p style="margin: 0 0 4px 0;">${escapeHtml(order.city)}, ${escapeHtml(order.state)} - ${escapeHtml(order.pincode)}</p>
        <p style="margin: 0; color: #5F6F50;">Mobile: <strong>+91 ${escapeHtml(order.customer_mobile)}</strong></p>
      </div>

      <!-- Footer Info -->
      <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #E2DCCB; text-align: center; font-size: 12px; color: #5F6F50; line-height: 1.6;">
        <p style="margin: 0 0 6px 0;">
          Track your order status anytime at <a href="${trackUrl}" style="color: #506638; font-weight: 700; text-decoration: underline;">${siteConfig.domain}/track</a>
        </p>
        <p style="margin: 0;">
          Need assistance? Simply reply to this email or reach us at <a href="mailto:${REPLY_TO_EMAIL}" style="color: #506638; font-weight: 600;">${REPLY_TO_EMAIL}</a>.
        </p>
      </div>

    </div>
  </div>
</body>
</html>
    `;

    const sender = `"${SENDER_NAME}" <${SENDER_EMAIL}>`;

    const info = await transporter.sendMail({
      from: sender,
      to: order.customer_email,
      replyTo: REPLY_TO_EMAIL,
      subject: `We've received your ILAI order ${order.order_number}`,
      html,
    });

    console.log(`[Gmail SMTP Success] Sent order received email to ${order.customer_email}, messageId: ${info.messageId}`);
    return { success: true, data: { messageId: info.messageId } };
  } catch (err: any) {
    console.error("[Gmail SMTP Exception] Error sending order received email:", err);
    return { success: false, error: err?.message || "Unknown error" };
  }
}

/**
 * 2. MANUAL CONFIRMATION EMAIL — triggered only when admin marks an order as "Paid"
 * Subject: "Your ILAI order [Order ID] is confirmed"
 */
export async function sendPaymentConfirmedEmail(
  order: Order,
  deliveryNote?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  const transporter = getMailTransporter();

  if (!transporter) {
    const msg = `[Gmail SMTP Simulation - No Valid App Password] Manual Payment Confirmed email to ${order.customer_email} for order ${order.order_number}`;
    console.log(msg);
    return { success: true, data: { simulated: true, message: msg } };
  }

  try {
    const itemsListHtml = (order.order_items || [])
      .map(
        (item) => `
          <tr>
            <td style="padding: 12px 10px; border-bottom: 1px solid #E2DCCB; font-size: 14px; color: #263618;">
              <strong>${escapeHtml(item.product_name)}</strong>
            </td>
            <td style="padding: 12px 10px; border-bottom: 1px solid #E2DCCB; text-align: center; font-size: 14px; color: #263618;">
              ${item.quantity}
            </td>
            <td style="padding: 12px 10px; border-bottom: 1px solid #E2DCCB; text-align: right; font-size: 14px; font-weight: 600; color: #506638;">
              ${formatINR(item.total_price)}
            </td>
          </tr>`
      )
      .join("");

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your ILAI order is confirmed</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F6F2E6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #263618;">
  <div style="max-width: 600px; margin: 24px auto; background-color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #E2DCCB; box-shadow: 0 4px 12px rgba(38, 54, 24, 0.05);">
    
    <!-- Brand Header -->
    <div style="background-color: #506638; padding: 28px 24px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 28px; letter-spacing: 2px; font-weight: 800;">ILAI</h1>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #EDE8D8; letter-spacing: 0.5px;">Sustainable Femcare &bull; Comfort + Care</p>
    </div>

    <!-- Main Content -->
    <div style="padding: 28px 24px;">
      
      <!-- Confirmation Banner -->
      <div style="background-color: #E8F5E9; border-left: 4px solid #2E7D32; border-radius: 6px; padding: 18px 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px 0; font-size: 17px; font-weight: 700; color: #1B5E20;">
          🎉 Your ILAI Order is Confirmed!
        </p>
        <p style="margin: 0 0 6px 0; font-size: 14px; line-height: 1.5; color: #263618;">
          Your payment has been successfully verified by our team.
        </p>
        <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #263618;">
          Your order is now being packed with utmost care and will be dispatched shortly.
        </p>
      </div>

      <!-- Order Details -->
      <table style="width: 100%; background-color: #FAFAF7; border: 1px solid #E2DCCB; border-radius: 8px; padding: 14px; margin-bottom: 24px; border-collapse: separate;">
        <tr>
          <td style="font-size: 13px; color: #5F6F50;">Order ID:</td>
          <td style="font-size: 15px; font-weight: 700; color: #506638; text-align: right;">${escapeHtml(order.order_number)}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #5F6F50; padding-top: 6px;">Payment Status:</td>
          <td style="font-size: 12px; font-weight: 700; color: #1B5E20; text-align: right; padding-top: 6px;">
            <span style="background-color: #C8E6C9; padding: 3px 8px; border-radius: 10px;">✓ Paid &amp; Verified</span>
          </td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #5F6F50; padding-top: 6px;">Estimated Delivery:</td>
          <td style="font-size: 13px; font-weight: 600; color: #263618; text-align: right; padding-top: 6px;">
            2–5 Business Days
          </td>
        </tr>
        ${
          deliveryNote
            ? `<tr>
                <td style="font-size: 13px; color: #5F6F50; padding-top: 6px;">Delivery Note:</td>
                <td style="font-size: 13px; font-weight: 500; color: #506638; text-align: right; padding-top: 6px;">${escapeHtml(deliveryNote)}</td>
              </tr>`
            : ""
        }
      </table>

      <!-- Items Table -->
      <h2 style="font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #506638; margin: 0 0 10px 0; border-bottom: 2px solid #506638; padding-bottom: 6px;">
        Order Items
      </h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
        <thead>
          <tr style="background-color: #EDE8D8; color: #263618; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
            <th style="padding: 8px 10px; text-align: left;">Product</th>
            <th style="padding: 8px 10px; text-align: center;">Qty</th>
            <th style="padding: 8px 10px; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsListHtml}
        </tbody>
      </table>

      <!-- Price Breakdown -->
      <div style="text-align: right; border-top: 1px dashed #E2DCCB; padding-top: 12px; margin-bottom: 24px;">
        <div style="font-size: 13px; color: #5F6F50; margin-bottom: 4px;">
          Subtotal: <span style="color: #263618; font-weight: 600;">${formatINR(order.subtotal)}</span>
        </div>
        <div style="font-size: 13px; color: #5F6F50; margin-bottom: 8px;">
          Delivery Charge: <span style="color: #263618; font-weight: 600;">${order.delivery_charge === 0 ? "FREE" : formatINR(order.delivery_charge)}</span>
        </div>
        <div style="font-size: 17px; font-weight: 800; color: #506638;">
          Total Paid: <span>${formatINR(order.total_amount)}</span>
        </div>
      </div>

      <!-- Delivery Address -->
      <h2 style="font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #506638; margin: 0 0 10px 0; border-bottom: 2px solid #506638; padding-bottom: 6px;">
        Shipping Address
      </h2>
      <div style="background-color: #FAFAF7; border: 1px solid #E2DCCB; border-radius: 8px; padding: 14px; font-size: 14px; line-height: 1.5; color: #263618;">
        <p style="margin: 0 0 4px 0; font-weight: 700;">${escapeHtml(order.customer_name)}</p>
        <p style="margin: 0 0 4px 0;">${escapeHtml(order.address_line)}</p>
        <p style="margin: 0 0 4px 0;">${escapeHtml(order.city)}, ${escapeHtml(order.state)} - ${escapeHtml(order.pincode)}</p>
        <p style="margin: 0; color: #5F6F50;">Mobile: <strong>+91 ${escapeHtml(order.customer_mobile)}</strong></p>
      </div>

      <!-- Footer Info -->
      <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #E2DCCB; text-align: center; font-size: 12px; color: #5F6F50; line-height: 1.6;">
        <p style="margin: 0 0 6px 0;">
          Track your package anytime at <a href="${siteConfig.url}/track" style="color: #506638; font-weight: 700; text-decoration: underline;">${siteConfig.domain}/track</a>
        </p>
        <p style="margin: 0;">
          Have questions about your delivery? Reply to this email or contact us at <a href="mailto:${REPLY_TO_EMAIL}" style="color: #506638; font-weight: 600;">${REPLY_TO_EMAIL}</a>.
        </p>
      </div>

    </div>
  </div>
</body>
</html>
    `;

    const sender = `"${SENDER_NAME}" <${SENDER_EMAIL}>`;

    const info = await transporter.sendMail({
      from: sender,
      to: order.customer_email,
      replyTo: REPLY_TO_EMAIL,
      subject: `Your ILAI order ${order.order_number} is confirmed`,
      html,
    });

    console.log(`[Gmail SMTP Success] Sent payment confirmed email to ${order.customer_email}, messageId: ${info.messageId}`);
    return { success: true, data: { messageId: info.messageId } };
  } catch (err: any) {
    console.error("[Gmail SMTP Exception] Error sending payment confirmed email:", err);
    return { success: false, error: err?.message || "Unknown error" };
  }
}

/**
 * Backward compatibility alias
 */
export const sendOrderConfirmationEmail = sendOrderReceivedEmail;

function escapeHtml(str: string | number | undefined | null): string {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
