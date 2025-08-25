import type { ReactNode, ComponentType } from "react"
import type { Product } from "./Product" // Assuming Product is defined in another file

export interface ChartConfig {
  [key: string]: {
    label?: ReactNode
    icon?: ComponentType
  } & ({ color?: string; theme?: never } | { color?: never; theme: Record<string, string> })
}

export interface ProductGridProps {
  products: Product[]
  title?: string
  showFilters?: boolean
}

export interface ProductCardProps {
  product: Product
  showAddToCart?: boolean
}

export interface AdminHeaderProps {
  title: string
  breadcrumbs: Array<{ label: string; href?: string }>
}
