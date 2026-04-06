import { pgTable, text, serial, timestamp, boolean, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const criminalCasesTable = pgTable("criminal_cases", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  country: text("country").notNull(),
  court: text("court"),
  caseType: text("case_type").notNull(),
  status: text("status").notNull().default("investigation"),
  defendants: jsonb("defendants").$type<string[]>().default([]),
  charges: jsonb("charges").$type<string[]>().default([]),
  description: text("description"),
  startDate: date("start_date"),
  verdict: text("verdict"),
  sentencing: text("sentencing"),
  internationalInvolvement: boolean("international_involvement").default(false),
  severity: text("severity").notNull().default("moderate"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCriminalCaseSchema = createInsertSchema(criminalCasesTable).omit({ id: true, createdAt: true });
export type InsertCriminalCase = z.infer<typeof insertCriminalCaseSchema>;
export type CriminalCase = typeof criminalCasesTable.$inferSelect;
