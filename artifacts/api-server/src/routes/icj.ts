import { Router } from "express";
import { db } from "@workspace/db";
import { icjTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/icj", async (req, res): Promise<void> => {
  const { status } = req.query;
  let rows = await db.select().from(icjTable);
  if (status) rows = rows.filter(r => r.status === String(status));
  rows.sort((a, b) => (b.filedDate ?? "").localeCompare(a.filedDate ?? ""));
  res.json(rows);
});

router.post("/icj", async (req, res): Promise<void> => {
  const [row] = await db.insert(icjTable).values(req.body).returning();
  res.status(201).json(row);
});

router.get("/icj/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [row] = await db.select().from(icjTable).where(eq(icjTable.id, id));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.put("/icj/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [row] = await db.update(icjTable).set(req.body).where(eq(icjTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.delete("/icj/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  await db.delete(icjTable).where(eq(icjTable.id, id));
  res.status(204).send();
});

export default router;
