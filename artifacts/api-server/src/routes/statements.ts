import { Router } from "express";
import { db } from "@workspace/db";
import { leaderStatementsTable, worldLeadersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/statements", async (req, res): Promise<void> => {
  const { leaderId, platform, topic } = req.query;
  let rows = await db.select().from(leaderStatementsTable);
  if (leaderId) rows = rows.filter(r => r.leaderId === parseInt(String(leaderId)));
  if (platform) rows = rows.filter(r => r.platform.toLowerCase() === String(platform).toLowerCase());
  if (topic) rows = rows.filter(r => r.topic?.toLowerCase().includes(String(topic).toLowerCase()));
  rows.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  res.json(rows);
});

router.post("/statements", async (req, res): Promise<void> => {
  const leader = await db.select().from(worldLeadersTable).where(eq(worldLeadersTable.id, req.body.leaderId)).then(r => r[0]);
  const data = {
    ...req.body,
    leaderName: leader?.name ?? "",
    country: leader?.country ?? "",
  };
  const [row] = await db.insert(leaderStatementsTable).values(data).returning();
  res.status(201).json(row);
});

router.get("/statements/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [row] = await db.select().from(leaderStatementsTable).where(eq(leaderStatementsTable.id, id));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.delete("/statements/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  await db.delete(leaderStatementsTable).where(eq(leaderStatementsTable.id, id));
  res.status(204).send();
});

export default router;
