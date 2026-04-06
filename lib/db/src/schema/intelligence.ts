import { pgTable, text, serial, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const intelligenceTable = pgTable("intelligence_briefings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull().default("update"),
  priority: text("priority").notNull().default("medium"),
  relatedCountries: jsonb("related_countries").$type<string[]>().default([]),
  relatedConflicts: jsonb("related_conflicts").$type<number[]>().default([]),
  source: text("source"),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
});

export const insertIntelligenceSchema = createInsertSchema(intelligenceTable).omit({ id: true, timestamp: true });
export type InsertIntelligence = z.infer<typeof insertIntelligenceSchema>;
export type Intelligence = typeof intelligenceTable.$inferSelect;
