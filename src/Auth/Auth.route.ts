import { Router } from "express";
import {
  registerUser,
  loginUser,
  emailVerification,
  resendVerificationEmail,
} from "../Auth/Auth.controller";

const AuthRouter = Router();

// --------------------------- AUTH ROUTES ---------------------------

// POST /auth/register
// Register a new user
AuthRouter.post("/register", registerUser);

// POST /auth/login
// Login a user
AuthRouter.post("/login", loginUser);

// POST /auth/verify-email
// Verify user's email using the confirmation code
AuthRouter.post("/verify-email", emailVerification);

// POST /auth/resend-verification
// Resend a new verification email
AuthRouter.post("/resend-verification", resendVerificationEmail);

export default AuthRouter;
