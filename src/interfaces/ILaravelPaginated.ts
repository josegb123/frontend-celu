export interface meta {
  current_page: number
  from: number
  last_page: number
  links: metaLinkItem[]
  path: string
  per_page: number
  to: number
  total: number
}

export interface metaLinkItem {
  url: string | null
  label: string
  page: number | null
  active: boolean
}

export interface links {
  first: string
  last: string
  prev: string | null
  next: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  links: links | null
  meta: meta
}
