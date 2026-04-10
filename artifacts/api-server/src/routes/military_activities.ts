import { Router, type IRouter } from "express";
import { db, militaryActivitiesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/military-activities", async (req, res): Promise<void> => {
  const type = typeof req.query.type === "string" ? req.query.type : undefined;
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const threat = typeof req.query.threat === "string" ? req.query.threat : undefined;

  let activities = await db.select().from(militaryActivitiesTable);

  if (type) activities = activities.filter(a => a.type === type);
  if (status) activities = activities.filter(a => a.status === status);
  if (threat) activities = activities.filter(a => a.threatLevel === threat);

  res.json(activities);
});

router.get("/military-activities/summary", async (_req, res): Promise<void> => {
  const activities = await db.select().from(militaryActivitiesTable);

  const byType: Record<string, number> = {};
  const byThreat: Record<string, number> = {};
  for (const a of activities) {
    byType[a.type] = (byType[a.type] || 0) + 1;
    byThreat[a.threatLevel] = (byThreat[a.threatLevel] || 0) + 1;
  }

  res.json({
    total: activities.length,
    active: activities.filter(a => a.status === "active").length,
    critical: byThreat["critical"] || 0,
    byType,
    byThreat,
    natoRelated: activities.filter(a => a.isNatoRelated).length,
    joint: activities.filter(a => a.isJoint).length,
  });
});

router.get("/military-activities/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [activity] = await db.select().from(militaryActivitiesTable).where(eq(militaryActivitiesTable.id, id));
  if (!activity) { res.status(404).json({ error: "Not found" }); return; }
  res.json(activity);
});

export default router;
