import { apiFetch } from "./http";
import {
  PaginatedResponse,
  Project,
  ProjectRequest,
} from "@/types/api";
import { DEFAULT_PAGE_SIZE } from "./config";

export interface ProjectQuery {
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

export const projectsApi = {
  list({ userId, page = 0, size = DEFAULT_PAGE_SIZE }: ProjectQuery) {
    const query = buildQuery({ userId, page, size });
    return apiFetch<PaginatedResponse<Project>>(`/api/projects?${query}`);
  },
  getById(id: number) {
    return apiFetch<Project>(`/api/projects/${id}`);
  },
  create(payload: ProjectRequest) {
    return apiFetch<Project>("/api/projects", {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    });
  },
  update(id: number, payload: Partial<ProjectRequest>) {
    return apiFetch<Project>(`/api/projects/${id}`, {
      method: "PUT",
      body: payload as unknown as Record<string, unknown>,
    });
  },
  delete(id: number) {
    return apiFetch<void>(`/api/projects/${id}`, {
      method: "DELETE",
    });
  },
};

