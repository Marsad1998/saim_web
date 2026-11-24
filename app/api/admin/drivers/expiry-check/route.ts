import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { DriverModel } from "@/models/Driver";
import { dbQuery } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { getSystemSettings } from "@/lib/system-settings";

export const dynamic = "force-dynamic";

interface ExpiryItem {
  driverId: string;
  driverName: string;
  driverEmail: string;
  documentType: 'pco' | 'insurance' | 'mot' | 'dvla';
  expiryDate: string;
  daysUntilExpiry: number;
  status: 'expired' | 'expiring_soon' | 'warning';
}

async function checkAdminAuth(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyJwtToken(token);
  if (!payload || payload.role !== "admin") return null;
  return payload;
}

/**
 * Calculate days until a date (negative means expired)
 */
function getDaysUntilExpiry(expiryDate: string | null | undefined): number {
  if (!expiryDate) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const diffMs = expiry.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Check all drivers for document expiries
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await checkAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const threshold = parseInt(searchParams.get("threshold") || "30", 10);

    const drivers = await DriverModel.getAll();
    const expiringItems: ExpiryItem[] = [];

    for (const driver of drivers) {
      // Check PCO Expiry
      const pcoDays = getDaysUntilExpiry(driver.pco_expiry);
      if (pcoDays <= threshold) {
        expiringItems.push({
          driverId: driver.id,
          driverName: driver.driver_name || "Unknown Driver",
          driverEmail: driver.driver_email || "",
          documentType: 'pco',
          expiryDate: driver.pco_expiry || "",
          daysUntilExpiry: pcoDays,
          status: pcoDays < 0 ? 'expired' : pcoDays <= 7 ? 'expiring_soon' : 'warning',
        });
      }

      // Check Insurance Expiry
      const insuranceDays = getDaysUntilExpiry(driver.insurance_expiry);
      if (insuranceDays <= threshold) {
        expiringItems.push({
          driverId: driver.id,
          driverName: driver.driver_name || "Unknown Driver",
          driverEmail: driver.driver_email || "",
          documentType: 'insurance',
          expiryDate: driver.insurance_expiry || "",
          daysUntilExpiry: insuranceDays,
          status: insuranceDays < 0 ? 'expired' : insuranceDays <= 7 ? 'expiring_soon' : 'warning',
        });
      }

      // Check MOT Expiry (PHV MOT)
      const motDays = getDaysUntilExpiry(driver.doc_phv_mot);
      if (motDays <= threshold) {
        expiringItems.push({
          driverId: driver.id,
          driverName: driver.driver_name || "Unknown Driver",
          driverEmail: driver.driver_email || "",
          documentType: 'mot',
          expiryDate: driver.doc_phv_mot || "",
          daysUntilExpiry: motDays,
          status: motDays < 0 ? 'expired' : motDays <= 7 ? 'expiring_soon' : 'warning',
        });
      }

      // Check DVLA Licence Expiry
      const dvlaDays = getDaysUntilExpiry(driver.dvla_license_number ? "" : undefined);
      // DVLA licence doesn't have explicit expiry in schema, check if we have the number
      // The pco_expiry typically covers both PCO and DVLA in UK
    }

    // Sort by urgency (expired first, then soonest)
    expiringItems.sort((a, b) => {
      if (a.status === 'expired' && b.status !== 'expired') return -1;
      if (b.status === 'expired' && a.status !== 'expired') return 1;
      return a.daysUntilExpiry - b.daysUntilExpiry;
    });

    // Summary counts
    const summary = {
      expired: expiringItems.filter(i => i.status === 'expired').length,
      expiringSoon: expiringItems.filter(i => i.status === 'expiring_soon').length,
      warning: expiringItems.filter(i => i.status === 'warning').length,
      total: expiringItems.length,
    };

    return NextResponse.json({
      status: true,
      expiringItems,
      summary,
    });
  } catch (error: any) {
    console.error("GET /api/admin/drivers/expiry-check error:", error.message);
    return NextResponse.json({ status: false, message: "Server error" }, { status: 500 });
  }
}

