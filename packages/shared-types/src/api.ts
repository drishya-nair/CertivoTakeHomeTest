// API-related types and interfaces

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  status: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiEndpoints {
  auth: {
    login: string;
    logout: string;
    refresh: string;
  };
  bom: {
    list: string;
    create: string;
    update: string;
    delete: string;
  };
  compliance: {
    list: string;
    upload: string;
  };
  merged: {
    list: string;
  };
}

export const API_ENDPOINTS: ApiEndpoints = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
  },
  bom: {
    list: "/bom",
    create: "/bom",
    update: "/bom/:id",
    delete: "/bom/:id",
  },
  compliance: {
    list: "/documents",
    upload: "/documents/upload",
  },
  merged: {
    list: "/merged",
  },
};
