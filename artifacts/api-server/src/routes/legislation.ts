import { Router } from "express";
import { db } from "@workspace/db";
import { legislationTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/legislation", async (req, res): Promise<void> => {
  const { country, status, category } = req.query;
  let rows = await db.select().from(legislationTable);
  if (country) rows = rows.filter(r => r.country.toLowerCase().includes(String(country).toLowerCase()));
  if (status) rows = rows.filter(r => r.status === String(status));
  if (category) rows = rows.filter(r => r.category.toLowerCase() === String(category).toLowerCase());
  rows.sort((a, b) => (b.proposedDate ?? "").localeCompare(a.proposedDate ?? ""));
  res.json(rows);
});

router.post("/legislation", async (req, res): Promise<void> => {
  const [row] = await db.insert(legislationTable).values(req.body).returning();
  res.status(201).json(row);
});

router.get("/legislation/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [row] = await db.select().from(legislationTable).where(eq(legislationTable.id, id));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.put("/legislation/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [row] = await db.update(legislationTable).set(req.body).where(eq(legislationTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.delete("/legislation/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  await db.delete(legislationTable).where(eq(legislationTable.id, id));
  res.status(204).send();
});

export default router;
