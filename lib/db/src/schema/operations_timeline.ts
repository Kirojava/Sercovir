import { pgTable, text, serial, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const operationsTimelineTable = pgTable("operations_timeline", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary"),
  category: text("category").notNull().default("geopolitical"),
  priority: text("priority").notNull().default("medium"),
  region: text("region"),
  countries: jsonb("countries").$type<string[]>().default([]),
  source: text("source"),
  sourceUrl: text("source_url"),
  isAlert: boolean("is_alert").default(false),
  relatedEntityType: text("related_entity_type"),
  relatedEntityId: text("related_entity_id"),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertOperationsTimelineSchema = createInsertSchema(operationsTimelineTable).omit({ id: true, createdAt: true });
export type InsertOperationsTimeline = z.infer<typeof insertOperationsTimelineSchema>;
export type OperationsTimeline = typeof operationsTimelineTable.$inferSelect;
