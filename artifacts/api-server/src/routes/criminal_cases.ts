import { Router } from "express";
import { db } from "@workspace/db";
import { criminalCasesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/criminal-cases", async (req, res): Promise<void> => {
  const { country, status, caseType } = req.query;
  let rows = await db.select().from(criminalCasesTable);
  if (country) rows = rows.filter(r => r.country.toLowerCase().includes(String(country).toLowerCase()));
  if (status) rows = rows.filter(r => r.status === String(status));
  if (caseType) rows = rows.filter(r => r.caseType.toLowerCase() === String(caseType).toLowerCase());
  rows.sort((a, b) => (b.startDate ?? "").localeCompare(a.startDate ?? ""));
  res.json(rows);
});

router.post("/criminal-cases", async (req, res): Promise<void> => {
  const [row] = await db.insert(criminalCasesTable).values(req.body).returning();
  res.status(201).json(row);
});

router.get("/criminal-cases/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [row] = await db.select().from(criminalCasesTable).where(eq(criminalCasesTable.id, id));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.put("/criminal-cases/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [row] = await db.update(criminalCasesTable).set(req.body).where(eq(criminalCasesTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.delete("/criminal-cases/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  await db.delete(criminalCasesTable).where(eq(criminalCasesTable.id, id));
  res.status(204).send();
});

export default router;
