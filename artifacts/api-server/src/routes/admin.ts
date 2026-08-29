import { Router } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { appUsers, chatChannels, forumPosts, forumThreads, moderationActions, moderationReports } from "@workspace/db/schema";
import { CLEARANCES, ROLES, requireRole, requireUser } from "../middlewares/auth";

const router = Router();
const adminOnly = [requireUser, requireRole("OWNER", "ADMIN")];
const staffOrAdmin = [requireUser, requireRole("OWNER", "ADMIN", "MODERATOR", "STAFF")];

router.get("/admin/overview", ...adminOnly, async (_req, res, next) => {
  try {
    const [users, threads, posts, reports, channels] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(appUsers),
      db.select({ count: sql<number>`count(*)` }).from(forumThreads),
      db.select({ count: sql<number>`count(*)` }).from(forumPosts),
      db.select({ count: sql<number>`count(*)` }).from(moderationReports).where(eq(moderationReports.status, "OPEN")),
      db.select({ count: sql<number>`count(*)` }).from(chatChannels).where(eq(chatChannels.isArchived, false)),
    ]);
    res.json({ users: Number(users[0].count), threads: Number(threads[0].count), posts: Number(posts[0].count), openReports: Number(reports[0].count), channels: Number(channels[0].count) });
  } catch (error) {
    return next(error);
  }
});

router.get("/admin/users", ...adminOnly, async (_req, res, next) => {
  try {
    const users = await db.select().from(appUsers).orderBy(desc(appUsers.createdAt)).limit(500);
    res.json(users.map(({ clerkUserId: _clerkUserId, ...user }) => user));
  } catch (error) {
    return next(error);
  }
});

router.patch("/admin/users/:id", ...adminOnly, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const role = typeof req.body?.role === "string" ? req.body.role.toUpperCase() : undefined;
    const clearanceLevel = typeof req.body?.clearanceLevel === "string" ? req.body.clearanceLevel.toUpperCase() : undefined;
    const status = typeof req.body?.status === "string" ? req.body.status.toUpperCase() : undefined;
    if (role && !ROLES.includes(role as (typeof ROLES)[number])) return res.status(400).json({ error: "Invalid role" });
    if (clearanceLevel && !CLEARANCES.includes(clearanceLevel as (typeof CLEARANCES)[number])) return res.status(400).json({ error: "Invalid clearance" });
    if (status && !["ACTIVE", "SUSPENDED", "BANNED"].includes(status)) return res.status(400).json({ error: "Invalid status" });
    if (id === req.currentUser!.id && status && status !== "ACTIVE") return res.status(400).json({ error: "You cannot deactivate your own account" });
    const [updated] = await db.update(appUsers).set({ ...(role ? { role } : {}), ...(clearanceLevel ? { clearanceLevel } : {}), ...(status ? { status } : {}) }).where(eq(appUsers.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "User not found" });
    await db.insert(moderationActions).values({ moderatorId: req.currentUser!.id, action: "UPDATE_USER_ACCESS", targetType: "user", targetId: id, metadata: { role, clearanceLevel, status } });
    const { clerkUserId: _clerkUserId, ...safe } = updated;
    res.json(safe);
  } catch (error) {
    return next(error);
  }
});

router.get("/admin/reports", ...staffOrAdmin, async (_req, res, next) => {
  try {
    const reports = await db.select({ report: moderationReports, reporter: appUsers })
      .from(moderationReports).innerJoin(appUsers, eq(appUsers.id, moderationReports.reporterId))
      .orderBy(desc(moderationReports.createdAt)).limit(300);
    res.json(reports.map(({ report, reporter }) => ({ ...report, reporter: { id: reporter.id, displayName: reporter.displayName } })));
  } catch (error) {
    return next(error);
  }
});

router.patch("/admin/reports/:id", ...staffOrAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const status = typeof req.body?.status === "string" ? req.body.status.toUpperCase() : "RESOLVED";
    if (!["OPEN", "REVIEWING", "RESOLVED", "DISMISSED"].includes(status)) return res.status(400).json({ error: "Invalid report status" });
    const [updated] = await db.update(moderationReports).set({ status, assignedToId: req.currentUser!.id, resolution: typeof req.body?.resolution === "string" ? req.body.resolution.slice(0, 1000) : null, resolvedAt: ["RESOLVED", "DISMISSED"].includes(status) ? new Date() : null }).where(eq(moderationReports.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Report not found" });
    await db.insert(moderationActions).values({ moderatorId: req.currentUser!.id, action: `REPORT_${status}`, targetType: "report", targetId: id, reason: updated.resolution ?? undefined });
    res.json(updated);
  } catch (error) {
    return next(error);
  }
});

router.patch("/admin/threads/:id", ...staffOrAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const allowed = ["isPinned", "isLocked", "isArchived"] as const;
    const changes = Object.fromEntries(allowed.filter((key) => typeof req.body?.[key] === "boolean").map((key) => [key, req.body[key]]));
    const [updated] = await db.update(forumThreads).set(changes).where(eq(forumThreads.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Thread not found" });
    await db.insert(moderationActions).values({ moderatorId: req.currentUser!.id, action: "UPDATE_THREAD", targetType: "thread", targetId: id, metadata: changes });
    res.json(updated);
  } catch (error) {
    return next(error);
  }
});

router.delete("/admin/posts/:id", ...staffOrAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [updated] = await db.update(forumPosts).set({ isDeleted: true, body: "[Removed by moderation]" }).where(eq(forumPosts.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Post not found" });
    await db.insert(moderationActions).values({ moderatorId: req.currentUser!.id, action: "DELETE_POST", targetType: "post", targetId: id });
    res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
});

export default router;