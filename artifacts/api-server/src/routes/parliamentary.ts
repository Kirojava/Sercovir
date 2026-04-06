import { Router } from "express";
import { db } from "@workspace/db";
import { parliamentaryTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/parliamentary", async (req, res): Promise<void> => {
  const { country, status } = req.query;
  let rows = await db.select().from(parliamentaryTable);
  if (country) rows = rows.filter(r => r.country.toLowerCase().includes(String(country).toLowerCase()));
  if (status) rows = rows.filter(r => r.status === String(status));
  rows.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  res.json(rows);
});

router.post("/parliamentary", async (req, res): Promise<void> => {
  const [row] = await db.insert(parliamentaryTable).values(req.body).returning();
  res.status(201).json(row);
});

router.get("/parliamentary/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [row] = await db.select().from(parliamentaryTable).where(eq(parliamentaryTable.id, id));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.put("/parliamentary/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [row] = await db.update(parliamentaryTable).set(req.body).where(eq(parliamentaryTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.delete("/parliamentary/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  await db.delete(parliamentaryTable).where(eq(parliamentaryTable.id, id));
  res.status(204).send();
});

export default router;
