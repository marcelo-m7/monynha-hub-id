export interface UserProfile {
  id: string
  email: string
  full_name: string
  created_at: string
  updated_at: string
  status: "PENDING" | "APPROVED" | "REJECTED"
}

export interface ApprovalRequest {
  id: string
  user_id: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  admin_notes?: string
  approved_by?: string
  approved_at?: string
  created_at: string
  updated_at: string
}

export interface AppCatalogItem {
  id: string
  name: string
  description: string
  url: string
  icon_url?: string
  category: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserApp {
  id: string
  user_id: string
  app_id: string
  granted_at: string
  app?: AppCatalogItem
}
