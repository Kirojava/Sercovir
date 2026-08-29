import { Router, type IRouter } from "express";
import { db, countriesTable, conflictsTable, worldLeadersTable, alliancesTable, treatiesTable, interpolTable, icjTable, resolutionsTable, committeesTable } from "@workspace/db";

const router: IRouter = Router();

const MAX_SEARCH_LENGTH = 200;

router.get("/search", async (req, res): Promise<void> => {
  const raw = String(req.query.q || "").trim();
  if (raw.length < 2) {
    res.json({ results: [] });
    return;
  }
  const q = raw.slice(0, MAX_SEARCH_LENGTH).toLowerCase();

  const [countries, leaders, conflicts, alliances, treaties, interpolNotices, icjCases, resolutions, committees] = await Promise.all([
    db.select().from(countriesTable),
    db.select().from(worldLeadersTable),
    db.select().from(conflictsTable),
    db.select().from(alliancesTable),
    db.select().from(treatiesTable),
    db.select().from(interpolTable),
    db.select().from(icjTable),
    db.select().from(resolutionsTable),
    db.select().from(committeesTable),
  ]);

  const results: Array<{
    type: string;
    id: number;
    title: string;
    subtitle: string;
    badge?: string;
    href: string;
  }> = [];

  for (const c of countries) {
    if (c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.region.toLowerCase().includes(q)) {
      results.push({ type: "country", id: c.id, title: `${c.flagEmoji || ""} ${c.name}`, subtitle: c.region, badge: c.threatLevel ?? undefined, href: `/countries/${c.id}` });
    }
  }
  for (const l of leaders) {
    if (l.name.toLowerCase().includes(q) || l.country.toLowerCase().includes(q) || (l.position || "").toLowerCase().includes(q)) {
      results.push({ type: "leader", id: l.id, title: l.name, subtitle: `${l.position} · ${l.country}`, badge: l.isCurrentlyInPower ? "active" : "former", href: `/leaders/${l.id}` });
    }
  }
  for (const c of conflicts) {
    if (c.title.toLowerCase().includes(q) || c.region.toLowerCase().includes(q) || (c.description || "").toLowerCase().includes(q)) {
      results.push({ type: "conflict", id: c.id, title: c.title, subtitle: `${c.region} · ${c.status}`, badge: c.severity ?? undefined, href: `/conflicts/${c.id}` });
    }
  }
  for (const a of alliances) {
    if (a.name.toLowerCase().includes(q) || (a.abbreviation || "").toLowerCase().includes(q)) {
      results.push({ type: "alliance", id: a.id, title: a.name, subtitle: a.type, badge: a.strength ?? undefined, href: `/alliances/${a.id}` });
    }
  }
  for (const t of treaties) {
    if (t.title.toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q)) {
      results.push({ type: "treaty", id: t.id, title: t.title, subtitle: t.status, href: `/treaties/${t.id}` });
    }
  }
  for (const n of interpolNotices) {
    if (n.subjectName.toLowerCase().includes(q) || (n.charges || "").toLowerCase().includes(q)) {
      results.push({ type: "interpol", id: n.id, title: n.subjectName, subtitle: n.noticeType + " Notice", badge: n.status ?? undefined, href: `/interpol/${n.id}` });
    }
  }
  for (const c of icjCases) {
    if (c.title.toLowerCase().includes(q) || c.applicantCountry.toLowerCase().includes(q) || c.respondentCountry.toLowerCase().includes(q)) {
      results.push({ type: "icj", id: c.id, title: c.title, subtitle: `ICJ · ${c.status}`, href: `/icj/${c.id}` });
    }
  }
  for (const r of resolutions) {
    if (r.title.toLowerCase().includes(q) || (r.operativeClauses || []).some((clause) => clause.toLowerCase().includes(q))) {
      results.push({ type: "resolution", id: r.id, title: r.title, subtitle: r.status, href: `/resolutions/${r.id}` });
    }
  }
  for (const c of committees) {
    if (c.name.toLowerCase().includes(q) || (c.topic || "").toLowerCase().includes(q)) {
      results.push({ type: "committee", id: c.id, title: c.name, subtitle: c.status, href: `/committees/${c.id}` });
    }
  }

  res.json({ results: results.slice(0, 30) });
});

export default router;
