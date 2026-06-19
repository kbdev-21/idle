import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { findUsers, getMe, getUserById, updateMe, type FindUsersParams, type UpdateUserRequest } from "@/api/user/api.ts";

export const userKeys = {
  all: ["users"] as const,
  me: () => [...userKeys.all, "me"] as const,
  list: (params?: FindUsersParams) => [...userKeys.all, "list", params] as const,
  detail: (userId: string) => [...userKeys.all, "detail", userId] as const,
};

export function useMe() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: getMe,
  });
}

export function useUsers(params?: FindUsersParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => findUsers(params),
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateUserRequest) => updateMe(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
