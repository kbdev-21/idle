import { Hono } from "hono";
import { getUserById, findUsers } from "../service/user.service.js";
import { authMiddleware } from "../../auth/auth.middleware.js";
export const userRouter = new Hono();
userRouter.get("/api/users/me", authMiddleware, async (c) => {
    const currentUser = c.get("currentUser");
    return c.json(currentUser);
});
userRouter.get("/api/users", authMiddleware, async (c) => {
    const { search, offset, limit } = c.req.query();
    const users = await findUsers(search, offset ? Number(offset) : undefined, limit ? Number(limit) : undefined);
    return c.json(users);
});
userRouter.get("/api/users/:userId", authMiddleware, async (c) => {
    const userId = c.req.param("userId");
    const user = await getUserById(userId);
    return c.json(user);
});
