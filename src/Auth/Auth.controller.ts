import { RequestHandler } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  getUserByEmailService,
  registerUserService,
  updateVerificationStatusService,
  generateAndSetNewConfirmationCode,
} from "./Auth.service";
import { registerUserValidator, loginUserValidator } from "../validators/Auth.validators";
import { sendNotificationEmail } from "../middleware/GoogleMailer";
import { TInsertUser } from "../drizzle/schema";

// --------------------------- HELPERS ---------------------------
const getJWTSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined!");
  return secret;
};

// 🌈 UniHaven Email Template
const baseEmailTemplate = (
  title: string,
  message: string,
  buttonText?: string,
  buttonLink?: string
) => `
<html>
  <body style="font-family:'Poppins',Arial,sans-serif;background-color:#F5F5F5;padding:40px;">
    <div style="max-width:640px;margin:auto;background:#fff;padding:32px;border-radius:18px;text-align:center;box-shadow:0 4px 14px rgba(0,0,0,0.08);">

      <h2 style="margin-bottom:20px;color:#3E64FF;">${title}</h2>

      <p style="font-size:15px;line-height:1.6;color:#333;">${message}</p>

      ${
        buttonText && buttonLink
          ? `<a href="${buttonLink}" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#3E64FF;color:white;border-radius:10px;text-decoration:none;font-weight:500;">${buttonText}</a>`
          : ""
      }

      <hr style="margin:30px 0;border:none;border-top:1px solid #ccc;">

      <p style="font-size:14px;color:#666;line-height:1.6;">
        💜 With love,<br><strong>The UniHaven Team</strong><br>&copy; ${new Date().getFullYear()} UniHaven<br>
        Find the perfect hostel, connect with students, and make your campus life easier!
      </p>

    </div>
  </body>
</html>
`;

// --------------------------- REGISTER ---------------------------
export const registerUser: RequestHandler = async (req, res) => {
  try {
    const parseResult = registerUserValidator.safeParse(req.body);
    if (!parseResult.success)
      return res.status(400).json({ error: parseResult.error.issues });

    const userData = parseResult.data;
    const existingUser = await getUserByEmailService(userData.email);
    if (existingUser) return res.status(400).json({ error: "User already exists 💌" });

    const hashedPassword = await bcrypt.hash(userData.passwordHash || "", 10);
    const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const confirmationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const validRoles = ["STUDENT", "REGULAR", "CREATOR", "MODERATOR", "ADMIN"];
    const role = validRoles.includes(userData.role || "") ? userData.role : "STUDENT";

    const newUserPayload: TInsertUser = {
      username: userData.username,
      fullName: userData.fullName,
      email: userData.email,
      passwordHash: hashedPassword,
      phone: userData.phone ?? null,
      nationalId: userData.nationalId ?? null,
      schoolRegNo: userData.schoolRegNo ?? null,
      role,
      gender: userData.gender ?? null,
      bio: userData.bio ?? null,
      avatarUrl: userData.avatarUrl ?? null,
      coverPhotoUrl: userData.coverPhotoUrl ?? null,
      confirmationCode,
      confirmationCodeExpiresAt,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newUser = await registerUserService(newUserPayload);

    // ✉️ Send Verification Email
    const subject = "💌 Welcome to UniHaven — Verify Your Email";
    const message = `
      Hey <strong>${userData.username}</strong>, welcome to <strong>UniHaven</strong>! 🎓<br><br>
      UniHaven helps students find the perfect hostels, connect with roommates, and navigate campus life easily.<br><br>
      To activate your account, use the 6-digit verification code below (valid for <strong>10 minutes</strong>):
      <div style="font-size:36px;font-weight:bold;color:#3E64FF;margin:20px 0;">${confirmationCode}</div>
      Enter this code in the app to start discovering hostels and connecting with other students 💜
    `;
    const html = baseEmailTemplate("Welcome to UniHaven 💜", message);

    await sendNotificationEmail(userData.email, subject, userData.username, html);

    res.status(201).json({
      message: `User registered successfully as ${role}. Please verify your email 💌`,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ error: error.message || "Failed to register user" });
  }
};

// --------------------------- LOGIN ---------------------------
export const loginUser: RequestHandler = async (req, res) => {
  try {
    const parseResult = loginUserValidator.safeParse(req.body);
    if (!parseResult.success)
      return res.status(400).json({ error: parseResult.error.issues });

    const { email, passwordHash } = parseResult.data;
    const user = await getUserByEmailService(email);
    if (!user) return res.status(404).json({ error: "User not found 💌" });

    if (!user.emailVerified)
      return res.status(403).json({ error: "Please verify your email first 💌" });

    const passwordValid = await bcrypt.compare(passwordHash || "", user.passwordHash || "");
    if (!passwordValid) return res.status(401).json({ error: "Incorrect password 🔐" });

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
    };

    // ✅ Updated token expiration to 7 days
    const token = jwt.sign(payload, getJWTSecret(), { expiresIn: "7d" });

    res.status(200).json({
      message: "Welcome back to UniHaven 💜",
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Login failed" });
  }
};

// --------------------------- EMAIL VERIFICATION ---------------------------
export const emailVerification: RequestHandler = async (req, res) => {
  try {
    const { email, confirmationCode } = req.body;
    const user = await getUserByEmailService(email);
    if (!user) return res.status(404).json({ error: "User not found 💌" });

    if (user.confirmationCode !== confirmationCode)
      return res.status(400).json({ error: "Invalid verification code ⏰" });

    if (user.confirmationCodeExpiresAt && new Date() > new Date(user.confirmationCodeExpiresAt))
      return res.status(400).json({ error: "Verification code expired ⏰. Request a new one." });

    await updateVerificationStatusService(user.email, true, null);

    const subject = "🎉 Your Email is Verified — Welcome to UniHaven!";
    const message = `
      Hi <strong>${user.username}</strong>, your email has been successfully verified 💜<br>
      You can now log in and start finding hostels, connecting with students, and making your campus life easier!
    `;
    const html = baseEmailTemplate(
      "Email Verified Successfully 💌",
      message,
      "Go to UniHaven",
      `${process.env.FRONTEND_URL}login`
    );

    await sendNotificationEmail(user.email, subject, user.username, html);
    res.status(200).json({ message: "Email verified successfully 💜" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Email verification failed" });
  }
};

// --------------------------- RESEND VERIFICATION EMAIL ---------------------------
export const resendVerificationEmail: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required 💌" });

    const user = await getUserByEmailService(email);
    if (!user) return res.status(404).json({ error: "User not found 💌" });
    if (user.emailVerified)
      return res.status(400).json({ error: "Email already verified ✅" });

    const newCode = await generateAndSetNewConfirmationCode(email);

    const subject = "🔁 New Verification Code for UniHaven";
    const message = `
      Hey <strong>${user.username}</strong>,<br>
      Here's your new 6-digit verification code (valid for <strong>10 minutes</strong>):<br>
      <div style="font-size:36px;font-weight:bold;color:#3E64FF;margin:20px 0;">${newCode}</div>
      Verify your email to start finding the best hostels and connecting with students 💜
    `;
    const html = baseEmailTemplate("Your New Verification Code 💫", message);

    await sendNotificationEmail(email, subject, user.username, html);
    res.status(200).json({ message: "Verification email resent successfully 💌" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to resend verification email" });
  }
};
