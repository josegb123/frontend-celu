export interface IUser {
  id: number
  name: string
  email: string
  role: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

export interface StoreUpdateUserPayload {
  name: string
  email: string
  role: string
  password?: string
}