import { Router } from "express";
import { db } from "@workspace/db";
import {
  countriesTable,
  worldLeadersTable,
  leaderStatementsTable,
  parliamentaryTable,
  legislationTable,
  criminalCasesTable,
  treatiesTable,
  mediaEventsTable,
  interpolTable,
  conflictsTable,
  intelligenceTable,
} from "@workspace/db/schema";

const router = Router();

router.get("/country-intel/:code", async (req, res): Promise<void> => {
  const code = req.params.code.toUpperCase();
  const nameLower = req.params.code.toLowerCase();

  const countries = await db.select().from(countriesTable);
  const country = countries.find(
    c => c.code?.toUpperCase() === code || c.name.toLowerCase().includes(nameLower)
  );

  if (!country) { res.status(404).json({ error: "Country not found" }); return; }

  const countryName = country.name.toLowerCase();
  const countryCode = country.code?.toUpperCase() ?? "";

  const results = await Promise.all([
    db.select().from(worldLeadersTable),
    db.select().from(leaderStatementsTable),
    db.select().from(parliamentaryTable),
    db.select().from(legislationTable),
    db.select().from(criminalCasesTable),
    db.select().from(treatiesTable),
    db.select().from(mediaEventsTable),
    db.select().from(interpolTable),
    db.select().from(conflictsTable),
    db.select().from(intelligenceTable),
  ]);

  const [
    allLeaders,
    allStatements,
    allParliamentary,
    allLegislation,
    allCriminalCases,
    allTreaties,
    allMediaEvents,
    allInterpol,
    allConflicts,
    allIntelligence,
  ] = results;

  const leaders = allLeaders.filter(
    l => l.country.toLowerCase().includes(countryName) || l.countryCode?.toUpperCase() === countryCode
  );

  const leaderIds = new Set(leaders.map(l => l.id));
  const recentStatements = allStatements
    .filter(s => leaderIds.has(s.leaderId) || s.country?.toLowerCase().includes(countryName))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20);

  const parliamentaryDiscussions = allParliamentary
    .filter(p => p.country.toLowerCase().includes(countryName) || p.countryCode?.toUpperCase() === countryCode)
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

  const legislation = allLegislation
    .filter(l => l.country.toLowerCase().includes(countryName) || l.countryCode?.toUpperCase() === countryCode)
    .sort((a, b) => (b.proposedDate ?? "").localeCompare(a.proposedDate ?? ""));

  const criminalCases = allCriminalCases
    .filter(c => c.country.toLowerCase().includes(countryName))
    .sort((a, b) => (b.startDate ?? "").localeCompare(a.startDate ?? ""));

  const treaties = allTreaties.filter(t => {
    const sigs = (t.signatories as string[]) ?? [];
    return sigs.some(s => s.toLowerCase().includes(countryName));
  });

  const mediaEvents = allMediaEvents
    .filter(m => m.country.toLowerCase().includes(countryName) || m.countryCode?.toUpperCase() === countryCode)
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

  const interpolNotices = allInterpol.filter(
    n => n.nationality?.toLowerCase().includes(countryName) || n.chargedBy?.toLowerCase().includes(countryName)
  );

  const activeConflicts = allConflicts.filter(c => {
    const parties = (c.partiesInvolved as string[]) ?? [];
    return parties.some(p => p.toLowerCase().includes(countryName)) || c.region?.toLowerCase().includes(countryName);
  });

  const intelligenceBriefings = allIntelligence
    .filter(b => {
      const rc = (b.relatedCountries as string[]) ?? [];
      return rc.some(r => r.toLowerCase().includes(countryName));
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  res.json({
    country,
    leaders,
    recentStatements,
    parliamentaryDiscussions,
    legislation,
    criminalCases,
    treaties,
    mediaEvents,
    interpolNotices,
    activeConflicts,
    intelligenceBriefings,
  });
});

export default router;