/**
 * Send expiry notifications to drivers and/or admins
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await checkAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { threshold = 30, sendToDrivers = true, sendToAdmins = true } = body;

    const settings = await getSystemSettings();
    const adminEmail = settings.admin_email || "admin@quickcarmidlands.co.uk";

    const drivers = await DriverModel.getAll();
    let notificationsSent = 0;
    let notificationsFailed = 0;

    for (const driver of drivers) {
      const driverItems: ExpiryItem[] = [];

      const pcoDays = getDaysUntilExpiry(driver.pco_expiry);
      if (pcoDays <= threshold && pcoDays >= -30) {
        driverItems.push({
          driverId: driver.id,
          driverName: driver.driver_name || "Unknown Driver",
          driverEmail: driver.driver_email || "",
          documentType: 'pco',
          expiryDate: driver.pco_expiry || "",
          daysUntilExpiry: pcoDays,
          status: pcoDays < 0 ? 'expired' : pcoDays <= 7 ? 'expiring_soon' : 'warning',
        });
      }

      const insuranceDays = getDaysUntilExpiry(driver.insurance_expiry);
      if (insuranceDays <= threshold && insuranceDays >= -30) {
        driverItems.push({
          driverId: driver.id,
          driverName: driver.driver_name || "Unknown Driver",
          driverEmail: driver.driver_email || "",
          documentType: 'insurance',
          expiryDate: driver.insurance_expiry || "",
          daysUntilExpiry: insuranceDays,
          status: insuranceDays < 0 ? 'expired' : insuranceDays <= 7 ? 'expiring_soon' : 'warning',
        });
      }

      const motDays = getDaysUntilExpiry(driver.doc_phv_mot);
      if (motDays <= threshold && motDays >= -30) {
        driverItems.push({
          driverId: driver.id,
          driverName: driver.driver_name || "Unknown Driver",
          driverEmail: driver.driver_email || "",
          documentType: 'mot',
          expiryDate: driver.doc_phv_mot || "",
          daysUntilExpiry: motDays,
          status: motDays < 0 ? 'expired' : motDays <= 7 ? 'expiring_soon' : 'warning',
        });
      }

      if (driverItems.length === 0) continue;

      // Send to driver
      if (sendToDrivers && driver.driver_email) {
        try {
          const docList = driverItems.map(d =>
            `${d.documentType.toUpperCase()} (${d.status === 'expired' ? 'EXPIRED' : `${d.daysUntilExpiry} days`}) - Expires: ${d.expiryDate}`
          ).join('\n');

          await sendEmail({
            to: driver.driver_email,
            subject: `⚠️ Document Expiry Alert - ${settings.brand_name || 'Quick Car Midlands Ltd'}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #141720; color: #FFCC00; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; font-size: 24px;">${settings.brand_name || 'Quick Car Midlands Ltd'}</h1>
                  <p style="margin: 10px 0 0; color: #fff;">Document Expiry Notification</p>
                </div>
                <div style="background: #f8f9fa; padding: 20px; border: 1px solid #e9e9e9; border-top: none; border-radius: 0 0 8px 8px;">
                  <p>Dear ${driver.driver_name || 'Driver'},</p>
                  <p>The following documents are expiring or have expired. Please renew them immediately to maintain your compliance status:</p>
                  <div style="background: #fff; border: 1px solid #e9e9e9; border-radius: 8px; padding: 15px; margin: 15px 0; white-space: pre-line; font-family: monospace; font-size: 13px;">
${docList}
                  </div>
                  <p style="color: #dc2626; font-weight: bold;">${driverItems.some(d => d.status === 'expired') ? '⚠️ Some documents have EXPIRED. You cannot accept new bookings until renewed.' : ''}</p>
                  <p>Log in to your driver portal to upload renewed documents: <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://quickcarmidlands.co.uk'}/driver/dashboard" style="color: #FFCC00;">Driver Dashboard</a></p>
                  <hr style="border-color: #e9e9e9; margin: 20px 0;">
                  <p style="font-size: 12px; color: #7B8091;">This is an automated notification. Please do not reply to this email.</p>
                </div>
              </div>
            `,
            text: `Document Expiry Alert\n\nThe following documents are expiring or have expired:\n${docList}\n\nPlease log in to your driver portal to upload renewed documents.`,
          });
          notificationsSent++;
        } catch (err: any) {
          console.error(`Failed to send expiry email to driver ${driver.id}:`, err.message);
          notificationsFailed++;
        }
      }
    }

    // Send summary to admin
    if (sendToAdmins) {
      try {
        const allItems: ExpiryItem[] = [];
        for (const driver of drivers) {
          const pcoDays = getDaysUntilExpiry(driver.pco_expiry);
          if (pcoDays <= threshold && pcoDays >= -30) {
            allItems.push({
              driverId: driver.id,
              driverName: driver.driver_name || "Unknown",
              driverEmail: driver.driver_email || "",
              documentType: 'pco',
              expiryDate: driver.pco_expiry || "",
              daysUntilExpiry: pcoDays,
              status: pcoDays < 0 ? 'expired' : pcoDays <= 7 ? 'expiring_soon' : 'warning',
            });
          }
          const insuranceDays = getDaysUntilExpiry(driver.insurance_expiry);
          if (insuranceDays <= threshold && insuranceDays >= -30) {
            allItems.push({
              driverId: driver.id,
              driverName: driver.driver_name || "Unknown",
              driverEmail: driver.driver_email || "",
              documentType: 'insurance',
              expiryDate: driver.insurance_expiry || "",
              daysUntilExpiry: insuranceDays,
              status: insuranceDays < 0 ? 'expired' : insuranceDays <= 7 ? 'expiring_soon' : 'warning',
            });
          }
          const motDays = getDaysUntilExpiry(driver.doc_phv_mot);
          if (motDays <= threshold && motDays >= -30) {
            allItems.push({
              driverId: driver.id,
              driverName: driver.driver_name || "Unknown",
              driverEmail: driver.driver_email || "",
              documentType: 'mot',
              expiryDate: driver.doc_phv_mot || "",
              daysUntilExpiry: motDays,
              status: motDays < 0 ? 'expired' : motDays <= 7 ? 'expiring_soon' : 'warning',
            });
          }
        }

        if (allItems.length > 0) {
          const summaryHtml = allItems.map(d =>
            `<tr>
              <td style="padding: 8px; border: 1px solid #e9e9e9;">${d.driverName}</td>
              <td style="padding: 8px; border: 1px solid #e9e9e9;">${d.documentType.toUpperCase()}</td>
              <td style="padding: 8px; border: 1px solid #e9e9e9;">${d.expiryDate}</td>
              <td style="padding: 8px; border: 1px solid #e9e9e9; color: ${d.status === 'expired' ? '#dc2626' : d.status === 'expiring_soon' ? '#f59e0b' : '#3b82f6'};">
                ${d.status === 'expired' ? 'EXPIRED' : `${d.daysUntilExpiry} days`}
              </td>
            </tr>`
          ).join('');

          await sendEmail({
            to: adminEmail,
            subject: `📋 Driver Document Expiry Summary - ${allItems.length} items`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #141720;">Driver Document Expiry Report</h2>
                <p><strong>Threshold:</strong> ${threshold} days | <strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                  <thead>
                    <tr style="background: #141720; color: #FFCC00;">
                      <th style="padding: 10px; border: 1px solid #e9e9e9; text-align: left;">Driver</th>
                      <th style="padding: 10px; border: 1px solid #e9e9e9; text-align: left;">Document</th>
                      <th style="padding: 10px; border: 1px solid #e9e9e9; text-align: left;">Expiry Date</th>
                      <th style="padding: 10px; border: 1px solid #e9e9e9; text-align: left;">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${summaryHtml}
                  </tbody>
                </table>
                <p style="margin-top: 20px; font-size: 14px; color: #7B8091;">
                  Expired: ${allItems.filter(i => i.status === 'expired').length} |
                  Expiring Soon (≤7 days): ${allItems.filter(i => i.status === 'expiring_soon').length} |
                  Warning (≤${threshold} days): ${allItems.filter(i => i.status === 'warning').length}
                </p>
              </div>
            `,
          });
        }
      } catch (err: any) {
        console.error("Failed to send admin summary email:", err.message);
      }
    }

    return NextResponse.json({
      status: true,
      message: `Notifications sent: ${notificationsSent}, Failed: ${notificationsFailed}`,
      notificationsSent,
      notificationsFailed,
    });
  } catch (error: any) {
    console.error("POST /api/admin/drivers/expiry-check error:", error.message);
    return NextResponse.json({ status: false, message: "Server error" }, { status: 500 });
  }
}