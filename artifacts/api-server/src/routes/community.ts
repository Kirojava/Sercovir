import { Router } from "express";
import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  appUsers,
  chatChannels,
  chatMessages,
  forumCategories,
  forumPosts,
  forumThreads,
  moderationReports,
} from "@workspace/db/schema";
import { canAccessContent, requireUser } from "../middlewares/auth";

const router = Router();

const defaultCategories = [
  ["General Assembly", "general-assembly", "Open discussion for global affairs and MUN preparation."],
  ["Intelligence Exchange", "intelligence-exchange", "Share sources, analysis, and links with other delegates."],
  ["Crisis Rooms", "crisis-rooms", "Fast-moving discussion for active crisis simulations."],
  ["Policy & Resolutions", "policy-resolutions", "Drafting, review, and voting strategy."],
];

async function ensureDefaults() {
  const categories = await db.select().from(forumCategories).orderBy(asc(forumCategories.sortOrder));
  if (!categories.length) {
    await db.insert(forumCategories).values(defaultCategories.map(([name, slug, description], index) => ({ name, slug, description, sortOrder: index })));
  }
  const channels = await db.select().from(chatChannels);
  if (!channels.length) {
    await db.insert(chatChannels).values([
      { name: "Commons", slug: "commons", description: "Open chat for all active operators.", minClearanceLevel: "CL5" },
      { name: "Briefing Room", slug: "briefing-room", description: "Verified discussion for intelligence briefings.", minClearanceLevel: "CL3" },
      { name: "Staff Operations", slug: "staff-operations", description: "Moderation and operations channel.", minClearanceLevel: "CL1" },
    ]);
  }
}

function publicUser(user: typeof appUsers.$inferSelect) {
  return { id: user.id, displayName: user.displayName, avatarUrl: user.avatarUrl, role: user.role, clearanceLevel: user.clearanceLevel };
}

router.get("/community/categories", requireUser, async (_req, res, next) => {
  try {
    await ensureDefaults();
    const categories = await db.select().from(forumCategories).orderBy(asc(forumCategories.sortOrder));
    const threads = await db.select({ categoryId: forumThreads.categoryId }).from(forumThreads);
    res.json(categories.map((category) => ({ ...category, threadCount: threads.filter((thread) => thread.categoryId === category.id).length })));
  } catch (error) {
    return next(error);
  }
});

router.get("/community/threads", requireUser, async (req, res, next) => {
  try {
    await ensureDefaults();
    const categoryId = Number(req.query.categoryId);
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const all = await db
      .select({ thread: forumThreads, category: forumCategories, author: appUsers })
      .from(forumThreads)
      .innerJoin(forumCategories, eq(forumCategories.id, forumThreads.categoryId))
      .innerJoin(appUsers, eq(appUsers.id, forumThreads.authorId))
      .where(and(eq(forumThreads.isArchived, false), Number.isFinite(categoryId) && categoryId > 0 ? eq(forumThreads.categoryId, categoryId) : undefined))
      .orderBy(desc(forumThreads.isPinned), desc(forumThreads.updatedAt))
      .limit(100);
    const visible = all.filter(({ thread }) => canAccessContent(req.currentUser!, thread.secrecyLevel) &&
      (!search || `${thread.title} ${thread.body}`.toLowerCase().includes(search.toLowerCase())));
    res.json(visible.map(({ thread, category, author }) => ({ ...thread, category: { id: category.id, name: category.name, slug: category.slug }, author: publicUser(author) })));
  } catch (error) {
    return next(error);
  }
});

router.post("/community/threads", requireUser, async (req, res, next) => {
  try {
    const { categoryId, title, body, tags = [], secrecyLevel = "CL5" } = req.body ?? {};
    if (!Number.isInteger(Number(categoryId)) || typeof title !== "string" || title.trim().length < 4 || typeof body !== "string" || body.trim().length < 10) {
      return res.status(400).json({ error: "Category, title, and a detailed body are required" });
    }
    if (!canAccessContent(req.currentUser!, secrecyLevel)) return res.status(403).json({ error: "Your clearance cannot publish at this level" });
    const [thread] = await db.insert(forumThreads).values({
      categoryId: Number(categoryId),
      authorId: req.currentUser!.id,
      title: title.trim().slice(0, 160),
      body: body.trim().slice(0, 10000),
      tags: Array.isArray(tags) ? tags.filter((tag): tag is string => typeof tag === "string").slice(0, 8) : [],
      secrecyLevel,
    }).returning();
    res.status(201).json(thread);
  } catch (error) {
    return next(error);
  }
});

