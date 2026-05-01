export interface ApiError {
  message: string
  code: string
  status: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface User {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  orgs: import('./auth').OrgMembership[]
  createdAt: string
}
