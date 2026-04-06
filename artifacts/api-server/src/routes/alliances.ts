import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, alliancesTable } from "@workspace/db";
import {
  CreateAllianceBody,
  UpdateAllianceBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/alliances", async (_req, res): Promise<void> => {
  const alliances = await db.select().from(alliancesTable);
  res.json(alliances);
});

router.post("/alliances", async (req, res): Promise<void> => {
  const parsed = CreateAllianceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [alliance] = await db.insert(alliancesTable).values(parsed.data).returning();
  res.status(201).json(alliance);
});

router.get("/alliances/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [alliance] = await db.select().from(alliancesTable).where(eq(alliancesTable.id, id));
  if (!alliance) {
    res.status(404).json({ error: "Alliance not found" });
    return;
  }

  res.json(alliance);
});

router.put("/alliances/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = UpdateAllianceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [alliance] = await db.update(alliancesTable).set(parsed.data).where(eq(alliancesTable.id, id)).returning();
  if (!alliance) {
    res.status(404).json({ error: "Alliance not found" });
    return;
  }

  res.json(alliance);
});

router.delete("/alliances/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [alliance] = await db.delete(alliancesTable).where(eq(alliancesTable.id, id)).returning();
  if (!alliance) {
    res.status(404).json({ error: "Alliance not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
