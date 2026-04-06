import { pgTable, text, serial, timestamp, numeric, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const countriesTable = pgTable("countries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  region: text("region").notNull(),
  flagEmoji: text("flag_emoji"),
  politicalSystem: text("political_system"),
  gdp: numeric("gdp"),
  population: integer("population"),
  militaryBudget: numeric("military_budget"),
  threatLevel: text("threat_level").notNull().default("low"),
  stabilityIndex: numeric("stability_index"),
  keyAlliances: jsonb("key_alliances").$type<string[]>().default([]),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCountrySchema = createInsertSchema(countriesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCountry = z.infer<typeof insertCountrySchema>;
export type Country = typeof countriesTable.$inferSelect;
