import { pgTable, text, serial, timestamp, jsonb, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const militaryActivitiesTable = pgTable("military_activities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull().default("deployment"),
  status: text("status").notNull().default("active"),
  threatLevel: text("threat_level").notNull().default("medium"),
  country: text("country").notNull(),
  countryCode: text("country_code"),
  flagEmoji: text("flag_emoji"),
  region: text("region").notNull(),
  location: text("location"),
  lat: real("lat"),
  lng: real("lng"),
  involvedCountries: jsonb("involved_countries").$type<string[]>().default([]),
  forces: text("forces"),
  assets: jsonb("assets").$type<string[]>().default([]),
  estimatedPersonnel: text("estimated_personnel"),
  objective: text("objective"),
  description: text("description"),
  isNatoRelated: boolean("is_nato_related").default(false),
  isJoint: boolean("is_joint").default(false),
  startDate: text("start_date"),
  endDate: text("end_date"),
  isOngoing: boolean("is_ongoing").default(true),
  updates: jsonb("updates").$type<string[]>().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertMilitaryActivitySchema = createInsertSchema(militaryActivitiesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMilitaryActivity = z.infer<typeof insertMilitaryActivitySchema>;
export type MilitaryActivity = typeof militaryActivitiesTable.$inferSelect;
