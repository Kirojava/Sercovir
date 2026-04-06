import { Router, type IRouter } from "express";
import { db, countriesTable, conflictsTable, committeesTable, resolutionsTable, alliancesTable, delegatesTable, intelligenceTable, worldLeadersTable, interpolTable, icjTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard", async (_req, res): Promise<void> => {
  const [countries, conflicts, committees, resolutions, alliances, delegates, recentBriefings, leaders, interpolNotices, icjCases] = await Promise.all([
    db.select().from(countriesTable),
    db.select().from(conflictsTable),
    db.select().from(committeesTable),
    db.select().from(resolutionsTable),
    db.select().from(alliancesTable),
    db.select().from(delegatesTable),
    db.select().from(intelligenceTable).orderBy(desc(intelligenceTable.timestamp)).limit(5),
    db.select().from(worldLeadersTable),
    db.select().from(interpolTable),
    db.select().from(icjTable),
  ]);

  const activeConflicts = conflicts.filter(c => c.status === "active").length;
  const escalatingConflicts = conflicts.filter(c => c.status === "escalating").length;

  const conflictsByRegion: Record<string, number> = {};
  for (const c of conflicts) {
    if (c.status === "active" || c.status === "escalating") {
      conflictsByRegion[c.region] = (conflictsByRegion[c.region] || 0) + 1;
    }
  }

  const threatDistribution: Record<string, number> = {};
  for (const c of countries) {
    threatDistribution[c.threatLevel] = (threatDistribution[c.threatLevel] || 0) + 1;
  }

  let globalThreatLevel = "low";
  const criticalConflicts = conflicts.filter(c => c.severity === "critical" && (c.status === "active" || c.status === "escalating")).length;
  const highConflicts = conflicts.filter(c => c.severity === "high" && (c.status === "active" || c.status === "escalating")).length;
  if (criticalConflicts >= 2 || escalatingConflicts >= 3) {
    globalThreatLevel = "critical";
  } else if (criticalConflicts >= 1 || highConflicts >= 2) {
    globalThreatLevel = "high";
  } else if (activeConflicts >= 2 || highConflicts >= 1) {
    globalThreatLevel = "elevated";
  }

  res.json({
    totalCountries: countries.length,
    activeConflicts,
    escalatingConflicts,
    totalCommittees: committees.length,
    activeCommittees: committees.filter(c => c.status === "active").length,
    totalResolutions: resolutions.length,
    passedResolutions: resolutions.filter(r => r.status === "passed").length,
    totalDelegates: delegates.length,
    totalAlliances: alliances.length,
    totalLeaders: leaders.length,
    activeInterpolNotices: interpolNotices.filter(n => n.status === "active").length,
    activeIcjCases: icjCases.filter(c => c.status !== "concluded").length,
    globalThreatLevel,
    recentBriefings,
    conflictsByRegion,
    threatDistribution,
  });
});

export default router;
