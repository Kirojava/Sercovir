import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, conflictsTable } from "@workspace/db";
import {
  CreateConflictBody,
  UpdateConflictBody,
  ListConflictsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/conflicts/summary", async (_req, res): Promise<void> => {
  const conflicts = await db.select().from(conflictsTable);

  const summary = {
    total: conflicts.length,
    active: conflicts.filter(c => c.status === "active").length,
    escalating: conflicts.filter(c => c.status === "escalating").length,
    resolved: conflicts.filter(c => c.status === "resolved").length,
    frozen: conflicts.filter(c => c.status === "frozen").length,
    bySeverity: {} as Record<string, number>,
    byRegion: {} as Record<string, number>,
    totalCasualties: 0,
    totalDisplaced: 0,
  };

  for (const c of conflicts) {
    summary.bySeverity[c.severity] = (summary.bySeverity[c.severity] || 0) + 1;
    summary.byRegion[c.region] = (summary.byRegion[c.region] || 0) + 1;
    summary.totalCasualties += c.casualties || 0;
    summary.totalDisplaced += c.displacedPersons || 0;
  }

  res.json(summary);
});

router.get("/conflicts", async (req, res): Promise<void> => {
  const parsed = ListConflictsQueryParams.safeParse(req.query);
  const status = parsed.success ? parsed.data.status : undefined;
  const region = parsed.success ? parsed.data.region : undefined;

  let conditions = [];
  if (status) conditions.push(eq(conflictsTable.status, status));
  if (region) conditions.push(eq(conflictsTable.region, region));

  const conflicts = conditions.length > 0
    ? await db.select().from(conflictsTable).where(and(...conditions))
    : await db.select().from(conflictsTable);

  res.json(conflicts);
});

router.post("/conflicts", async (req, res): Promise<void> => {
  const parsed = CreateConflictBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [conflict] = await db.insert(conflictsTable).values(parsed.data).returning();
  res.status(201).json(conflict);
});

router.get("/conflicts/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [conflict] = await db.select().from(conflictsTable).where(eq(conflictsTable.id, id));
  if (!conflict) {
    res.status(404).json({ error: "Conflict not found" });
    return;
  }

  res.json(conflict);
});

router.put("/conflicts/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = UpdateConflictBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [conflict] = await db.update(conflictsTable).set(parsed.data).where(eq(conflictsTable.id, id)).returning();
  if (!conflict) {
    res.status(404).json({ error: "Conflict not found" });
    return;
  }

  res.json(conflict);
});

router.delete("/conflicts/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [conflict] = await db.delete(conflictsTable).where(eq(conflictsTable.id, id)).returning();
  if (!conflict) {
    res.status(404).json({ error: "Conflict not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
