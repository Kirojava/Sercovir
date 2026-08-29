import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { appUsers } from "@workspace/db/schema";
import { requireUser } from "../middlewares/auth";

const router = Router();

router.get("/auth/me", requireUser, (req, res) => {
  const user = req.currentUser!;
  res.json({
    id: user.id,
    clerkUserId: user.clerkUserId,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    clearanceLevel: user.clearanceLevel,
    status: user.status,
  });
});

router.patch("/auth/profile", requireUser, async (req, res, next) => {
  try {
    const displayName = typeof req.body?.displayName === "string" ? req.body.displayName.trim().slice(0, 80) : "";
    if (displayName.length < 2) return res.status(400).json({ error: "Display name must be at least 2 characters" });
    const [updated] = await db.update(appUsers).set({ displayName }).where(eq(appUsers.id, req.currentUser!.id)).returning();
    res.json(updated);
  } catch (error) {
    return next(error);
  }
});

export default router;