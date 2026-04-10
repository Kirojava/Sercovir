import { Router, type IRouter } from "express";
import { db, operationsTimelineTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/operations-timeline", async (req, res): Promise<void> => {
  const limit = Number(req.query.limit) || 50;
  const category = req.query.category as string | undefined;
  let query = db.select().from(operationsTimelineTable).orderBy(desc(operationsTimelineTable.occurredAt)).limit(limit);
  const events = await query;
  const filtered = category && category !== "all" ? events.filter(e => e.category === category) : events;
  res.json(filtered);
});

export default router;
