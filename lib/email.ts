import nodemailer, { Transporter } from "nodemailer";
import { IBooking } from "@/models/Booking";
import { getSystemSettings, SystemSettings } from "./system-settings";

async function getTransporter(): Promise<{ transporter: Transporter | null; fromEmail: string; adminEmail: string; settings: SystemSettings }> {
  const settings = await getSystemSettings();
  const brandName = settings.brand_name || "Quick Car Midlands Ltd";
  const defaultFrom = `"${brandName}" <no-reply@quickcarmidlands.co.uk>`;
  const fromEmail = settings.smtp_from || defaultFrom;
  const adminEmail = settings.admin_email || "admin@quickcarmidlands.co.uk";

  if (settings.smtp_host && settings.smtp_user && settings.smtp_pass) {
    try {
      const transport = nodemailer.createTransport({
        host: settings.smtp_host,
        port: settings.smtp_port,
        secure: settings.smtp_port === 465,
        auth: {
          user: settings.smtp_user,
          pass: settings.smtp_pass,
        },
      });
      return { transporter: transport, fromEmail, adminEmail, settings };
    } catch {
      return { transporter: null, fromEmail, adminEmail, settings };
    }
  }

  return { transporter: null, fromEmail, adminEmail, settings };
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

  const { transporter: transport, fromEmail, settings } = await getTransporter();
  const brandName = settings.brand_name || "Quick Car Midlands Ltd";
  const brandTagline = settings.brand_tagline || "Airport Transfers & Private Hire | Based in Birmingham";
  const brandWords = brandName.trim().split(/\s+/);
  const firstWord = brandWords[0] || "Quick";
  const restWords = brandWords.slice(1).join(" ");
  const primaryColor = settings.primary_color || "#FFCC00";
  const supportPhone = settings.support_phone || "01212433112";
  const supportEmail = settings.support_email || "qcm023@gmail.com";

  const passengerName = booking.passenger_name || "Valued Customer";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const voucherUrl = `${siteUrl}/booking-confirmation?ref=${booking.quote_ref}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Booking Confirmation - ${brandName}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .header { background-color: #141720; padding: 24px; text-align: center; border-bottom: 4px solid ${primaryColor}; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
        .header h1 span { color: ${primaryColor}; }
        .content { padding: 30px; }
        .badge { display: inline-block; background-color: #e6f4ea; color: #137333; font-weight: bold; font-size: 13px; padding: 4px 12px; border-radius: 20px; }
        .ref-box { background: #f8f9fa; border: 1px dashed #ccc; border-radius: 8px; padding: 12px 16px; margin: 20px 0; display: flex; justify-content: space-between; align-items: center; }
        .ref-code { font-family: monospace; font-size: 18px; font-weight: bold; color: #141720; }
        .route-card { background: #fafafa; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid ${primaryColor}; }
        .route-row { margin: 8px 0; font-size: 14px; }
        .route-label { font-weight: bold; color: #666; font-size: 11px; text-transform: uppercase; }
        .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
        .details-table td { padding: 8px 0; border-bottom: 1px solid #eee; }
        .details-table td:last-child { text-align: right; font-weight: 600; }
        .btn { display: inline-block; background: ${primaryColor}; color: #000000; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${firstWord} ${restWords ? `<span>${restWords}</span>` : ""}</h1>
          <p style="color: #bbb; margin: 4px 0 0 0; font-size: 13px;">${brandTagline}</p>
        </div>

        <div class="content">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2 style="margin: 0; font-size: 20px;">Booking Confirmed!</h2>
            <span class="badge">Payment Confirmed</span>
          </div>

          <p style="margin-top: 12px; font-size: 14px; line-height: 1.5;">
            Dear <strong>${passengerName}</strong>, thank you for booking with ${brandName}. Your transfer has been confirmed and scheduled with our licensed fleet.
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
          <p><strong>📞 Phone: ${supportPhone} | ✉️ ${supportEmail}</strong></p>
          <p>&copy; ${new Date().getFullYear()} ${brandName} Limited. Licensed UK Private Hire Operator.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (transport) {
    try {
      await transport.sendMail({
        from: fromEmail,
        to: recipientEmail,
        subject: `Booking Confirmed [${booking.quote_ref}] - ${brandName}`,
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
    console.log(`Subject: Booking Confirmed [${booking.quote_ref}] - ${brandName}`);
    console.log(`Pick-up: ${booking.from_location} on ${booking.pickup_date} at ${booking.pickup_time}`);
    console.log(`Drop-off: ${booking.to_location}`);
    console.log(`Amount: £${booking.total_price.toFixed(2)}`);
    console.log(`Digital Voucher: ${voucherUrl}`);
    console.log(`(Configure SMTP Settings in Admin Portal to send real emails)`);
    console.log(`========================================================\n`);
    return true;
  }
}

/**
 * Send admin alert email when a new booking is confirmed
 */
export async function sendAdminBookingAlertEmail(booking: IBooking): Promise<boolean> {
  const { transporter: transport, fromEmail, adminEmail, settings } = await getTransporter();
  const brandName = settings.brand_name || "Quick Car Midlands Ltd";

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
Flight: ${booking.flight_number || "N/A"}

Total Amount Paid: ${booking.currency || "£"}${booking.total_price.toFixed(2)}
Payment Status: ${booking.payment_status}
Booking Reference: ${booking.quote_ref}

View details in your ${brandName} Admin Portal:
${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin
  `;

  if (transport) {
    try {
      await transport.sendMail({
        from: fromEmail,
        to: adminEmail,
        subject: `🚨 New Booking Received [${booking.quote_ref}] - ${booking.from_location}`,
        text: textContent,
      });
      console.log(`✉️ Admin booking alert email sent to ${adminEmail}`);
      return true;
    } catch (err: any) {
      console.error(`❌ Failed to send admin alert email:`, err.message);
      return false;
    }
  } else {
    console.log(`\n================== [ADMIN ALERT SIMULATION] ==================`);
    console.log(`To Admin: ${adminEmail}`);
    console.log(`Subject: 🚨 New Booking Received [${booking.quote_ref}]`);
    console.log(textContent);
    console.log(`==============================================================\n`);
    return true;
  }
}

