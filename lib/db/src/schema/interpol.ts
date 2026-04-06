import { pgTable, text, serial, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const interpolTable = pgTable("interpol_notices", {
  id: serial("id").primaryKey(),
  noticeType: text("notice_type").notNull().default("red"),
  subjectName: text("subject_name").notNull(),
  nationality: text("nationality"),
  chargedBy: text("charged_by"),
  charges: text("charges"),
  description: text("description"),
  dangerLevel: text("danger_level").default("moderate"),
  lastKnownLocation: text("last_known_location"),
  status: text("status").notNull().default("active"),
  issuedDate: date("issued_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertInterpolSchema = createInsertSchema(interpolTable).omit({ id: true, createdAt: true });
export type InsertInterpol = z.infer<typeof insertInterpolSchema>;
export type Interpol = typeof interpolTable.$inferSelect;
