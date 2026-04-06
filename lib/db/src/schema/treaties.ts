import { pgTable, text, serial, timestamp, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const treatiesTable = pgTable("treaties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  signatories: jsonb("signatories").$type<string[]>().default([]),
  status: text("status").notNull().default("in force"),
  signedDate: date("signed_date"),
  effectiveDate: date("effective_date"),
  description: text("description"),
  significance: text("significance").default("high"),
  relatedConflicts: jsonb("related_conflicts").$type<number[]>().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTreatySchema = createInsertSchema(treatiesTable).omit({ id: true, createdAt: true });
export type InsertTreaty = z.infer<typeof insertTreatySchema>;
export type Treaty = typeof treatiesTable.$inferSelect;
