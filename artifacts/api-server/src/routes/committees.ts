import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, committeesTable } from "@workspace/db";
import {
  CreateCommitteeBody,
  UpdateCommitteeBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/committees", async (_req, res): Promise<void> => {
  const committees = await db.select().from(committeesTable);
  res.json(committees);
});

router.post("/committees", async (req, res): Promise<void> => {
  const parsed = CreateCommitteeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [committee] = await db.insert(committeesTable).values(parsed.data).returning();
  res.status(201).json(committee);
});

router.get("/committees/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [committee] = await db.select().from(committeesTable).where(eq(committeesTable.id, id));
  if (!committee) {
    res.status(404).json({ error: "Committee not found" });
    return;
  }

  res.json(committee);
});

router.put("/committees/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = UpdateCommitteeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [committee] = await db.update(committeesTable).set(parsed.data).where(eq(committeesTable.id, id)).returning();
  if (!committee) {
    res.status(404).json({ error: "Committee not found" });
    return;
  }

  res.json(committee);
});

router.delete("/committees/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [committee] = await db.delete(committeesTable).where(eq(committeesTable.id, id)).returning();
  if (!committee) {
    res.status(404).json({ error: "Committee not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
