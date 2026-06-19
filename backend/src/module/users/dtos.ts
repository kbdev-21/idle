import { z } from "zod";
import type { UserAvtCode } from "../../database/schema.js";

const avtCodes = ["BUNNY", "KITTEN", "GRIZZLE", "HAMSTER", "MONKEY"] as const satisfies readonly UserAvtCode[];

export const UpdateUserRequestSchema = z.object({
  name: z.string().min(1).max(20).optional(),
  avtCode: z.enum(avtCodes).optional(),
});

export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
