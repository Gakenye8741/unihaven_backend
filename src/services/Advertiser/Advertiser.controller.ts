import { Request, Response } from "express";
import {
  createAdvertiser,
  updateAdvertiser,
  getAdvertiserById,
  deleteAdvertiser,
  createAd,
  updateAd,
  getAdById,
  getAdsByAdvertiser,
  deleteAd,
  updateAdMetrics,
  getAdMetrics,
  processAdExpiryCron,
  getAllAdvertisers
} from "../../services/Advertiser/Advertiser.service";

import { sendNotificationEmail } from "../../middleware/GoogleMailer";

/* =========================================================
   ✨ GLOBAL DETAILED EMAIL TEMPLATE
========================================================= */
const buildEmailTemplate = (
  title: string,
  username: string,
  body: string,
  buttonText?: string,
  buttonLink?: string
) => `
<html>
<body style="font-family:'Poppins',Arial,sans-serif;background:#F5F7FF;padding:36px;line-height:1.6;color:#333;">
<div style="max-width:640px;margin:auto;background:white;border-radius:18px;padding:32px;box-shadow:0 6px 18px rgba(0,0,0,0.08);">

<h2 style="color:#4F46E5;font-size:26px;margin-bottom:12px;">${title}</h2>

<p style="font-size:16px;">Hello <strong>${username}</strong>,</p>

<div style="font-size:14px;color:#555;margin:16px 0;">
${body}
</div>

${
  buttonText && buttonLink
    ? `<div style="text-align:center;margin:28px 0;">
      <a href="${buttonLink}"
         style="display:inline-block;padding:14px 28px;background:#4F46E5;color:white;text-decoration:none;border-radius:12px;font-weight:600;font-size:16px;">
        ${buttonText}
      </a>
    </div>`
    : ""
}

<hr style="margin:32px 0;border:none;border-top:1px solid #E1E4FF;">

<div style="font-size:13px;color:#555;">
  <p style="margin-bottom:8px;">💡 Tips & Next Steps:</p>
  <ul style="padding-left:20px;margin:0;">
    <li>Log in to your dashboard to manage your ads efficiently.</li>
    <li>Track views, clicks, and engagement for each ad.</li>
    <li>Ensure your ads are up-to-date and renew expiring listings on time.</li>
    <li>Reach thousands of students looking for housing every day!</li>
  </ul>
</div>

<p style="font-size:12px;color:#777;margin-top:24px;">
💜 UniHaven Team<br/>
&copy; ${new Date().getFullYear()} UniHaven. All rights reserved.
</p>

</div>
</body>
</html>
`;

