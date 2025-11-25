import { apiFetch } from "./http";
import { PaginatedResponse, Resume } from "@/types/api";
import { DEFAULT_PAGE_SIZE } from "./config";

export interface ResumeQuery {
  page?: number;
  size?: number;
  userId?: number;
}

export const resumesApi = {
  upload(formData: FormData) {
    return apiFetch<Resume>("/api/resumes", {
      method: "POST",
      body: formData,
      isFormData: true,
    });
  },
  list(params: ResumeQuery = {}) {
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(params.page ?? 0));
    searchParams.set("size", String(params.size ?? DEFAULT_PAGE_SIZE));
    if (typeof params.userId === "number") {
      searchParams.set("userId", String(params.userId));
    }

    return apiFetch<PaginatedResponse<Resume>>(
      `/api/resumes?${searchParams.toString()}`
    );
  },
  updateStatus(id: number, isActive: boolean) {
    return apiFetch<Resume>(
      `/api/resumes/${id}/status?active=${String(isActive)}`,
      {
        method: "PUT",
      }
    );
  },
  delete(id: number) {
    return apiFetch<void>(`/api/resumes/${id}`, {
      method: "DELETE",
    });
  },
};

