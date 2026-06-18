import {Hono} from "hono";
import {getCaroMatchById, findCaroMatches} from "../service/caro-match.service.js";
import {authMiddleware} from "../../auth/auth.middleware.js";
import type {AppTypes} from "../../../core/types.js";

export const caroRouter = new Hono<{Variables: AppTypes}>();

caroRouter.get("/api/caro-matches",
  authMiddleware,
  async (c) => {
    const {
      userId,
      offset,
      limit
    } = c.req.query();

    const matches = await findCaroMatches(
      userId,
      offset ? Number(offset) : undefined,
      limit ? Number(limit) : undefined,
    );

    return c.json(matches);
  }
);

caroRouter.get("/api/caro-matches/:matchId",
  authMiddleware,
  async (c) => {
    const matchId = c.req.param("matchId");
    const match = await getCaroMatchById(matchId);
    return c.json(match);
  }
);
