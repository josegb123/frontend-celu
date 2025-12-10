export interface IUser {
  id: number
  name: string
  email: string
  role: 'admin' | 'seller' | 'editor' // Ajusta los roles según tu lógica de negocio
  created_at: string
  updated_at: string
}