/* =========================================================
   ✅ ADVERTISER CONTROLLERS
========================================================= */
export const createAdvertiserController = async (req: Request, res: Response) => {
  try {
    const result = await createAdvertiser(req.body);
    const advertiser = result.data;

    if (advertiser?.email) {
      const html = buildEmailTemplate(
        "🎉 Welcome to UniHaven Advertising!",
        advertiser.businessName ?? "Advertiser",
        `
Welcome aboard! 🎓🏠  

Your advertiser account has been successfully created.  

You can now:  
✅ Publish ads to reach students  
✅ Track engagement & performance metrics  
✅ Manage and renew your listings easily  
        `,
        "Go to Dashboard",
        "https://unihaven.app/dashboard"
      );

      await sendNotificationEmail(
        advertiser.email,
        "✨ Welcome to UniHaven Ads",
        advertiser.businessName ?? "Advertiser",
        "",
        html,
        "welcome"
      );
    }

    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const updateAdvertiserController = async (req: Request, res: Response) => {
  try {
    const result = await updateAdvertiser(req.params.id, req.body);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteAdvertiserController = async (req: Request, res: Response) => {
  try {
    const result = await deleteAdvertiser(req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================================================
   ✅ AD CONTROLLERS
========================================================= */
export const createAdController = async (req: Request, res: Response) => {
  try {
    // Convert endDate string to Date object if present
    if (req.body.endDate) {
      req.body.endDate = new Date(req.body.endDate);
    }

    const result = await createAd(req.body);
    const ad = result.data;

    const advertiser = await getAdvertiserById(ad.advertiserId);
    const email = advertiser?.data?.email;
    const name = advertiser?.data?.businessName ?? "Advertiser";

    if (email) {
      const html = buildEmailTemplate(
        "📢 Your Ad Is Live!",
        name,
        `
Congratulations! Your ad "<strong>${ad.title}</strong>" is now live on UniHaven. 🎉  

Next steps:  
✅ Track impressions and clicks  
✅ Update details or images for better engagement  
✅ Renew your ad before expiry to keep attracting students  
        `,
        "View My Ads",
        "https://unihaven.app/dashboard/ads"
      );

      await sendNotificationEmail(email, "✅ Ad is Live!", name, "", html, "ad-created");
    }

    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteAdController = async (req: Request, res: Response) => {
  try {
    const result = await deleteAd(req.params.id);
    const ad = result.data;

    const advertiser = await getAdvertiserById(ad.advertiserId);
    const email = advertiser?.data?.email;
    const name = advertiser?.data?.businessName ?? "Advertiser";

    if (email) {
      const html = buildEmailTemplate(
        "🗑️ Ad Removed",
        name,
        `
Your ad "<strong>${ad.title}</strong>" has been removed from UniHaven.  

If this was accidental, you can republish or create a new ad to continue reaching students.  
        `,
        "Manage Ads",
        "https://unihaven.app/dashboard/ads"
      );

      await sendNotificationEmail(email, "❌ Ad Removed", name, "", html, "ad-removed");
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================================================
   📈 AD METRICS
========================================================= */
export const updateAdMetricsController = async (req: Request, res: Response) => {
  try {
    const result = await updateAdMetrics(req.params.adId, req.body);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getAdMetricsController = async (req: Request, res: Response) => {
  try {
    const result = await getAdMetrics(req.params.adId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================================================
   🕒 CRON: EXPIRED & EXPIRING EMAIL ACTIONS
========================================================= */
export const processAdsCronController = async (_req: Request, res: Response) => {
  try {
    const { expired, expiringSoon } = await processAdExpiryCron();

    // ✅ Send expiry emails
    for (const ad of expired) {
      if (ad.advertiserEmail) {
        const html = buildEmailTemplate(
          "⛔ Your Ad Has Expired",
          ad.advertiserName ?? "Advertiser",
          `
Your ad "<strong>${ad.title}</strong>" has expired and is no longer visible.  

Next Steps:  
✅ Review ad performance  
✅ Renew your ad to continue attracting students  
✅ Update any details to improve engagement  
        `,
          "Renew Ad",
          "https://unihaven.app/dashboard/ads"
        );

        await sendNotificationEmail(
          ad.advertiserEmail,
          "⚠️ Your Ad Expired",
          ad.advertiserName ?? "Advertiser",
          "",
          html,
          "ad-expired"
        );
      }
    }

    // ✅ Send reminder emails
    for (const ad of expiringSoon) {
      if (ad.advertiserEmail) {
        const html = buildEmailTemplate(
          "⏳ Your Ad Will Expire Soon",
          ad.advertiserName ?? "Advertiser",
          `
Heads up! Your ad "<strong>${ad.title}</strong>" will expire in 3 days.  

What to do next:  
✅ Renew your ad early to maintain visibility  
✅ Update your listing to increase engagement  
✅ Plan your next ad campaign for maximum reach  
        `,
          "Renew Ad",
          "https://unihaven.app/dashboard/ads"
        );

        await sendNotificationEmail(
          ad.advertiserEmail,
          "⏳ Ad Expiry Reminder",
          ad.advertiserName ?? "Advertiser",
          "",
          html,
          "ad-expiring"
        );
      }
    }

    res.json({ expired, expiringSoon });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllAdvertisersController = async (_req: Request, res: Response) => {
  try {
    const result = await getAllAdvertisers();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
