import { pgTable, text, serial, timestamp, boolean, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const mediaEventsTable = pgTable("media_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  country: text("country").notNull(),
  countryCode: text("country_code"),
  category: text("category").notNull(),
  severity: text("severity").notNull().default("notable"),
  description: text("description"),
  date: date("date"),
  source: text("source"),
  isVerified: boolean("is_verified").default(true),
  tags: jsonb("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMediaEventSchema = createInsertSchema(mediaEventsTable).omit({ id: true, createdAt: true });
export type InsertMediaEvent = z.infer<typeof insertMediaEventSchema>;
export type MediaEvent = typeof mediaEventsTable.$inferSelect;