/**
 * Send 6-digit email verification code OTP
 */
export async function sendVerificationCodeEmail(
  email: string,
  name: string,
  code: string
): Promise<boolean> {
  const { transporter: transport, fromEmail, settings } = await getTransporter();
  const brandName = settings.brand_name || "Quick Car Midlands Ltd";
  const brandTagline = settings.brand_tagline || "Airport Transfers & Private Hire | Based in Birmingham";
  const brandWords = brandName.trim().split(/\s+/);
  const firstWord = brandWords[0] || "Quick";
  const restWords = brandWords.slice(1).join(" ");
  const primaryColor = settings.primary_color || "#FFCC00";
  const officeAddress = settings.office_address || "167-169 Great Portland Street, London W1W 5PF, United Kingdom";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Verify Your ${brandName} Account</title></head>
    <body style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 24px; color: #141720;">
      <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
        <div style="background-color: #141720; padding: 24px; text-align: center; border-bottom: 4px solid ${primaryColor};">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">${firstWord} ${restWords ? `<span style="color: ${primaryColor};">${restWords}</span>` : ""}</h1>
          <p style="color: #9ca3af; font-size: 12px; margin: 4px 0 0;">${brandTagline}</p>
        </div>
        <div style="padding: 32px 28px;">
          <h2 style="font-size: 18px; font-weight: 700; margin-top: 0; color: #111827;">Confirm Your Email Address</h2>
          <p style="font-size: 14px; color: #4b5563; line-height: 1.5;">Hello ${name || 'Valued User'}, thank you for registering with ${brandName}. Please use the verification code below to activate your account:</p>
          <div style="text-align: center; margin: 28px 0;">
            <div style="display: inline-block; background-color: #FFF9E6; border: 2px dashed ${primaryColor}; border-radius: 12px; padding: 16px 36px; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #141720;">
              ${code}
            </div>
          </div>
          <p style="font-size: 12px; color: #6b7280; text-align: center;">This code will expire in 30 minutes. If you did not create a ${brandName} account, please disregard this email.</p>
        </div>
        <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #f3f4f6; font-size: 11px; color: #9ca3af;">
          ${brandName} Limited • ${officeAddress}
        </div>
      </div>
    </body>
    </html>
  `;

  if (transport) {
    try {
      await transport.sendMail({
        from: fromEmail,
        to: email,
        subject: `Verify Your ${brandName} Account [${code}]`,
        html: htmlContent,
      });
      console.log(`✉️ Verification code email sent to ${email}`);
      return true;
    } catch (err: any) {
      console.error(`❌ Failed to send verification email:`, err.message);
      return false;
    }
  } else {
    console.log(`\n================== [VERIFICATION CODE SIMULATION] ==================`);
    console.log(`To: ${email} (${name})`);
    console.log(`Verification Code: >>> ${code} <<<`);
    console.log(`Subject: Verify Your ${brandName} Account [${code}]`);
    console.log(`(Configure SMTP in Admin Portal -> Settings to send live emails)`);
    console.log(`===================================================================\n`);
    return true;
  }
}

/**
 * Send test SMTP configuration email
 */
export async function sendTestSmtpEmail(
  toEmail: string,
  settings: { host: string; port: number; user: string; pass: string; from: string }
): Promise<{ success: boolean; message: string }> {
  try {
    const sysSettings = await getSystemSettings();
    const brandName = sysSettings.brand_name || "Quick Car Midlands Ltd";

    const testTransport = nodemailer.createTransport({
      host: settings.host,
      port: settings.port,
      secure: settings.port === 465,
      auth: {
        user: settings.user,
        pass: settings.pass,
      },
    });

    await testTransport.verify();

    await testTransport.sendMail({
      from: settings.from || `"${brandName}" <no-reply@quickcarmidlands.co.uk>`,
      to: toEmail,
      subject: `✅ SMTP Connection Successful - ${brandName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #141720;">
          <h2 style="color: #059669;">✅ SMTP Connection Test Succeeded</h2>
          <p>Your SMTP mail server configuration is fully operational for ${brandName}.</p>
          <ul>
            <li><strong>Host:</strong> ${settings.host}</li>
            <li><strong>Port:</strong> ${settings.port}</li>
            <li><strong>User:</strong> ${settings.user}</li>
            <li><strong>Sender:</strong> ${settings.from}</li>
          </ul>
          <p>${brandName} booking receipts, driver alerts, and email verifications will now be delivered successfully.</p>
        </div>
      `,
    });

    return { success: true, message: `Test email sent successfully to ${toEmail}!` };
  } catch (error: any) {
    return { success: false, message: error.message || 'SMTP connection failed. Check host, port, and credentials.' };
  }
}

/**
 * Send customer booking cancellation confirmation & admin alert
 */
export async function sendBookingCancellationEmail(
  booking: IBooking,
  refundEligible: boolean
): Promise<boolean> {
  const { transporter, settings } = await getTransporter();
  const brandName = settings.brand_name || "Quick Car Midlands Ltd";
  const brandPhone = settings.support_phone || "+44 (0) 121 285 5000";

  const passengerSubject = `Cancellation Confirmed - Booking Ref: ${booking.quote_ref} | ${brandName}`;
  const passengerHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #141720; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #dc2626; color: #ffffff; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 20px;">Booking Cancelled</h1>
        <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Ref: ${booking.quote_ref}</p>
      </div>
      <div style="padding: 24px;">
        <p>Dear ${booking.passenger_name || 'Valued Passenger'},</p>
        <p>Your transfer booking has been successfully cancelled per your request.</p>
        
        <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0 0 8px 0;"><strong>Route:</strong> ${booking.from_location} &rarr; ${booking.to_location}</p>
          <p style="margin: 0 0 8px 0;"><strong>Scheduled Date:</strong> ${booking.pickup_date} at ${booking.pickup_time}</p>
          <p style="margin: 0 0 8px 0;"><strong>Vehicle:</strong> ${booking.selected_vehicle_id}</p>
          <p style="margin: 0;"><strong>Refund Status:</strong> ${
            refundEligible
              ? 'Eligible for refund. A full refund will be credited to your original payment method within 5–10 business days.'
              : booking.payment_status === 'unpaid'
              ? 'No payment was made. No charges incurred.'
              : 'Cancellation requested within 24 hours of scheduled pickup. Please contact support regarding refund terms.'
          }</p>
        </div>

        <p style="font-size: 13px; color: #6b7280;">If you cancelled by mistake or need to re-book, please visit our website or call us directly at <strong>${brandPhone}</strong>.</p>
      </div>
      <div style="background: #f3f4f6; padding: 16px; text-align: center; font-size: 11px; color: #6b7280;">
        &copy; 2026 ${brandName}. All rights reserved.
      </div>
    </div>
  `;

  if (transporter && booking.passenger_email) {
    try {
      await transporter.sendMail({
        from: settings.smtp_from || `"${brandName}" <no-reply@quickcarmidlands.co.uk>`,
        to: booking.passenger_email,
        subject: passengerSubject,
        html: passengerHtml,
      });
      // Also notify operations admin
      if (settings.admin_email) {
        await transporter.sendMail({
          from: settings.smtp_from,
          to: settings.admin_email,
          subject: `🚨 [CANCELLATION] Ref: ${booking.quote_ref} - ${booking.passenger_name || 'Passenger'}`,
          html: `<p>Booking <strong>${booking.quote_ref}</strong> was cancelled by the customer.</p><p>Route: ${booking.from_location} &rarr; ${booking.to_location}</p><p>Scheduled: ${booking.pickup_date} at ${booking.pickup_time}</p><p>Fare: £${booking.total_price}</p>`,
        });
      }
      return true;
    } catch (e: any) {
      console.error("Failed to send cancellation email:", e.message);
      return false;
    }
  }
  return true;
}

/**
 * Send customer booking modification confirmation & admin notification
 */
export async function sendBookingModificationEmail(
  booking: IBooking,
  changesSummary: string
): Promise<boolean> {
  const { transporter, settings } = await getTransporter();
  const brandName = settings.brand_name || "Quick Car Midlands Ltd";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #141720; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #0284c7; color: #ffffff; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 20px;">Booking Updated</h1>
        <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Ref: ${booking.quote_ref}</p>
      </div>
      <div style="padding: 24px;">
        <p>Dear ${booking.passenger_name || 'Valued Passenger'},</p>
        <p>Your airport transfer booking has been successfully updated with your requested modifications.</p>
        
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 14px; border-radius: 8px; margin: 16px 0;">
          <strong style="color: #166534; font-size: 13px;">Updates Applied:</strong>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #15803d;">${changesSummary}</p>
        </div>

        <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0; font-size: 13px;">
          <p style="margin: 0 0 8px 0;"><strong>Pickup Date &amp; Time:</strong> ${booking.pickup_date} at ${booking.pickup_time}</p>
          <p style="margin: 0 0 8px 0;"><strong>Route:</strong> ${booking.from_location} &rarr; ${booking.to_location}</p>
          <p style="margin: 0 0 8px 0;"><strong>Vehicle:</strong> ${booking.selected_vehicle_id}</p>
          <p style="margin: 0 0 8px 0;"><strong>Passengers / Bags:</strong> ${booking.passengers} Pax / ${booking.suitcases} Bags</p>
          <p style="margin: 0;"><strong>Updated Fare:</strong> £${Number(booking.total_price).toFixed(2)}</p>
        </div>

        <p style="font-size: 13px; color: #6b7280;">Your chauffeur will be dispatched according to these updated details.</p>
      </div>
      <div style="background: #f3f4f6; padding: 16px; text-align: center; font-size: 11px; color: #6b7280;">
        &copy; 2026 ${brandName}. All rights reserved.
      </div>
    </div>
  `;

  if (transporter && booking.passenger_email) {
    try {
      await transporter.sendMail({
        from: settings.smtp_from || `"${brandName}" <no-reply@quickcarmidlands.co.uk>`,
        to: booking.passenger_email,
        subject: `Updated Itinerary - Ref: ${booking.quote_ref} | ${brandName}`,
        html,
      });
      if (settings.admin_email) {
        await transporter.sendMail({
          from: settings.smtp_from,
          to: settings.admin_email,
          subject: `✏️ [MODIFICATION] Ref: ${booking.quote_ref} - Updated by Passenger`,
          html: `<p>Booking <strong>${booking.quote_ref}</strong> was modified.</p><p>Changes: ${changesSummary}</p><p>New Schedule: ${booking.pickup_date} at ${booking.pickup_time}</p><p>Total Fare: £${booking.total_price}</p>`,
        });
      }
      return true;
    } catch (e: any) {
      console.error("Failed to send modification email:", e.message);
      return false;
    }
  }
  return true;
}

/**
 * Send chauffeur document expiry notice (PCO, Insurance, PHV MOT)
 */
export async function sendDriverDocumentExpiryNotice(
  driverEmail: string,
  driverName: string,
  docType: string,
  expiryDate: string,
  daysRemaining: number
): Promise<boolean> {
  const { transporter, settings } = await getTransporter();
  const brandName = settings.brand_name || "Quick Car Midlands Ltd";

  const isExpired = daysRemaining <= 0;
  const statusTitle = isExpired ? `CRITICAL: ${docType} Has Expired` : `URGENT: ${docType} Expiring in ${daysRemaining} Days`;
  const headerColor = isExpired ? '#dc2626' : '#d97706';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #141720; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background-color: ${headerColor}; color: #ffffff; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 20px;">${statusTitle}</h1>
        <p style="margin: 8px 0 0 0; font-size: 13px; opacity: 0.9;">Chauffeur Compliance Notice</p>
      </div>
      <div style="padding: 24px;">
        <p>Dear ${driverName},</p>
        <p>${
          isExpired
            ? `Our compliance records indicate that your <strong>${docType}</strong> expired on <strong>${expiryDate}</strong>.`
            : `Our records indicate that your <strong>${docType}</strong> is scheduled to expire on <strong>${expiryDate}</strong> (in ${daysRemaining} days).`
        }</p>
        
        <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px; margin: 16px 0; color: #991b1b; font-size: 13px;">
          <strong>Regulatory Requirement:</strong>
          <p style="margin: 6px 0 0 0;">
            ${isExpired
              ? 'In accordance with UK licensing regulations, your dispatch status has been locked. You cannot receive airport transfers until an updated document has been uploaded and approved.'
              : 'Please upload your renewed certificate into your Chauffeur Dashboard before the expiry date to ensure uninterrupted dispatch eligibility.'}
          </p>
        </div>

        <p style="font-size: 13px;">
          Log into your chauffeur portal to upload your renewal: <a href="https://quickcarmidlands.co.uk/driver/dashboard" style="color: #2563eb; font-weight: bold;">Chauffeur Dashboard</a>
        </p>
      </div>
      <div style="background: #f3f4f6; padding: 16px; text-align: center; font-size: 11px; color: #6b7280;">
        &copy; 2026 ${brandName} Compliance Dept. All rights reserved.
      </div>
    </div>
  `;

  if (transporter && driverEmail) {
    try {
      await transporter.sendMail({
        from: settings.smtp_from || `"${brandName} Compliance" <compliance@quickcarmidlands.co.uk>`,
        to: driverEmail,
        subject: `${statusTitle} - ${brandName}`,
        html,
      });
      return true;
    } catch (e: any) {
      console.error("Failed to send driver expiry notice:", e.message);
      return false;
    }
  }
  return true;
}

/**
 * Generic sendEmail function for notification routes
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<boolean> {
  const { transporter, fromEmail } = await getTransporter();
  if (!transporter || !to) return false;
  try {
    await transporter.sendMail({
      from: fromEmail,
      to,
      subject,
      html,
      ...(text ? { text } : {}),
    });
    return true;
  } catch (error: any) {
    console.error("sendEmail error:", error.message);
    return false;
  }
}
