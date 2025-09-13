// Client-side API utilities
export class ApiClient {
  private static baseUrl = process.env.NODE_ENV === "production" ? "" : "http://localhost:3000"

  static async get(endpoint: string) {
    const response = await fetch(`${this.baseUrl}/api${endpoint}`)
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    return response.json()
  }

  static async post<T>(endpoint: string, data: T): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/api${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    return response.json()
  }

  static async put<T>(endpoint: string, data: T): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/api${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    return response.json()
  }

  static async delete(endpoint: string) {
    const response = await fetch(`${this.baseUrl}/api${endpoint}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    return response.json()
  }
}

// Specific API functions
export const userApi = {
  getProfile: () => ApiClient.get("/user/profile"),
  updateProfile: (data: { full_name: string }) => ApiClient.put("/user/profile", data),
  getApps: () => ApiClient.get("/user/apps"),
}

export const adminApi = {
  getStats: () => ApiClient.get("/admin/stats"),
  getUsers: (params?: { status?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set("status", params.status)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())
    return ApiClient.get(`/admin/users?${searchParams.toString()}`)
  },
  getApps: () => ApiClient.get("/admin/apps"),
  createApp: (data: Record<string, unknown>) => ApiClient.post("/admin/apps", data),
  approveUser: (data: { requestId: string; userId: string; action: string; notes?: string }) =>
    ApiClient.post("/admin/approve-user", data),
}
