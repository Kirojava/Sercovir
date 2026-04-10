import { Router, type IRouter } from "express";
import { db, countriesTable, worldLeadersTable, alliancesTable, conflictsTable, treatiesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/entity-graph", async (_req, res): Promise<void> => {
  const [countries, leaders, alliances, conflicts, treaties] = await Promise.all([
    db.select().from(countriesTable),
    db.select().from(worldLeadersTable),
    db.select().from(alliancesTable),
    db.select().from(conflictsTable),
    db.select().from(treatiesTable),
  ]);

  const nodes: Array<{
    id: string;
    type: string;
    label: string;
    subtitle?: string;
    meta?: string;
    size: number;
    color: string;
  }> = [];

  const edges: Array<{
    source: string;
    target: string;
    label: string;
    type: string;
  }> = [];

  const countryNameToId = new Map<string, string>();

  for (const c of countries) {
    const nodeId = `country-${c.id}`;
    countryNameToId.set(c.name.toLowerCase(), nodeId);
    countryNameToId.set(c.code.toLowerCase(), nodeId);
    nodes.push({
      id: nodeId,
      type: "country",
      label: `${c.flagEmoji || ""} ${c.name}`,
      subtitle: c.region,
      meta: c.threatLevel,
      size: c.threatLevel === "critical" ? 20 : c.threatLevel === "high" ? 16 : 12,
      color: c.threatLevel === "critical" ? "#ef4444" : c.threatLevel === "high" ? "#f97316" : c.threatLevel === "elevated" ? "#eab308" : "#22c55e",
    });
  }

  for (const l of leaders) {
    if (!l.isCurrentlyInPower) continue;
    const nodeId = `leader-${l.id}`;
    nodes.push({
      id: nodeId,
      type: "leader",
      label: l.name,
      subtitle: l.position,
      meta: l.country,
      size: 10,
      color: "#818cf8",
    });
    const countryNode = countryNameToId.get(l.country.toLowerCase());
    if (countryNode) {
      edges.push({ source: nodeId, target: countryNode, label: "leads", type: "governs" });
    }
  }

  for (const a of alliances) {
    const nodeId = `alliance-${a.id}`;
    nodes.push({
      id: nodeId,
      type: "alliance",
      label: a.abbreviation || a.name,
      subtitle: a.type,
      meta: a.strength,
      size: 18,
      color: "#38bdf8",
    });
    const members = a.memberCountries || [];
    for (const member of members) {
      const countryNode = countryNameToId.get(member.toLowerCase());
      if (countryNode) {
        edges.push({ source: nodeId, target: countryNode, label: "member", type: "alliance" });
      }
    }
  }

  for (const c of conflicts) {
    if (c.status !== "active" && c.status !== "escalating") continue;
    const nodeId = `conflict-${c.id}`;
    nodes.push({
      id: nodeId,
      type: "conflict",
      label: c.title.length > 25 ? c.title.slice(0, 25) + "…" : c.title,
      subtitle: c.region,
      meta: c.severity,
      size: c.severity === "critical" ? 16 : c.severity === "high" ? 13 : 10,
      color: "#f43f5e",
    });
    const parties = c.partiesInvolved || [];
    for (const party of parties) {
      const countryNode = countryNameToId.get(party.toLowerCase());
      if (countryNode) {
        edges.push({ source: nodeId, target: countryNode, label: "involves", type: "conflict" });
      }
    }
  }

  for (const t of treaties) {
    if (t.status === "superseded" || t.status === "expired") continue;
    const parties = t.signatories || [];
    if (parties.length >= 2) {
      for (let i = 0; i < parties.length - 1; i++) {
        const src = countryNameToId.get(parties[i].toLowerCase());
        const tgt = countryNameToId.get(parties[i + 1].toLowerCase());
        if (src && tgt && src !== tgt) {
          edges.push({ source: src, target: tgt, label: t.type || "treaty", type: "treaty" });
        }
      }
    }
  }

  res.json({ nodes, edges });
});

export default router;
