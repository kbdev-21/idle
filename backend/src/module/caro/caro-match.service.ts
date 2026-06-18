import {db} from "../../database/db.js";
import {HTTPException} from "hono/http-exception";

const caroMatchFullRelations = {
  xPlayer: {
    with: {
      caroStat: true
    }
  },
  oPlayer: {
    with: {
      caroStat: true
    }
  },
};

const caroMatchDetailQuery = db.query.caroMatches.findFirst({
  with: caroMatchFullRelations
});

const caroMatchSummaryQuery = db.query.caroMatches.findFirst({
  with: caroMatchFullRelations,
  columns: {
    states: false
  }
});

export type CaroMatchDbDetail = Awaited<NonNullable<typeof caroMatchDetailQuery>>;
export type CaroMatchDbSummary = Awaited<NonNullable<typeof caroMatchSummaryQuery>>;

export async function getCaroMatchById(id: string): Promise<CaroMatchDbDetail> {
  const match = await db.query.caroMatches.findFirst({
    where: {
      id: id
    },
    with: caroMatchFullRelations
  });

  if(!match) {
    throw new HTTPException(404, {message: "Caro match not found"});
  }

  return match;
}

export async function findCaroMatches(userId: string, offset: number = 0, limit: number = 10): Promise<CaroMatchDbSummary[]> {
  return await db.query.caroMatches.findMany({
    where: {
      OR: [
        {xPlayerId: userId},
        {oPlayerId: userId}
      ]
    },
    offset: offset,
    limit: limit,
    orderBy: {
      createdAt: "desc"
    },
    with: caroMatchFullRelations,
    columns: {
      states: false
    }
  });
}