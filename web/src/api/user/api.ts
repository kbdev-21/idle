import axiosInstance from "@/api/axios-instance.ts";

export async function getMe(): Promise<User> {
  const res = await axiosInstance.get<User>("/api/users/me");
  return res.data;
}

export async function findUsers(params?: FindUsersParams): Promise<User[]> {
  const res = await axiosInstance.get<User[]>("/api/users", { params });
  return res.data;
}

export async function getUserById(userId: string): Promise<User> {
  const res = await axiosInstance.get<User>(`/api/users/${userId}`);
  return res.data;
}

export async function updateMe(request: UpdateUserRequest): Promise<User> {
  const res = await axiosInstance.patch<User>("/api/users/me", request);
  return res.data;
}

export type UserType = "GUEST" | "USER" | "ADMIN";

export type CaroStat = {
  id: string;
  userId: string;
  rating: number;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  createdAt: string;
  updatedAt: string;
};

export type User = {
  id: string;
  type: UserType;
  name: string;
  avtUrl: string;
  email: string | null;
  createdAt: string;
  updatedAt: string;
  caroStat: CaroStat | null;
};

export type FindUsersParams = {
  search?: string;
  offset?: number;
  limit?: number;
};

export type UpdateUserRequest = {
  name: string;
};
