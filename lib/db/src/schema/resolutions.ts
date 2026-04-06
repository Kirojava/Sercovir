import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const resolutionsTable = pgTable("resolutions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  committeeId: integer("committee_id").notNull(),
  sponsors: jsonb("sponsors").$type<string[]>().default([]),
  signatories: jsonb("signatories").$type<string[]>().default([]),
  preambularClauses: jsonb("preambular_clauses").$type<string[]>().default([]),
  operativeClauses: jsonb("operative_clauses").$type<string[]>().default([]),
  status: text("status").notNull().default("draft"),
  votesFor: integer("votes_for").default(0),
  votesAgainst: integer("votes_against").default(0),
  abstentions: integer("abstentions").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertResolutionSchema = createInsertSchema(resolutionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertResolution = z.infer<typeof insertResolutionSchema>;
export type Resolution = typeof resolutionsTable.$inferSelect;
