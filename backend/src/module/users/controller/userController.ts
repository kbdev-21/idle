import {Hono} from "hono";
import {zValidator} from "@hono/zod-validator";
import {userService} from "../service/userService.js";
import {followingService} from "../service/followingService.js";
import {CreateUserRequestSchema} from "../dto/CreateUserRequest.js";
import {FindUsersQuerySchema} from "../dto/FindUsersQuery.js";
import {authMiddleware} from "../../auth/authMiddleware.js";
import type {AppVariables} from "../../../core/AppVariables.js";
import {toUserResponse} from "../dto/UserResponse.js";
import {toUserFollowerResponse} from "../dto/UserFollowerResponse.js";

export const userController = new Hono<{Variables: AppVariables}>();

userController.get("/api/users",
  authMiddleware,
  zValidator("query", FindUsersQuerySchema),
  async (c) => {
    const query = c.req.valid("query");
    const users = await userService.findUsers(query);
    return c.json(users.map(toUserResponse));
  }
);

userController.get("/api/users/:userId",
  authMiddleware,
  async (c) => {
    console.log("Current user is: " + c.get("currentUser").name);

    const userId = c.req.param("userId");
    const user = await userService.getUserById(userId);
    return c.json(toUserResponse(user));
  }
);

userController.post("/api/users",
  zValidator("json", CreateUserRequestSchema),
  async (c) => {
    const body = c.req.valid("json");
    const user = await userService.createUser(body);
    return c.json(toUserResponse(user), 201);
  }
);

userController.post("/api/users/:userId/follow",
  authMiddleware,
  async (c) => {
    const userId = c.req.param("userId");
    const followerId = c.get("currentUser").id;
    const record = await followingService.follow(userId, followerId);
    return c.json(toUserFollowerResponse(record), 201);
  }
);

userController.post("/api/users/:userId/unfollow",
  authMiddleware,
  async (c) => {
    const userId = c.req.param("userId");
    const followerId = c.get("currentUser").id;
    await followingService.unfollow(userId, followerId);
    return c.body(null, 204);
  }
);

userController.get("/api/users/:userId/followers",
  authMiddleware,
  async (c) => {
    const userId = c.req.param("userId");
    const records = await followingService.findFollowers(userId);
    return c.json(records.map(toUserFollowerResponse));
  }
);

userController.get("/api/users/:userId/following",
  authMiddleware,
  async (c) => {
    const userId = c.req.param("userId");
    const records = await followingService.findFollowing(userId);
    return c.json(records.map(toUserFollowerResponse));
  }
);