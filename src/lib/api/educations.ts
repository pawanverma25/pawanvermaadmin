import { apiFetch } from "./http";
import {
  Education,
  EducationRequest,
  PaginatedResponse,
} from "@/types/api";
import { DEFAULT_PAGE_SIZE } from "./config";

export interface EducationQuery {
  userId?: number;
  page?: number;
  size?: number;
}

const buildQuery = (query: Record<string, string | number | undefined>) => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    params.set(key, String(value));
  });
  return params.toString();
};

export const educationsApi = {
  list({ userId, page = 0, size = DEFAULT_PAGE_SIZE }: EducationQuery) {
    const query = buildQuery({ userId, page, size });
    return apiFetch<PaginatedResponse<Education>>(`/api/educations?${query}`);
  },
  getById(id: number) {
    return apiFetch<Education>(`/api/educations/${id}`);
  },
  create(payload: EducationRequest) {
    return apiFetch<Education>("/api/educations", {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    });
  },
  update(id: number, payload: Partial<EducationRequest>) {
    return apiFetch<Education>(`/api/educations/${id}`, {
      method: "PUT",
      body: payload as unknown as Record<string, unknown>,
    });
  },
  delete(id: number) {
    return apiFetch<void>(`/api/educations/${id}`, {
      method: "DELETE",
    });
  },
};

