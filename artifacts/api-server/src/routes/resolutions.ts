import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, resolutionsTable, committeesTable } from "@workspace/db";
import {
  CreateResolutionBody,
  UpdateResolutionBody,
  ListResolutionsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/resolutions", async (req, res): Promise<void> => {
  const parsed = ListResolutionsQueryParams.safeParse(req.query);
  const committeeId = parsed.success ? parsed.data.committeeId : undefined;
  const status = parsed.success ? parsed.data.status : undefined;

  let conditions = [];
  if (committeeId) conditions.push(eq(resolutionsTable.committeeId, Number(committeeId)));
  if (status) conditions.push(eq(resolutionsTable.status, status));

  const resolutions = conditions.length > 0
    ? await db.select().from(resolutionsTable).where(and(...conditions))
    : await db.select().from(resolutionsTable);

  const committees = await db.select().from(committeesTable);
  const committeeMap = Object.fromEntries(committees.map(c => [c.id, c.name]));

  res.json(resolutions.map(r => ({
    ...r,
    committeeName: committeeMap[r.committeeId] || null,
  })));
});

router.post("/resolutions", async (req, res): Promise<void> => {
  const parsed = CreateResolutionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [resolution] = await db.insert(resolutionsTable).values(parsed.data).returning();
  const [committee] = await db.select().from(committeesTable).where(eq(committeesTable.id, resolution.committeeId));

  res.status(201).json({
    ...resolution,
    committeeName: committee?.name || null,
  });
});

router.get("/resolutions/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [resolution] = await db.select().from(resolutionsTable).where(eq(resolutionsTable.id, id));
  if (!resolution) {
    res.status(404).json({ error: "Resolution not found" });
    return;
  }

  const [committee] = await db.select().from(committeesTable).where(eq(committeesTable.id, resolution.committeeId));

  res.json({
    ...resolution,
    committeeName: committee?.name || null,
  });
});

router.put("/resolutions/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = UpdateResolutionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [resolution] = await db.update(resolutionsTable).set(parsed.data).where(eq(resolutionsTable.id, id)).returning();
  if (!resolution) {
    res.status(404).json({ error: "Resolution not found" });
    return;
  }

  const [committee] = await db.select().from(committeesTable).where(eq(committeesTable.id, resolution.committeeId));

  res.json({
    ...resolution,
    committeeName: committee?.name || null,
  });
});

router.delete("/resolutions/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [resolution] = await db.delete(resolutionsTable).where(eq(resolutionsTable.id, id)).returning();
  if (!resolution) {
    res.status(404).json({ error: "Resolution not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
