import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const delegatesTable = pgTable("delegates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  countryCode: text("country_code"),
  committeeId: integer("committee_id").notNull(),
  position: text("position").notNull().default("delegate"),
  bloc: text("bloc"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDelegateSchema = createInsertSchema(delegatesTable).omit({ id: true, createdAt: true });
export type InsertDelegate = z.infer<typeof insertDelegateSchema>;
export type Delegate = typeof delegatesTable.$inferSelect;
