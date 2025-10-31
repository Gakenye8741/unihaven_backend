import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

type EmailType =
  | "welcome"
  | "verification"
  | "password-reset"
  | "alert"
  | "generic"
  | "suspension"
  | "unsuspension"
  | "ad-created"      // ✅ Added back
  | "ad-removed"      // ✅ Added back
  | "ad-expiring"     // ✅ Reminder
  | "ad-expired";     // ✅ Expired

// --------------------------- Reusable transporter ---------------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendNotificationEmail = async (
  email: string,
  subject: string,
  name: string | null,
  message: string,
  html?: string,
  type: EmailType = "generic"
): Promise<string> => {
  try {
    const themes = {
      welcome:    { emoji:"🎉", color:"#3E64FF",   gradient:"linear-gradient(90deg,#60A5FA,#3E64FF)",   title:"Welcome to UniHaven!" },
      verification:{ emoji:"💌", color:"#10B981",   gradient:"linear-gradient(90deg,#6EE7B7,#10B981)",   title:"Verify Your Account" },
      "password-reset":{ emoji:"🔐", color:"#F59E0B", gradient:"linear-gradient(90deg,#FCD34D,#F59E0B)", title:"Reset Your Password" },
      alert:       { emoji:"⚠️", color:"#DC2626",   gradient:"linear-gradient(90deg,#F87171,#DC2626)",   title:"Security Alert" },
      suspension:  { emoji:"🚫", color:"#B91C1C",   gradient:"linear-gradient(90deg,#EF4444,#B91C1C)",   title:"Account Suspended" },
      unsuspension:{ emoji:"✅", color:"#16A34A",   gradient:"linear-gradient(90deg,#4ADE80,#16A34A)",   title:"Account Restored" },

      // ✅ AD NOTIFICATIONS
      "ad-created":  { emoji:"📢", color:"#2563EB", gradient:"linear-gradient(90deg,#60A5FA,#2563EB)", title:"Your Ad Is Now Live!" },
      "ad-removed":  { emoji:"🗑️", color:"#DC2626", gradient:"linear-gradient(90deg,#F87171,#DC2626)", title:"An Ad Has Been Removed" },
      "ad-expiring": { emoji:"⏳", color:"#F59E0B", gradient:"linear-gradient(90deg,#FCD34D,#F59E0B)", title:"Your Ad Is Expiring Soon" },
      "ad-expired":  { emoji:"📛", color:"#B91C1C", gradient:"linear-gradient(90deg,#EF4444,#B91C1C)", title:"Your Ad Has Expired" },

      generic: { emoji:"💫", color:"#7C3AED", gradient:"linear-gradient(90deg,#C084FC,#7C3AED)", title:"Message from UniHaven" },
    };

    const theme = themes[type] || themes.generic;

    const defaultHtml = `
    <html>
      <body style="font-family:Poppins,Arial;background:#F9FAFB;margin:0;padding:0;">
        <div style="max-width:640px;margin:40px auto;background:#fff;border-radius:18px;overflow:hidden;border:1px solid #E5E7EB;">
          
          <div style="background:${theme.gradient};padding:26px;text-align:center;color:white;">
            <h1 style="margin:0;font-size:24px;">${theme.emoji} ${theme.title}</h1>
          </div>

          <div style="padding:30px;">
            <p style="font-size:16px;">Hi ${name || "there"},</p>
            <p style="font-size:15px;line-height:1.7;">${message}</p>
          </div>

          <div style="background:#F3F4F6;padding:20px;text-align:center;font-size:14px;color:#6B7280;">
            © ${new Date().getFullYear()} <strong style="color:${theme.color}">UniHaven</strong>
          </div>

        </div>
      </body>
    </html>
    `;

    const mailOptions = {
      from: `"UniHaven Notifications" <${process.env.EMAIL_SENDER}>`,
      to: email,
      subject,
      text: message,
      html: html || defaultHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    return info.accepted?.length ? "✅ Email sent" : "⚠️ Email not sent";
  } catch (error:any) {
    console.error("Email Error:", error);
    return `❌ Email error: ${error.message}`;
  }
};
