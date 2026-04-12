import { Router, type IRouter } from "express";
import { db, militaryActivitiesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/military-activities", async (req, res): Promise<void> => {
  const type = typeof req.query.type === "string" ? req.query.type : undefined;
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const threat = typeof req.query.threat === "string" ? req.query.threat : undefined;
  const region = typeof req.query.region === "string" ? req.query.region : undefined;

  let activities = await db.select().from(militaryActivitiesTable);

  if (type) activities = activities.filter(a => a.type === type);
  if (status) activities = activities.filter(a => a.status === status);
  if (threat) activities = activities.filter(a => a.threatLevel === threat);
  if (region) activities = activities.filter(a => a.region === region);

  res.json(activities);
});

router.get("/military-activities/summary", async (_req, res): Promise<void> => {
  const activities = await db.select().from(militaryActivitiesTable);

  const byType: Record<string, number> = {};
  const byThreat: Record<string, number> = {};
  const byRegion: Record<string, number> = {};

  for (const a of activities) {
    byType[a.type] = (byType[a.type] || 0) + 1;
    byThreat[a.threatLevel] = (byThreat[a.threatLevel] || 0) + 1;
    byRegion[a.region] = (byRegion[a.region] || 0) + 1;
  }

  const totalPersonnel = activities
    .map(a => {
      const m = (a.estimatedPersonnel || "").replace(/[^0-9]/g, "");
      return m ? parseInt(m, 10) : 0;
    })
    .reduce((s, v) => s + v, 0);

  res.json({
    total: activities.length,
    active: activities.filter(a => a.status === "active").length,
    critical: byThreat["critical"] || 0,
    byType,
    byThreat,
    byRegion,
    natoRelated: activities.filter(a => a.isNatoRelated).length,
    joint: activities.filter(a => a.isJoint).length,
    totalPersonnel,
    regions: Object.keys(byRegion),
  });
});

router.get("/military-activities/timeline", async (_req, res): Promise<void> => {
  const activities = await db.select().from(militaryActivitiesTable);

  const events: Array<{
    activityId: number;
    activityTitle: string;
    type: string;
    threatLevel: string;
    region: string;
    country: string;
    flagEmoji: string | null;
    update: string;
    sortKey: string;
  }> = [];

  for (const a of activities) {
    for (const u of (a.updates ?? [])) {
      events.push({
        activityId: a.id,
        activityTitle: a.title,
        type: a.type,
        threatLevel: a.threatLevel,
        region: a.region,
        country: a.country,
        flagEmoji: a.flagEmoji,
        update: u,
        sortKey: u.slice(0, 12),
      });
    }
  }

  events.sort((a, b) => b.sortKey.localeCompare(a.sortKey));
  res.json(events);
});

router.get("/military-activities/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [activity] = await db.select().from(militaryActivitiesTable).where(eq(militaryActivitiesTable.id, id));
  if (!activity) { res.status(404).json({ error: "Not found" }); return; }
  res.json(activity);
});

export default router;
