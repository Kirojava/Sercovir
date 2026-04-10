import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { db, countriesTable, conflictsTable, worldLeadersTable, alliancesTable, interpolTable, icjTable, intelligenceTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are ARES — Advanced Reconnaissance and Evaluation System — the AI core of SERCOVIR, a classified geopolitical intelligence platform used by senior analysts and policymakers.

You have access to a live database of global intelligence including: 20 monitored nations, world leaders, active conflicts, alliances, Interpol notices, ICJ cases, intelligence briefings, economic indicators, cyber incidents, and nuclear programs.

Today's date is April 2026.

KEY CURRENT CONTEXT (April 2026):
- Russia-Ukraine War continues (Year 3+), Ukraine holding with Western support
- Gaza conflict ongoing, ceasefire negotiations stalled
- China-Taiwan tensions at elevated level, PLA exercises near strait
- North Korea ICBM program accelerating, multiple tests in 2025-2026
- Sudan Civil War (SAF vs RSF) creating humanitarian crisis
- Myanmar junta losing territory to resistance forces
- Global debt levels at record highs, USD supremacy challenged by BRICS alternatives
- Donald Trump returned to US presidency (Jan 2025), transactional foreign policy
- Xi Jinping consolidated power, 3rd term, nationalistic posture
- AI warfare capabilities emerging as strategic domain

Your responses should be:
- Authoritative and analytical (intelligence analyst tone)
- Structured with clear sections when appropriate (use ## headers)
- Include threat assessments, key actors, likely scenarios
- Reference specific countries, leaders, and events from the database
- Bold key terms using **bold**
- Concise but comprehensive (aim for 400-600 words unless asked for more)
- Include confidence levels where appropriate: [HIGH CONFIDENCE], [MEDIUM CONFIDENCE], [ASSESSED]
- End critical assessments with a BOTTOM LINE UP FRONT (BLUF)`;

router.post("/ai/analyze", async (req, res): Promise<void> => {
  const { query, entityType, entityName, context } = req.body as {
    query: string;
    entityType?: string;
    entityName?: string;
    context?: string;
  };

  if (!query || query.trim().length < 3) {
    res.status(400).json({ error: "Query required" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const [recentBriefings] = await Promise.all([
      db.select().from(intelligenceTable).orderBy(desc(intelligenceTable.timestamp)).limit(5),
    ]);

    const briefingContext = recentBriefings.map(b => `[${b.priority?.toUpperCase()}] ${b.title}: ${b.summary || ""}`).join("\n");

    let userMessage = query;
    if (entityType && entityName) {
      userMessage = `[ENTITY CONTEXT: ${entityType.toUpperCase()} — ${entityName}]\n\n${query}`;
    }
    if (context) {
      userMessage += `\n\nADDITIONAL CONTEXT:\n${context}`;
    }
    if (briefingContext) {
      userMessage += `\n\nRECENT INTELLIGENCE BRIEFINGS:\n${briefingContext}`;
    }

    const stream = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Analysis failed";
    res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
    res.end();
  }
});

router.post("/ai/quick-assess", async (req, res): Promise<void> => {
  const { entityType, entityName } = req.body as { entityType: string; entityName: string };

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 2048,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Generate a rapid intelligence assessment (3-4 paragraphs) for: ${entityType.toUpperCase()}: ${entityName}. Include threat level assessment, key concerns, and 1-2 near-term scenarios. Keep it tight and actionable.` },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Assessment failed";
    res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
    res.end();
  }
});

router.post("/ai/threat-brief", async (req, res): Promise<void> => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const [conflicts, countries] = await Promise.all([
      db.select().from(conflictsTable),
      db.select().from(countriesTable),
    ]);

    const activeConflicts = conflicts.filter(c => c.status === "active" || c.status === "escalating");
    const criticalCountries = countries.filter(c => c.threatLevel === "critical");

    const context = `Active conflicts (${activeConflicts.length}): ${activeConflicts.map(c => c.title).join(", ")}\nCritical threat nations: ${criticalCountries.map(c => c.name).join(", ")}`;

    const stream = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 4096,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Generate today's GLOBAL THREAT BRIEF (April 2026). Cover: (1) Top 3 immediate threats, (2) Escalation risks in next 72 hours, (3) Strategic watch items for next 30 days, (4) Recommended posture.\n\nCurrent platform data:\n${context}` },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Brief generation failed";
    res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
    res.end();
  }
});

export default router;
