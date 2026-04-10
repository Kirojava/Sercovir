import { pgTable, text, serial, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const nuclearProgramsTable = pgTable("nuclear_programs", {
  id: serial("id").primaryKey(),
  country: text("country").notNull(),
  countryCode: text("country_code"),
  flagEmoji: text("flag_emoji"),
  programStatus: text("program_status").notNull().default("suspected"),
  nuclearWarheads: integer("nuclear_warheads"),
  deliveryCapability: jsonb("delivery_capability").$type<string[]>().default([]),
  programType: jsonb("program_type").$type<string[]>().default([]),
  treatyStatus: jsonb("treaty_status").$type<string[]>().default([]),
  latestTest: text("latest_test"),
  threatLevel: text("threat_level").notNull().default("medium"),
  iaeaCompliance: text("iaea_compliance").default("full"),
  estimatedRange: integer("estimated_range"),
  description: text("description"),
  recentDevelopments: jsonb("recent_developments").$type<string[]>().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertNuclearProgramSchema = createInsertSchema(nuclearProgramsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertNuclearProgram = z.infer<typeof insertNuclearProgramSchema>;
export type NuclearProgram = typeof nuclearProgramsTable.$inferSelect;
