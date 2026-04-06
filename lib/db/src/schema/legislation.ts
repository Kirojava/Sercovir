import { pgTable, text, serial, timestamp, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const legislationTable = pgTable("legislation", {
  id: serial("id").primaryKey(),
  country: text("country").notNull(),
  countryCode: text("country_code"),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("proposed"),
  category: text("category").notNull(),
  proposedDate: date("proposed_date"),
  enactedDate: date("enacted_date"),
  proposedBy: text("proposed_by"),
  supportingParties: jsonb("supporting_parties").$type<string[]>().default([]),
  opposingParties: jsonb("opposing_parties").$type<string[]>().default([]),
  publicOpinion: text("public_opinion").default("mixed"),
  impact: text("impact"),
  controversyLevel: text("controversy_level").default("moderate"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLegislationSchema = createInsertSchema(legislationTable).omit({ id: true, createdAt: true });
export type InsertLegislation = z.infer<typeof insertLegislationSchema>;
export type Legislation = typeof legislationTable.$inferSelect;
