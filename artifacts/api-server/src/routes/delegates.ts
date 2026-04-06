import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, delegatesTable, committeesTable } from "@workspace/db";
import {
  CreateDelegateBody,
  UpdateDelegateBody,
  ListDelegatesQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/delegates", async (req, res): Promise<void> => {
  const parsed = ListDelegatesQueryParams.safeParse(req.query);
  const committeeId = parsed.success ? parsed.data.committeeId : undefined;

  const delegates = committeeId
    ? await db.select().from(delegatesTable).where(eq(delegatesTable.committeeId, Number(committeeId)))
    : await db.select().from(delegatesTable);

  const committees = await db.select().from(committeesTable);
  const committeeMap = Object.fromEntries(committees.map(c => [c.id, c.name]));

  res.json(delegates.map(d => ({
    ...d,
    committeeName: committeeMap[d.committeeId] || null,
  })));
});

router.post("/delegates", async (req, res): Promise<void> => {
  const parsed = CreateDelegateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [delegate] = await db.insert(delegatesTable).values(parsed.data).returning();
  const [committee] = await db.select().from(committeesTable).where(eq(committeesTable.id, delegate.committeeId));

  res.status(201).json({
    ...delegate,
    committeeName: committee?.name || null,
  });
});

router.get("/delegates/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [delegate] = await db.select().from(delegatesTable).where(eq(delegatesTable.id, id));
  if (!delegate) {
    res.status(404).json({ error: "Delegate not found" });
    return;
  }

  const [committee] = await db.select().from(committeesTable).where(eq(committeesTable.id, delegate.committeeId));

  res.json({
    ...delegate,
    committeeName: committee?.name || null,
  });
});

router.put("/delegates/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = UpdateDelegateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [delegate] = await db.update(delegatesTable).set(parsed.data).where(eq(delegatesTable.id, id)).returning();
  if (!delegate) {
    res.status(404).json({ error: "Delegate not found" });
    return;
  }

  const [committee] = await db.select().from(committeesTable).where(eq(committeesTable.id, delegate.committeeId));

  res.json({
    ...delegate,
    committeeName: committee?.name || null,
  });
});

router.delete("/delegates/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [delegate] = await db.delete(delegatesTable).where(eq(delegatesTable.id, id)).returning();
  if (!delegate) {
    res.status(404).json({ error: "Delegate not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
