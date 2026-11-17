import nodemailer, { Transporter } from "nodemailer";
import { IBooking } from "@/models/Booking";

// Email configuration from environment variables
const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const fromEmail = process.env.SMTP_FROM || '"OTS Taxi UK" <no-reply@otstaxi.co.uk>';
const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "admin@otstaxi.co.uk";

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;

  if (smtpHost && smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
    return transporter;
  }

  return null;
}

/**
 * Send customer booking confirmation receipt email
 */
export async function sendBookingConfirmationEmail(booking: IBooking): Promise<boolean> {
  const recipientEmail = booking.passenger_email;
  if (!recipientEmail) {
    console.warn(`[Email] No recipient email found for booking ${booking.quote_ref}`);
    return false;
  }

  const passengerName = booking.passenger_name || "Valued Customer";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const voucherUrl = `${siteUrl}/booking-confirmation?ref=${booking.quote_ref}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Booking Confirmation - OTS Taxi</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .header { background-color: #141720; padding: 24px; text-align: center; border-bottom: 4px solid #FFCC00; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
        .header h1 span { color: #FFCC00; }
        .content { padding: 30px; }
        .badge { display: inline-block; background-color: #e6f4ea; color: #137333; font-weight: bold; font-size: 13px; padding: 4px 12px; border-radius: 20px; }
        .ref-box { background: #f8f9fa; border: 1px dashed #ccc; border-radius: 8px; padding: 12px 16px; margin: 20px 0; display: flex; justify-content: space-between; align-items: center; }
        .ref-code { font-family: monospace; font-size: 18px; font-weight: bold; color: #141720; }
        .route-card { background: #fafafa; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #FFCC00; }
        .route-row { margin: 8px 0; font-size: 14px; }
        .route-label { font-weight: bold; color: #666; font-size: 11px; text-transform: uppercase; }
        .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
        .details-table td { padding: 8px 0; border-bottom: 1px solid #eee; }
        .details-table td:last-child { text-align: right; font-weight: 600; }
        .btn { display: inline-block; background: #FFCC00; color: #000000; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>OTS <span>TAXI</span> UK</h1>
          <p style="color: #bbb; margin: 4px 0 0 0; font-size: 13px;">UK Airport Transfers &amp; Long-Distance Cabs</p>
        </div>

        <div class="content">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2 style="margin: 0; font-size: 20px;">Booking Confirmed!</h2>
            <span class="badge">Payment Confirmed</span>
          </div>

          <p style="margin-top: 12px; font-size: 14px; line-height: 1.5;">
            Dear <strong>${passengerName}</strong>, thank you for booking with OTS Taxi. Your transfer has been confirmed and scheduled with our licensed fleet.
          </p>

          <div class="ref-box">
            <div>
              <span class="route-label">Your Booking Reference</span><br>
              <span class="ref-code">${booking.quote_ref}</span>
            </div>
          </div>

          <div class="route-card">
            <div class="route-row">
              <span class="route-label">Pick-up Location</span>
              <div style="font-weight: 600; color: #141720;">📍 ${booking.from_location}</div>
            </div>
            <div class="route-row" style="margin-top: 12px;">
              <span class="route-label">Drop-off Destination</span>
              <div style="font-weight: 600; color: #141720;">🏁 ${booking.to_location}</div>
            </div>
          </div>

          <table class="details-table">
            <tr>
              <td>Scheduled Date &amp; Time</td>
              <td>${booking.pickup_date} at ${booking.pickup_time}</td>
            </tr>
            <tr>
              <td>Vehicle Category</td>
              <td>${booking.selected_vehicle_id.toUpperCase()}</td>
            </tr>
            <tr>
              <td>Passengers / Luggage</td>
              <td>${booking.passengers} Pax &bull; ${booking.suitcases} Bags</td>
            </tr>
            ${
              booking.flight_number
                ? `<tr>
                     <td>Flight Details</td>
                     <td>Flight ${booking.flight_number} ${booking.terminal ? `(Terminal ${booking.terminal})` : ""}</td>
                   </tr>`
                : ""
            }
            <tr>
              <td>Total Fare Paid</td>
              <td style="color: #137333; font-size: 16px;">${booking.currency || "£"}${booking.total_price.toFixed(2)}</td>
            </tr>
          </table>

          <div style="background: #fff8e1; border-radius: 8px; padding: 14px; font-size: 13px; color: #856404; line-height: 1.4;">
            <strong>ℹ️ Meet &amp; Greet Instructions:</strong><br>
            Your driver will track your flight live. In the arrivals hall, look for the driver holding a clear name board with "<strong>${passengerName}</strong>". Complimentary 45 minutes waiting time is included after landing.
          </div>

          <div style="text-align: center;">
            <a href="${voucherUrl}" class="btn">View &amp; Print Digital Voucher</a>
          </div>
        </div>

        <div class="footer">
          <p>Questions or journey adjustments? Contact our 24/7 Operations Desk:</p>
          <p><strong>📞 Phone: +44 20 8123 4567 | ✉️ support@otstaxi.co.uk</strong></p>
          <p>&copy; ${new Date().getFullYear()} OTS Taxi Limited. Licensed UK Private Hire Operator.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const transport = getTransporter();

  if (transport) {
    try {
      await transport.sendMail({
        from: fromEmail,
        to: recipientEmail,
        subject: `Booking Confirmed [${booking.quote_ref}] - OTS Taxi UK`,
        html: htmlContent,
      });
      console.log(`✉️ Booking confirmation email sent successfully to ${recipientEmail}`);
      return true;
    } catch (err: any) {
      console.error(`❌ Failed to send booking confirmation email:`, err.message);
      return false;
    }
  } else {
    // Console log preview when live SMTP is not yet configured
    console.log(`\n================== [EMAIL SIMULATION] ==================`);
    console.log(`To: ${recipientEmail}`);
    console.log(`Subject: Booking Confirmed [${booking.quote_ref}] - OTS Taxi UK`);
    console.log(`Pick-up: ${booking.from_location} on ${booking.pickup_date} at ${booking.pickup_time}`);
    console.log(`Drop-off: ${booking.to_location}`);
    console.log(`Amount: £${booking.total_price.toFixed(2)}`);
    console.log(`Digital Voucher: ${voucherUrl}`);
    console.log(`(Configure SMTP_HOST, SMTP_USER, SMTP_PASS in .env.local to send real emails)`);
    console.log(`========================================================\n`);
    return true;
  }
}

/**
 * Send admin alert email when a new booking is confirmed
 */
export async function sendAdminBookingAlertEmail(booking: IBooking): Promise<boolean> {
  const transport = getTransporter();

  const textContent = `
🚨 NEW BOOKING ALERT: ${booking.quote_ref}

Passenger: ${booking.passenger_name || "Guest"}
Email: ${booking.passenger_email || "N/A"}
Phone: ${booking.passenger_phone || "N/A"}

Journey:
From: ${booking.from_location}
To: ${booking.to_location}
Date & Time: ${booking.pickup_date} at ${booking.pickup_time}
Vehicle: ${booking.selected_vehicle_id}
Flight: ${booking.flight_number || "None"}

Payment:
Amount: £${booking.total_price.toFixed(2)} (${booking.currency || "GBP"})
Status: ${booking.payment_status}
`;

  if (transport) {
    try {
      await transport.sendMail({
        from: fromEmail,
        to: adminEmail,
        subject: `🚨 [New Booking] ${booking.quote_ref} - £${booking.total_price.toFixed(2)}`,
        text: textContent,
      });
      console.log(`✉️ Admin alert email sent to ${adminEmail}`);
      return true;
    } catch (err: any) {
      console.error(`❌ Failed to send admin alert email:`, err.message);
      return false;
    }
  } else {
    console.log(`[Admin Alert Simulated] New Booking: ${booking.quote_ref} (£${booking.total_price.toFixed(2)})`);
    return true;
  }
}
