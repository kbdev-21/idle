import { boolean, index, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { defineRelations } from "drizzle-orm";
import { db } from "./db.js";
// users
export const users = pgTable("users", {
    id: uuid("id").primaryKey(),
    type: text("type").$type().notNull(),
    name: text("name").notNull(),
    avtUrl: text("avt_url").notNull(),
    email: text("email").unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdateFn(() => new Date()).notNull(),
});
// user_caro_stats
export const userCaroStats = pgTable("user_caro_stats", {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id").notNull().unique(),
    rating: integer("rating").notNull(),
    matches: integer("matches").notNull(),
    wins: integer("wins").notNull(),
    draws: integer("draws").notNull(),
    losses: integer("losses").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdateFn(() => new Date()).notNull(),
});
// caro_matches
export const caroMatches = pgTable("caro_matches", {
    id: uuid("id").primaryKey(),
    xId: uuid("x_id").notNull(),
    xRating: integer("x_rating").notNull(),
    xNewRating: integer("x_new_rating").notNull(),
    oId: uuid("o_id").notNull(),
    oRating: integer("o_rating").notNull(),
    oNewRating: integer("o_new_rating").notNull(),
    winnerId: uuid("winner_id"),
    states: jsonb("states").$type().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
    index().on(table.xId),
    index().on(table.oId)
]);
export const relations = defineRelations({
    users,
    userCaroStats,
    caroMatches
}, (r) => ({
    users: {
        caroStat: r.one.userCaroStats({
            to: r.userCaroStats.userId,
            from: r.users.id,
        })
    },
    caroMatches: {
        xPlayer: r.one.users({
            to: r.users.id,
            from: r.caroMatches.xId,
        }),
        oPlayer: r.one.users({
            to: r.users.id,
            from: r.caroMatches.oId,
        }),
    }
}));
