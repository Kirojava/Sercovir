import { pgTable, text, serial, timestamp, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const alliancesTable = pgTable("alliances", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  abbreviation: text("abbreviation"),
  type: text("type").notNull().default("political"),
  description: text("description"),
  founded: date("founded"),
  memberCountries: jsonb("member_countries").$type<string[]>().default([]),
  headquarters: text("headquarters"),
  strength: text("strength").notNull().default("moderate"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAllianceSchema = createInsertSchema(alliancesTable).omit({ id: true, createdAt: true });
export type InsertAlliance = z.infer<typeof insertAllianceSchema>;
export type Alliance = typeof alliancesTable.$inferSelect;
