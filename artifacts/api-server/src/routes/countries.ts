import { Router, type IRouter } from "express";
import { eq, sql, ilike, and } from "drizzle-orm";
import { db, countriesTable } from "@workspace/db";
import {
  CreateCountryBody,
  GetCountryParams,
  UpdateCountryParams,
  UpdateCountryBody,
  DeleteCountryParams,
  ListCountriesQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/countries/summary", async (_req, res): Promise<void> => {
  const countries = await db.select().from(countriesTable);

  const byRegion: Record<string, number> = {};
  const byThreatLevel: Record<string, number> = {};
  let totalStability = 0;
  let stabilityCount = 0;

  for (const c of countries) {
    byRegion[c.region] = (byRegion[c.region] || 0) + 1;
    byThreatLevel[c.threatLevel] = (byThreatLevel[c.threatLevel] || 0) + 1;
    if (c.stabilityIndex != null) {
      totalStability += parseFloat(String(c.stabilityIndex));
      stabilityCount++;
    }
  }

  res.json({
    total: countries.length,
    byRegion,
    byThreatLevel,
    avgStabilityIndex: stabilityCount > 0 ? Math.round(totalStability / stabilityCount) : 0,
  });
});

router.get("/countries", async (req, res): Promise<void> => {
  const parsed = ListCountriesQueryParams.safeParse(req.query);
  const region = parsed.success ? parsed.data.region : undefined;
  const search = parsed.success ? parsed.data.search : undefined;

  let conditions = [];
  if (region) conditions.push(eq(countriesTable.region, region));
  if (search) conditions.push(ilike(countriesTable.name, `%${search}%`));

  const countries = conditions.length > 0
    ? await db.select().from(countriesTable).where(and(...conditions))
    : await db.select().from(countriesTable);

  res.json(countries.map(c => ({
    ...c,
    gdp: c.gdp ? parseFloat(String(c.gdp)) : null,
    militaryBudget: c.militaryBudget ? parseFloat(String(c.militaryBudget)) : null,
    stabilityIndex: c.stabilityIndex ? parseFloat(String(c.stabilityIndex)) : null,
  })));
});

router.post("/countries", async (req, res): Promise<void> => {
  const parsed = CreateCountryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [country] = await db.insert(countriesTable).values(parsed.data as any).returning();
  res.status(201).json({
    ...country,
    gdp: country.gdp ? parseFloat(String(country.gdp)) : null,
    militaryBudget: country.militaryBudget ? parseFloat(String(country.militaryBudget)) : null,
    stabilityIndex: country.stabilityIndex ? parseFloat(String(country.stabilityIndex)) : null,
  });
});

router.get("/countries/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [country] = await db.select().from(countriesTable).where(eq(countriesTable.id, id));
  if (!country) {
    res.status(404).json({ error: "Country not found" });
    return;
  }

  res.json({
    ...country,
    gdp: country.gdp ? parseFloat(String(country.gdp)) : null,
    militaryBudget: country.militaryBudget ? parseFloat(String(country.militaryBudget)) : null,
    stabilityIndex: country.stabilityIndex ? parseFloat(String(country.stabilityIndex)) : null,
  });
});

router.put("/countries/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = UpdateCountryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [country] = await db.update(countriesTable).set(parsed.data as any).where(eq(countriesTable.id, id)).returning();
  if (!country) {
    res.status(404).json({ error: "Country not found" });
    return;
  }

  res.json({
    ...country,
    gdp: country.gdp ? parseFloat(String(country.gdp)) : null,
    militaryBudget: country.militaryBudget ? parseFloat(String(country.militaryBudget)) : null,
    stabilityIndex: country.stabilityIndex ? parseFloat(String(country.stabilityIndex)) : null,
  });
});

router.delete("/countries/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [country] = await db.delete(countriesTable).where(eq(countriesTable.id, id)).returning();
  if (!country) {
    res.status(404).json({ error: "Country not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
