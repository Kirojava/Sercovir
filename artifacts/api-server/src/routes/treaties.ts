import { Router } from "express";
import { db } from "@workspace/db";
import { treatiesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/treaties", async (req, res): Promise<void> => {
  const { type, status } = req.query;
  let rows = await db.select().from(treatiesTable);
  if (type) rows = rows.filter(r => r.type.toLowerCase() === String(type).toLowerCase());
  if (status) rows = rows.filter(r => r.status === String(status));
  rows.sort((a, b) => (b.signedDate ?? "").localeCompare(a.signedDate ?? ""));
  res.json(rows);
});

router.post("/treaties", async (req, res): Promise<void> => {
  const [row] = await db.insert(treatiesTable).values(req.body).returning();
  res.status(201).json(row);
});

router.get("/treaties/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [row] = await db.select().from(treatiesTable).where(eq(treatiesTable.id, id));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.put("/treaties/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [row] = await db.update(treatiesTable).set(req.body).where(eq(treatiesTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.delete("/treaties/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  await db.delete(treatiesTable).where(eq(treatiesTable.id, id));
  res.status(204).send();
});

export default router;
