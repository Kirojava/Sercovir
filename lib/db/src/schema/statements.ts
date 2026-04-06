import { pgTable, text, serial, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const leaderStatementsTable = pgTable("leader_statements", {
  id: serial("id").primaryKey(),
  leaderId: integer("leader_id").notNull(),
  leaderName: text("leader_name"),
  country: text("country"),
  platform: text("platform").notNull(),
  content: text("content").notNull(),
  sentiment: text("sentiment").default("neutral"),
  topic: text("topic"),
  relatedCountries: jsonb("related_countries").$type<string[]>().default([]),
  engagement: integer("engagement").default(0),
  isControversial: boolean("is_controversial").default(false),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
});

export const insertStatementSchema = createInsertSchema(leaderStatementsTable).omit({ id: true });
export type InsertStatement = z.infer<typeof insertStatementSchema>;
export type LeaderStatement = typeof leaderStatementsTable.$inferSelect;