router.get("/community/threads/:id", requireUser, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const rows = await db.select({ thread: forumThreads, category: forumCategories, author: appUsers })
      .from(forumThreads)
      .innerJoin(forumCategories, eq(forumCategories.id, forumThreads.categoryId))
      .innerJoin(appUsers, eq(appUsers.id, forumThreads.authorId))
      .where(eq(forumThreads.id, id)).limit(1);
    const row = rows[0];
    if (!row || !canAccessContent(req.currentUser!, row.thread.secrecyLevel)) return res.status(404).json({ error: "Thread not found" });
    await db.update(forumThreads).set({ viewCount: (row.thread.viewCount ?? 0) + 1 }).where(eq(forumThreads.id, id));
    const posts = await db.select({ post: forumPosts, author: appUsers })
      .from(forumPosts)
      .innerJoin(appUsers, eq(appUsers.id, forumPosts.authorId))
      .where(and(eq(forumPosts.threadId, id), eq(forumPosts.isDeleted, false)))
      .orderBy(asc(forumPosts.createdAt));
    res.json({
      ...row.thread,
      category: { id: row.category.id, name: row.category.name, slug: row.category.slug },
      author: publicUser(row.author),
      posts: posts.map(({ post, author }) => ({ ...post, author: publicUser(author) })),
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/community/threads/:id/posts", requireUser, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [thread] = await db.select().from(forumThreads).where(eq(forumThreads.id, id)).limit(1);
    if (!thread || thread.isArchived) return res.status(404).json({ error: "Thread not found" });
    if (thread.isLocked) return res.status(423).json({ error: "Thread is locked by moderation" });
    if (!canAccessContent(req.currentUser!, thread.secrecyLevel)) return res.status(403).json({ error: "Clearance required" });
    const body = typeof req.body?.body === "string" ? req.body.body.trim() : "";
    if (body.length < 2) return res.status(400).json({ error: "Message is required" });
    const [post] = await db.insert(forumPosts).values({ threadId: id, authorId: req.currentUser!.id, body: body.slice(0, 10000) }).returning();
    await db.update(forumThreads).set({ updatedAt: new Date() }).where(eq(forumThreads.id, id));
    res.status(201).json({ ...post, author: publicUser(req.currentUser!) });
  } catch (error) {
    return next(error);
  }
});

router.get("/community/channels", requireUser, async (req, res, next) => {
  try {
    await ensureDefaults();
    const channels = await db.select().from(chatChannels).where(eq(chatChannels.isArchived, false)).orderBy(asc(chatChannels.createdAt));
    res.json(channels.filter((channel) => canAccessContent(req.currentUser!, channel.minClearanceLevel)));
  } catch (error) {
    return next(error);
  }
});

router.get("/community/channels/:id/messages", requireUser, async (req, res, next) => {
  try {
    const channelId = Number(req.params.id);
    const [channel] = await db.select().from(chatChannels).where(eq(chatChannels.id, channelId)).limit(1);
    if (!channel || !canAccessContent(req.currentUser!, channel.minClearanceLevel)) return res.status(404).json({ error: "Channel not found" });
    const messages = await db.select({ message: chatMessages, author: appUsers })
      .from(chatMessages).innerJoin(appUsers, eq(appUsers.id, chatMessages.authorId))
      .where(and(eq(chatMessages.channelId, channelId), isNull(chatMessages.deletedAt)))
      .orderBy(desc(chatMessages.createdAt)).limit(100);
    res.json(messages.reverse().filter(({ message }) => canAccessContent(req.currentUser!, message.secrecyLevel)).map(({ message, author }) => ({ ...message, author: publicUser(author) })));
  } catch (error) {
    return next(error);
  }
});

router.post("/community/channels/:id/messages", requireUser, async (req, res, next) => {
  try {
    const channelId = Number(req.params.id);
    const [channel] = await db.select().from(chatChannels).where(eq(chatChannels.id, channelId)).limit(1);
    const content = typeof req.body?.content === "string" ? req.body.content.trim() : "";
    const secrecyLevel = typeof req.body?.secrecyLevel === "string" ? req.body.secrecyLevel : "CL5";
    if (!channel || channel.isArchived || !canAccessContent(req.currentUser!, channel.minClearanceLevel)) return res.status(404).json({ error: "Channel not found" });
    if (!content) return res.status(400).json({ error: "Message is required" });
    if (!canAccessContent(req.currentUser!, secrecyLevel)) return res.status(403).json({ error: "Your clearance cannot publish at this level" });
    const [message] = await db.insert(chatMessages).values({ channelId, authorId: req.currentUser!.id, content: content.slice(0, 4000), secrecyLevel }).returning();
    res.status(201).json({ ...message, author: publicUser(req.currentUser!) });
  } catch (error) {
    return next(error);
  }
});

router.post("/community/reports", requireUser, async (req, res, next) => {
  try {
    const { targetType, targetId, reason } = req.body ?? {};
    if (!["thread", "post", "message"].includes(targetType) || !Number.isInteger(Number(targetId)) || typeof reason !== "string" || reason.trim().length < 5) {
      return res.status(400).json({ error: "Target and a report reason are required" });
    }
    const [report] = await db.insert(moderationReports).values({ reporterId: req.currentUser!.id, targetType, targetId: Number(targetId), reason: reason.trim().slice(0, 1000) }).returning();
    res.status(201).json(report);
  } catch (error) {
    return next(error);
  }
});

export default router;