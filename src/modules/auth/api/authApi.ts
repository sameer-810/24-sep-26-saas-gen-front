import { http } from "@/shared/api/http";
import type { AuthUser } from "@/modules/auth/authSlice";

export type LoginResponse = { accessToken: string; user: AuthUser };

export async function login(email: string, password: string) {
  const res = await http.post<{ data: LoginResponse }>("/auth/login", { email, password });
  return res.data.data;
}

export type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  role: AuthUser["role"];
  phone?: string;
};

export async function listUsers() {
  const res = await http.get<{ data: AuthUser[] }>("/auth/users");
  return res.data.data;
}

export async function createUser(payload: CreateUserPayload) {
  const res = await http.post<{ data: AuthUser }>("/auth/users", payload);
  return res.data.data;
}

export async function updateUser(
  id: string,
  payload: Partial<CreateUserPayload> & { isActive?: boolean },
) {
  const res = await http.patch<{ data: AuthUser }>(`/auth/users/${id}`, payload);
  return res.data.data;
}
