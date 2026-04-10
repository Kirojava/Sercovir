import { Router, type IRouter } from "express";
import { db, cyberIncidentsTable, aptGroupsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/cyber-intel/incidents", async (_req, res): Promise<void> => {
  const incidents = await db.select().from(cyberIncidentsTable).orderBy(desc(cyberIncidentsTable.detectedDate));
  res.json(incidents);
});

router.get("/cyber-intel/apt-groups", async (_req, res): Promise<void> => {
  const groups = await db.select().from(aptGroupsTable);
  res.json(groups);
});

router.get("/cyber-intel/summary", async (_req, res): Promise<void> => {
  const [incidents, groups] = await Promise.all([
    db.select().from(cyberIncidentsTable),
    db.select().from(aptGroupsTable),
  ]);
  const critical = incidents.filter(i => i.severity === "critical").length;
  const high = incidents.filter(i => i.severity === "high").length;
  const active = incidents.filter(i => i.status === "active").length;
  const byType: Record<string, number> = {};
  for (const i of incidents) {
    byType[i.attackType] = (byType[i.attackType] || 0) + 1;
  }
  res.json({ totalIncidents: incidents.length, critical, high, active, totalAptGroups: groups.length, byType });
});

export default router;
