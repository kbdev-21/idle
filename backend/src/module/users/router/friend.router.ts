import {Hono} from "hono";
import {findFriendsByUserId, sendFriendRequest, acceptFriendRequest} from "../service/friend.service.js";
import {authMiddleware} from "../../auth/auth.middleware.js";
import type {AppTypes} from "../../../core/types.js";

export const friendRouter = new Hono<{Variables: AppTypes}>();

friendRouter.get("/api/users/me/friends",
  authMiddleware,
  async (c) => {
    const currentUserId = c.get("currentUser").id;
    const { search, offset, limit } = c.req.query();
    const friends = await findFriendsByUserId(
      currentUserId,
      search,
      offset ? Number(offset) : undefined,
      limit ? Number(limit) : undefined,
    );
    return c.json(friends);
  }
);

friendRouter.post("/api/users/add-friend/:userId",
  authMiddleware,
  async (c) => {
    const requesterId = c.get("currentUser").id;
    const receiverId = c.req.param("userId");
    const friendship = await sendFriendRequest(requesterId, receiverId);
    return c.json(friendship, 201);
  }
);

friendRouter.post("/api/users/accept-friend-request/:friendshipId",
  authMiddleware,
  async (c) => {
    const accepterId = c.get("currentUser").id;
    const friendshipId = c.req.param("friendshipId");
    const friendship = await acceptFriendRequest(friendshipId, accepterId);
    return c.json(friendship);
  }
);
