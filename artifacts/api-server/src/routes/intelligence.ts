import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, intelligenceTable } from "@workspace/db";
import {
  CreateIntelligenceBriefingBody,
  GetIntelligenceFeedQueryParams,
  DeleteIntelligenceBriefingParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/intelligence/feed", async (req, res): Promise<void> => {
  const parsed = GetIntelligenceFeedQueryParams.safeParse(req.query);
  const limit = parsed.success && parsed.data.limit ? Number(parsed.data.limit) : 20;

  const briefings = await db
    .select()
    .from(intelligenceTable)
    .orderBy(desc(intelligenceTable.timestamp))
    .limit(limit);

  res.json(briefings);
});

router.post("/intelligence/feed", async (req, res): Promise<void> => {
  const parsed = CreateIntelligenceBriefingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [briefing] = await db.insert(intelligenceTable).values(parsed.data).returning();
  res.status(201).json(briefing);
});

router.delete("/intelligence/briefings/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [briefing] = await db.delete(intelligenceTable).where(eq(intelligenceTable.id, id)).returning();
  if (!briefing) {
    res.status(404).json({ error: "Briefing not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
