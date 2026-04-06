import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const committeesTable = pgTable("committees", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  abbreviation: text("abbreviation").notNull(),
  topic: text("topic").notNull(),
  description: text("description"),
  session: text("session"),
  chairperson: text("chairperson"),
  status: text("status").notNull().default("upcoming"),
  delegateCount: integer("delegate_count").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCommitteeSchema = createInsertSchema(committeesTable).omit({ id: true, createdAt: true });
export type InsertCommittee = z.infer<typeof insertCommitteeSchema>;
export type Committee = typeof committeesTable.$inferSelect;
