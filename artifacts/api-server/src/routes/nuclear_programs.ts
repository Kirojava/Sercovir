import { Router, type IRouter } from "express";
import { db, nuclearProgramsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/nuclear-programs", async (_req, res): Promise<void> => {
  const programs = await db.select().from(nuclearProgramsTable);
  res.json(programs);
});

router.get("/nuclear-programs/summary", async (_req, res): Promise<void> => {
  const programs = await db.select().from(nuclearProgramsTable);
  const confirmed = programs.filter(p => p.programStatus === "confirmed").length;
  const suspected = programs.filter(p => p.programStatus === "suspected").length;
  const developing = programs.filter(p => p.programStatus === "developing").length;
  const critical = programs.filter(p => p.threatLevel === "critical").length;
  const totalWarheads = programs.reduce((sum, p) => sum + (p.nuclearWarheads || 0), 0);
  res.json({ total: programs.length, confirmed, suspected, developing, critical, totalWarheads });
});

export default router;
