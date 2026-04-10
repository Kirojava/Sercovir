import { pgTable, text, serial, timestamp, jsonb, date, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cyberIncidentsTable = pgTable("cyber_incidents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  attackType: text("attack_type").notNull().default("unknown"),
  threatActor: text("threat_actor"),
  attribution: text("attribution"),
  targetSector: text("target_sector"),
  targetCountry: text("target_country"),
  originCountry: text("origin_country"),
  severity: text("severity").notNull().default("medium"),
  status: text("status").notNull().default("active"),
  iocs: jsonb("iocs").$type<string[]>().default([]),
  ttps: jsonb("ttps").$type<string[]>().default([]),
  casualties: text("casualties"),
  financialDamage: text("financial_damage"),
  detectedDate: date("detected_date"),
  resolvedDate: date("resolved_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const aptGroupsTable = pgTable("apt_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  aliases: jsonb("aliases").$type<string[]>().default([]),
  attribution: text("attribution"),
  country: text("country"),
  active: text("active").default("yes"),
  sophistication: text("sophistication").notNull().default("medium"),
  primaryTargets: jsonb("primary_targets").$type<string[]>().default([]),
  knownTtps: jsonb("known_ttps").$type<string[]>().default([]),
  notableOperations: jsonb("notable_operations").$type<string[]>().default([]),
  firstSeen: date("first_seen"),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCyberIncidentSchema = createInsertSchema(cyberIncidentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCyberIncident = z.infer<typeof insertCyberIncidentSchema>;
export type CyberIncident = typeof cyberIncidentsTable.$inferSelect;

export const insertAptGroupSchema = createInsertSchema(aptGroupsTable).omit({ id: true, createdAt: true });
export type InsertAptGroup = z.infer<typeof insertAptGroupSchema>;
export type AptGroup = typeof aptGroupsTable.$inferSelect;
