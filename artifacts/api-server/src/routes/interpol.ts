import { Router } from "express";
import { db } from "@workspace/db";
import { interpolTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/interpol", async (req, res): Promise<void> => {
  const { noticeType, status } = req.query;
  let rows = await db.select().from(interpolTable);
  if (noticeType) rows = rows.filter(r => r.noticeType === String(noticeType));
  if (status) rows = rows.filter(r => r.status === String(status));
  rows.sort((a, b) => (b.issuedDate ?? "").localeCompare(a.issuedDate ?? ""));
  res.json(rows);
});

router.post("/interpol", async (req, res): Promise<void> => {
  const [row] = await db.insert(interpolTable).values(req.body).returning();
  res.status(201).json(row);
});

router.get("/interpol/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [row] = await db.select().from(interpolTable).where(eq(interpolTable.id, id));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.put("/interpol/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [row] = await db.update(interpolTable).set(req.body).where(eq(interpolTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.delete("/interpol/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  await db.delete(interpolTable).where(eq(interpolTable.id, id));
  res.status(204).send();
});

export default router;
