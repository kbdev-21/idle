import 'reflect-metadata';
import 'dotenv/config';
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import {appDataSource} from "./core/appDataSource.js";
import {userController} from "./module/users/controller/userController.js";
import type {User} from "./module/users/entity/User.js";
import type {AppVariables} from "./core/AppVariables.js";

const app = new Hono<{Variables: AppVariables}>();

app.route("/", userController);

appDataSource.initialize().then(() => {
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
