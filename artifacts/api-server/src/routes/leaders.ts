import { Router } from "express";
import { db } from "@workspace/db";
import { worldLeadersTable, leaderStatementsTable } from "@workspace/db/schema";
import { eq, ilike, or } from "drizzle-orm";

const router = Router();

router.get("/leaders", async (req, res): Promise<void> => {
  const { country, search, role } = req.query;
  let rows = await db.select().from(worldLeadersTable);
  if (country) rows = rows.filter(r => r.country.toLowerCase().includes(String(country).toLowerCase()));
  if (role) rows = rows.filter(r => r.position.toLowerCase().includes(String(role).toLowerCase()));
  if (search) {
    const q = String(search).toLowerCase();
    rows = rows.filter(r => r.name.toLowerCase().includes(q) || r.country.toLowerCase().includes(q) || r.position.toLowerCase().includes(q));
  }
  res.json(rows);
});

router.post("/leaders", async (req, res): Promise<void> => {
  const [row] = await db.insert(worldLeadersTable).values(req.body).returning();
  res.status(201).json(row);
});

router.get("/leaders/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [row] = await db.select().from(worldLeadersTable).where(eq(worldLeadersTable.id, id));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.put("/leaders/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [row] = await db.update(worldLeadersTable).set(req.body).where(eq(worldLeadersTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.delete("/leaders/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  await db.delete(worldLeadersTable).where(eq(worldLeadersTable.id, id));
  res.status(204).send();
});

router.get("/leaders/:id/statements", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const rows = await db.select().from(leaderStatementsTable)
    .where(eq(leaderStatementsTable.leaderId, id));
  res.json(rows);
});

export default router;
