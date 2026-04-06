import { pgTable, text, serial, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const icjTable = pgTable("icj_cases", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  applicantCountry: text("applicant_country").notNull(),
  respondentCountry: text("respondent_country").notNull(),
  caseType: text("case_type").notNull(),
  status: text("status").notNull().default("filed"),
  filedDate: date("filed_date"),
  description: text("description"),
  currentPhase: text("current_phase"),
  lastUpdate: text("last_update"),
  significance: text("significance").default("high"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertIcjSchema = createInsertSchema(icjTable).omit({ id: true, createdAt: true });
export type InsertIcj = z.infer<typeof insertIcjSchema>;
export type Icj = typeof icjTable.$inferSelect;
