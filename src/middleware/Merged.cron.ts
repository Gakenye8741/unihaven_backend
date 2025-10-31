import cron from "node-cron";
import dotenv from "dotenv";
dotenv.config();

import { ads, TSelectUser } from "../drizzle/schema";
import { getAllUsers, unsuspendUser } from "../services/Users/users.service";
import { processAdExpiryCron } from "../services/Advertiser/Advertiser.service";
import { sendNotificationEmail } from "./GoogleMailer";
import db from "../drizzle/db";
import { eq } from "drizzle-orm";

const CLIENT_URL = process.env.CLIENT_URL || "https://unihaven.app";

// ---------------------------- Cron Job ----------------------------
// Runs every minute (or change to every hour/day if preferred)
cron.schedule("* * * * *", async () => {
  const now = new Date();
  console.log(`⏱️ Cron running @ ${now.toISOString()}`);

  // ------------------------- User Unsuspension -------------------------
  try {
    const users: TSelectUser[] = await getAllUsers();

    for (const user of users) {
      if (user.isSuspended && user.suspendedUntil && new Date(user.suspendedUntil) <= now) {
        console.log(`🔓 Unsuspending user: ${user.username} (id: ${user.id})`);

        try {
          const updatedUser = await unsuspendUser(user.id);
          if (!updatedUser) continue;

          const subject = "🎉 Welcome Back! Your UniHaven Account Is Active Again";
          const htmlMessage = `
            <html>
              <body style="font-family:'Poppins',Arial,sans-serif;background:#F3F4F6;padding:36px;">
                <div style="max-width:620px;margin:auto;background:white;border-radius:18px;padding:32px;box-shadow:0 4px 14px rgba(0,0,0,0.09);">
                  <h2 style="color:#4F46E5;font-size:22px;margin-bottom:8px;">🎉 Account Reinstated</h2>
                  <p style="font-size:15px;color:#333;">Hi <strong>${updatedUser.username}</strong>,</p>
                  <p style="color:#555;font-size:14px;line-height:1.7;">
                    Great news! Your UniHaven account has been successfully reinstated. 
                    You can now log in, search for hostels, post listings, and continue connecting with the student community.
                  </p>
                  <a href="${CLIENT_URL}/login" style="display:inline-block;margin-top:22px;padding:12px 22px;background:#4F46E5;color:white;text-decoration:none;border-radius:10px;font-weight:500;">
                    Log In to UniHaven
                  </a>
                  <hr style="margin:28px 0;border:none;border-top:1px solid #E1E4FF;">
                  <p style="font-size:12px;color:#777;">
                    💜 UniHaven Team<br/>
                    &copy; ${new Date().getFullYear()} UniHaven
                  </p>
                </div>
              </body>
            </html>
          `;

          await sendNotificationEmail(
            updatedUser.email,
            subject,
            updatedUser.username,
            htmlMessage,
            htmlMessage,
            "unsuspension"
          );
          console.log(`✅ Unsuspension email sent to ${updatedUser.email}`);
        } catch (err) {
          console.error(`❌ Failed to unsuspend user ${user.username}`, err);
        }
      }
    }
  } catch (err) {
    console.error("💥 User unsuspension cron error:", err);
  }

  // ------------------------- Ad Expiry & Reminder -------------------------
  try {
    const { expired, expiringSoon } = await processAdExpiryCron();

    // Handle expired ads
    for (const ad of expired) {
      if (!ad?.advertiserEmail) continue;

      console.log(`❌ Disabling expired ad: ${ad.title} (ID: ${ad.id})`);

      const subject = `📛 Your Ad "${ad.title}" Has Expired`;
      const htmlMessage = `
        <html>
          <body style="font-family:'Poppins',Arial,sans-serif;background:#F3F4F6;padding:36px;">
            <div style="max-width:620px;margin:auto;background:white;border-radius:18px;padding:32px;box-shadow:0 4px 14px rgba(0,0,0,0.09);">
              <h2 style="color:#DC2626;font-size:22px;margin-bottom:8px;">⛔ Ad Expired</h2>
              <p style="font-size:15px;color:#333;">Hi <strong>${ad.advertiserName || "Advertiser"}</strong>,</p>
              <p style="color:#555;font-size:14px;line-height:1.7;">
                Your ad "<strong>${ad.title}</strong>" has expired and is no longer visible on UniHaven.
                Renew it now to continue reaching students looking for hostels.
              </p>
              <a href="${CLIENT_URL}/advertiser/ads" style="display:inline-block;margin-top:22px;padding:12px 22px;background:#DC2626;color:white;text-decoration:none;border-radius:10px;font-weight:500;">
                Renew Ad
              </a>
              <hr style="margin:28px 0;border:none;border-top:1px solid #E1E4FF;">
              <p style="font-size:12px;color:#777;">
                💜 UniHaven Team<br/>
                &copy; ${new Date().getFullYear()} UniHaven
              </p>
            </div>
          </body>
        </html>
      `;

      await sendNotificationEmail(
        ad.advertiserEmail,
        subject,
        ad.advertiserName ?? null,
        htmlMessage,
        htmlMessage,
        "ad-expired"
      );
      console.log(`✅ Expired email sent to ${ad.advertiserEmail}`);
    }

    // Handle ads expiring soon (first reminder at 3 days + daily reminders)
    for (const ad of expiringSoon) {
      if (!ad?.advertiserEmail) continue;

      console.log(`⏳ Reminder: Ad expiring soon: ${ad.title} (ID: ${ad.id})`);

      const subject = `⏳ Your Ad "${ad.title}" Expires Soon`;
      const htmlMessage = `
        <html>
          <body style="font-family:'Poppins',Arial,sans-serif;background:#F3F4F6;padding:36px;">
            <div style="max-width:620px;margin:auto;background:white;border-radius:18px;padding:32px;box-shadow:0 4px 14px rgba(0,0,0,0.09);">
              <h2 style="color:#F59E0B;font-size:22px;margin-bottom:8px;">⏳ Ad Expiring Soon</h2>
              <p style="font-size:15px;color:#333;">Hi <strong>${ad.advertiserName || "Advertiser"}</strong>,</p>
              <p style="color:#555;font-size:14px;line-height:1.7;">
                Your ad "<strong>${ad.title}</strong>" will expire soon.
                Renew now to keep attracting students to your hostel listing.
              </p>
              <a href="${CLIENT_URL}/advertiser/ads" style="display:inline-block;margin-top:22px;padding:12px 22px;background:#F59E0B;color:white;text-decoration:none;border-radius:10px;font-weight:500;">
                Renew Ad
              </a>
              <hr style="margin:28px 0;border:none;border-top:1px solid #E1E4FF;">
              <p style="font-size:12px;color:#777;">
                💜 UniHaven Team<br/>
                &copy; ${new Date().getFullYear()} UniHaven
              </p>
            </div>
          </body>
        </html>
      `;

      await sendNotificationEmail(
        ad.advertiserEmail,
        subject,
        ad.advertiserName ?? null,
        htmlMessage,
        htmlMessage,
        "ad-expiring"
      );

      // Update lastReminderSentAt to prevent multiple reminders in a day
      await db.update(ads).set({ lastReminderSentAt: now }).where(eq(ads.id, ad.id));

      console.log(`✅ Reminder email sent to ${ad.advertiserEmail}`);
    }

    console.log(`✔️ Ad Cron Complete — Expired: ${expired.length}, Reminders: ${expiringSoon.length}`);
  } catch (err) {
    console.error("💥 Ad cron error:", err);
  }
});
