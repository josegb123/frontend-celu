export interface IUser {
  id: number
  name: string
  email: string
  role: 'admin' | 'seller' | 'editor' // Ajusta los roles según tu lógica de negocio
  created_at: string
  updated_at: string
}

export interface IPaginatedUsers {
  data: IUser[]
  links: any // Puedes usar un tipo más específico si es necesario
  meta: IPaginationMeta // Los metadatos de paginación están aquí
}

interface IPaginationMeta {
  current_page: number
  last_page: number
  total: number
  // Opcional: puedes añadir más campos como links, from, to, per_page
}
