import { pgTable, text, serial, timestamp, integer, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const parliamentaryTable = pgTable("parliamentary_discussions", {
  id: serial("id").primaryKey(),
  country: text("country").notNull(),
  countryCode: text("country_code"),
  chamber: text("chamber").notNull(),
  topic: text("topic").notNull(),
  description: text("description"),
  status: text("status").notNull().default("ongoing"),
  date: date("date"),
  outcome: text("outcome"),
  keyPoints: jsonb("key_points").$type<string[]>().default([]),
  votesFor: integer("votes_for").default(0),
  votesAgainst: integer("votes_against").default(0),
  abstentions: integer("abstentions").default(0),
  significance: text("significance").default("moderate"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertParliamentarySchema = createInsertSchema(parliamentaryTable).omit({ id: true, createdAt: true });
export type InsertParliamentary = z.infer<typeof insertParliamentarySchema>;
export type Parliamentary = typeof parliamentaryTable.$inferSelect;
