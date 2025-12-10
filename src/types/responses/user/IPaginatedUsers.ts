import type { IUser } from '../../entities/IUser'
import type { IPaginationMeta } from '../common/IPaginationMeta'

export interface IPaginatedUsers {
  data: IUser[]
  links: any // Puedes usar un tipo más específico si es necesario
  meta: IPaginationMeta // Los metadatos de paginación están aquí
}
