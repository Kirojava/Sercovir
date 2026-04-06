import { pgTable, text, serial, timestamp, integer, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const conflictsTable = pgTable("conflicts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  region: text("region").notNull(),
  status: text("status").notNull().default("active"),
  severity: text("severity").notNull().default("medium"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  partiesInvolved: jsonb("parties_involved").$type<string[]>().default([]),
  casualties: integer("casualties"),
  displacedPersons: integer("displaced_persons"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertConflictSchema = createInsertSchema(conflictsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertConflict = z.infer<typeof insertConflictSchema>;
export type Conflict = typeof conflictsTable.$inferSelect;
