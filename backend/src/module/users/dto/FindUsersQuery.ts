import { z } from "zod";

export const FindUsersQuerySchema = z.object({
  search: z.string().optional(),
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["name", "id"]).default("id"),
  sortDir: z.enum(["ASC", "DESC"]).default("ASC"),
});

export type FindUsersQuery = z.infer<typeof FindUsersQuerySchema>;
