import { pgTable, text, serial, timestamp, numeric, boolean, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const worldLeadersTable = pgTable("world_leaders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  countryCode: text("country_code"),
  position: text("position").notNull(),
  party: text("party"),
  ideology: text("ideology"),
  bornDate: date("born_date"),
  nationality: text("nationality"),
  education: text("education"),
  background: text("background"),
  previousRoles: jsonb("previous_roles").$type<string[]>().default([]),
  netWorth: text("net_worth"),
  twitterHandle: text("twitter_handle"),
  approvalRating: numeric("approval_rating"),
  isCurrentlyInPower: boolean("is_currently_in_power").default(true),
  notableAchievements: jsonb("notable_achievements").$type<string[]>().default([]),
  controversies: jsonb("controversies").$type<string[]>().default([]),
  currentLocation: text("current_location"),
  recentTravel: jsonb("recent_travel").$type<string[]>().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLeaderSchema = createInsertSchema(worldLeadersTable).omit({ id: true, createdAt: true });
export type InsertLeader = z.infer<typeof insertLeaderSchema>;
export type WorldLeader = typeof worldLeadersTable.$inferSelect;
