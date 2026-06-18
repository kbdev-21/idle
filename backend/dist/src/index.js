import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { userRouter } from "./module/users/router/user.router.js";
import { caroRouter } from "./module/caro/caro.router.js";
import { handleWsUpgrade } from "./module/websocket/websocket.manager.js";
const app = new Hono();
app.use("*", cors({
    origin: process.env.WEB_URL ?? "http://localhost:5173",
    allowMethods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
}));
app.route("/", userRouter);
app.route("/", caroRouter);
const server = serve({
    fetch: app.fetch,
    port: 3000
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
server.on("upgrade", (req, socket, head) => {
    handleWsUpgrade(req, socket, head).catch(() => {
        socket.destroy();
    });
});
