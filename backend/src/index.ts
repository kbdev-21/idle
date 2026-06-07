import 'reflect-metadata';
import 'dotenv/config';
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import {dataSource} from "./core/data-source.js";
import {userController} from "./module/users/controller/user.controller.js";
import {friendController} from "./module/users/controller/friend.controller.js";
import type {User} from "./module/users/entity/user.entity.js";
import type {AppTypes} from "./core/core-types.js";

const app = new Hono<{Variables: AppTypes}>();

app.use("*", cors({
  origin: process.env.WEB_URL ?? "http://localhost:5173",
  allowMethods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

app.route("/", userController);
app.route("/", friendController);

dataSource.initialize().then(() => {
  serve({
    fetch: app.fetch,
    port: 3000
  }, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  })
}).catch((err) => {
  console.error("Failed to connect to database:", err);
  process.exit(1);
});
