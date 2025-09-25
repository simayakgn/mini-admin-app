import { api } from "./client";
import type { Employee } from "../types";

export async function getEmployees({
  page = 1,
  limit = 10,
  sort,
  order,
  name,
  role,
}: {
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
  name?: string;
  role?: string;
}) {
  const params = new URLSearchParams();
  params.set("_page", String(page));
  params.set("_limit", String(limit));
  if (sort) {
    params.set("_sort", sort);
    params.set("_order", order || "asc");
  }
  if (name) params.set("name_like", name);
  if (role) params.set("role", role);
  const res = await api.get<Employee[]>("/employees?" + params.toString());
  const total = Number(res.headers["x-total-count"] || 0);
  return { data: res.data, total };
}
export const createEmployee = (payload: Partial<Employee>) =>
  api.post("/employees", payload);
export const updateEmployee = (id: number, payload: any) =>
  api.put(`/employees/${id}`, payload);
export const deleteEmployee = (id: number) => api.delete(`/employees/${id}`);
