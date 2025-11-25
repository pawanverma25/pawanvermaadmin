export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface Resume {
  id: number;
  userId: number;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  fileLatex?: string;
  isActive: boolean;
  uploadedAt: string;
}

export interface WorkExperience {
  id: number;
  userId: number;
  company: string;
  designation: string;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  description: string;
  location?: string;
  displayOrder: number;
}

export interface ExperienceRequest {
  userId: number;
  company: string;
  designation: string;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  description: string;
  location?: string;
  displayOrder: number;
}

export interface Education {
  id: number;
  userId: number;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  description?: string;
  location?: string;
  displayOrder: number;
}

export interface EducationRequest {
  userId: number;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  description?: string;
  location?: string;
  displayOrder: number;
}

export interface Project {
  id: number;
  userId: number;
  title: string;
  description: string;
  githubLink?: string;
  liveLink?: string;
  displayOrder: number;
  featured: boolean;
}

export interface ProjectRequest {
  userId: number;
  title: string;
  description: string;
  githubLink?: string;
  liveLink?: string;
  displayOrder: number;
  featured: boolean;
}

