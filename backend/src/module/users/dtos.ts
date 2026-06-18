import { z } from "zod";

export const UpdateUserRequestSchema = z.object({
  name: z.string().min(1).max(20),
});

export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
