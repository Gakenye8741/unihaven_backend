import { Request, Response } from "express";
import {
  getAllUsers,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
  suspendUser,
  unsuspendUser,
  isUserActive,
} from "../Users/users.service";
import { sendNotificationEmail } from "../../middleware/GoogleMailer";
import { userValidator } from "../../validators/Users.Validator";

// ========================== GET ALL USERS ==========================
export const getAllUsersController = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    if (!users?.length) {
      return res.status(404).json({ error: "No users found" });
    }
    res.status(200).json({ count: users.length, data: users });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch users" });
  }
};

// ========================== GET USER BY ID ==========================
export const getUserController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const user = await getUserById(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json({ data: user });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch user" });
  }
};

// ========================== GET USER BY EMAIL ==========================
export const getUserByEmailController = async (req: Request, res: Response) => {
  try {
    const email = req.query.email;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await getUserByEmail(email);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ data: user });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch user by email" });
  }
};

// ========================== UPDATE USER ==========================
export const updateUserController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const parsed = userValidator.partial().safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const updatedUser = await updateUser(id, parsed.data);
    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ message: "User updated successfully", data: updatedUser });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update user" });
  }
};

// ========================== DELETE USER ==========================
export const deleteUserController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const deletedUser = await deleteUser(id);
    if (!deletedUser) return res.status(404).json({ error: "User not found" });

    // Send UniHaven account deletion email
    const subject = "🗑️ UniHaven Account Deleted";
    const message = `
      <html>
        <body>
          <p>Hi ${deletedUser.username},</p>
          <p>Your UniHaven account has been permanently deleted. We're sorry to see you go!</p>
        </body>
      </html>
    `;
    await sendNotificationEmail(deletedUser.email, subject, deletedUser.username, message, message, "alert");

    res.status(200).json({ message: "User deleted and email sent", data: deletedUser });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete user" });
  }
};

// ========================== SUSPEND USER ==========================
export const suspendUserController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { until } = req.body;

    if (!until) return res.status(400).json({ error: "Suspension 'until' date is required" });

    const suspensionDate = new Date(until);
    if (suspensionDate <= new Date()) {
      return res.status(400).json({ error: "Suspension date must be in the future" });
    }

    const updatedUser = await suspendUser(id, suspensionDate);
    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    const diffMs = suspensionDate.getTime() - new Date().getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);

    const formattedDate = suspensionDate.toLocaleString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true
    });

    const subject = "⚠️ UniHaven Account Suspended";
    const message = `<html><body><p>Hi ${updatedUser.username},</p>
      <p>Your UniHaven account is suspended until ${formattedDate} (~${diffDays}d ${diffHours}h ${diffMinutes}m).</p>
      </body></html>`;
    await sendNotificationEmail(updatedUser.email, subject, updatedUser.username, message, message, "alert");

    res.status(200).json({ message: "User suspended successfully and email sent", data: updatedUser });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to suspend user" });
  }
};

// ========================== UNSUSPEND USER ==========================
export const unsuspendUserController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const updatedUser = await unsuspendUser(id);

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    const subject = "🎉 UniHaven Account Reinstated";
    const message = `<html><body>
      <p>Hi ${updatedUser.username},</p>
      <p>Your UniHaven account is now active again. Welcome back!</p>
      </body></html>`;
    await sendNotificationEmail(updatedUser.email, subject, updatedUser.username, message, message, "generic");

    res.status(200).json({ message: "User unsuspended successfully and email sent", data: updatedUser });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to unsuspend user" });
  }
};

// ========================== CHECK USER STATUS ==========================
export const checkUserStatusController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const user = await getUserById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const active = isUserActive(user as any);
    res.status(200).json({ active });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to check user status" });
  }
};
