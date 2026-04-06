import { Router } from "express";
import { db } from "@workspace/db";
import { mediaEventsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/media-events", async (req, res): Promise<void> => {
  const { country, category, severity } = req.query;
  let rows = await db.select().from(mediaEventsTable);
  if (country) rows = rows.filter(r => r.country.toLowerCase().includes(String(country).toLowerCase()));
  if (category) rows = rows.filter(r => r.category.toLowerCase() === String(category).toLowerCase());
  if (severity) rows = rows.filter(r => r.severity === String(severity));
  rows.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  res.json(rows);
});

router.post("/media-events", async (req, res): Promise<void> => {
  const [row] = await db.insert(mediaEventsTable).values(req.body).returning();
  res.status(201).json(row);
});

router.get("/media-events/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [row] = await db.select().from(mediaEventsTable).where(eq(mediaEventsTable.id, id));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.delete("/media-events/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  await db.delete(mediaEventsTable).where(eq(mediaEventsTable.id, id));
  res.status(204).send();
});

export default router;
