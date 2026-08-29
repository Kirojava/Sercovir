import { clerkClient, getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";
import { eq, sql } from "drizzle-orm";
import { appUsers } from "@workspace/db/schema";
import { db } from "@workspace/db";

export const ROLES = ["OWNER", "ADMIN", "MODERATOR", "STAFF", "PREMIUM", "NORMAL"] as const;
export type Role = (typeof ROLES)[number];
export const CLEARANCES = ["CL1", "CL2", "CL3", "CL4", "CL5"] as const;
export type Clearance = (typeof CLEARANCES)[number];
export const PRIVILEGED_ROLES: Role[] = ["OWNER", "ADMIN", "MODERATOR", "STAFF"];

declare global {
  namespace Express {
    interface Request {
      currentUser?: typeof appUsers.$inferSelect;
    }
  }
}

export function clearanceRank(level: string): number {
  const rank = CLEARANCES.indexOf(level as Clearance);
  return rank < 0 ? CLEARANCES.length : rank;
}

export function canAccessContent(user: typeof appUsers.$inferSelect, required: string): boolean {
  return PRIVILEGED_ROLES.includes(user.role as Role) || clearanceRank(user.clearanceLevel) <= clearanceRank(required);
}

function currentUserId(req: Request): string | null {
  try {
    return getAuth(req).userId ?? null;
  } catch {
    return null;
  }
}

async function syncCurrentUser(userId: string) {
  const existing = await db.select().from(appUsers).where(eq(appUsers.clerkUserId, userId)).limit(1);
  if (existing[0]) {
    await db.update(appUsers).set({ lastSeenAt: new Date() }).where(eq(appUsers.id, existing[0].id));
    return { ...existing[0], lastSeenAt: new Date() };
  }

  let displayName = `Operator ${userId.slice(-6).toUpperCase()}`;
  let email: string | null = null;
  let avatarUrl: string | null = null;
  try {
    const client = clerkClient;
    const clerkUser = await client.users.getUser(userId);
    displayName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.username || displayName;
    email = clerkUser.primaryEmailAddress?.emailAddress ?? null;
    avatarUrl = clerkUser.imageUrl ?? null;
  } catch {
    // A user row still makes the app usable if Clerk's user lookup is briefly unavailable.
  }

  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(appUsers);
  const role = Number(count) === 0 ? "OWNER" : "NORMAL";
  const [created] = await db.insert(appUsers).values({ clerkUserId: userId, displayName, email, avatarUrl, role }).returning();
  return created;
}

export async function optionalUser(req: Request, _res: Response, next: NextFunction) {
  const userId = currentUserId(req);
  if (userId) req.currentUser = await syncCurrentUser(userId);
  next();
}

export async function requireUser(req: Request, res: Response, next: NextFunction) {
  const userId = currentUserId(req);
  if (!userId) return res.status(401).json({ error: "Authentication required" });
  try {
    req.currentUser = await syncCurrentUser(userId);
    if (req.currentUser.status !== "ACTIVE") return res.status(403).json({ error: "Account is not active" });
    return next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.currentUser || !roles.includes(req.currentUser.role as Role)) {
      return res.status(403).json({ error: "Insufficient authorization" });
    }
    return next();
  };
}

export function requireClearance(level: Clearance) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.currentUser || !canAccessContent(req.currentUser, level)) {
      return res.status(403).json({ error: `Clearance ${level} required` });
    }
    return next();
  };
}