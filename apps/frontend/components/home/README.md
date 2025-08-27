# Componentes de Productos Destacados

Esta carpeta contiene los componentes relacionados con la visualización de productos destacados en la página principal, ahora integrados con la API real.

## Componentes Principales

### `featured-products-section.tsx`

Componente principal que orquesta toda la sección de productos destacados. Maneja los estados de carga, error y datos vacíos.

**Características:**

- Integración completa con la API usando `useFeaturedProducts`
- Estados de carga con skeletons
- Manejo de errores con opción de reintentar
- Diseño responsivo

### `featured-stats.tsx`

Muestra estadísticas rápidas sobre los productos destacados.

**Métricas mostradas:**

- Número total de productos destacados
- Precio promedio
- Número de categorías representadas
- Número de marcas representadas

### `featured-products-display.tsx`

Componente que permite alternar entre vista de grilla y carousel para los productos.

**Características:**

- Toggle entre vista grilla y carousel
- Automáticamente usa grilla para pocos productos
- Contador de productos

### `featured-products-carousel.tsx`

Vista de carousel horizontal para productos destacados.

**Características:**

- Navegación con botones izquierda/derecha
- Scroll suave
- Indicadores de navegación
- Responsive

### `featured-categories-summary.tsx`

Resumen de las categorías más populares basado en productos destacados.

**Características:**

- Top 4 categorías por número de productos
- Precio promedio por categoría
- Enlaces directos a cada categoría
- Diseño de tarjetas

## Integración con API

Todos los componentes utilizan el hook `useFeaturedProducts` que:

- Obtiene datos del endpoint `/products/featured`
- Implementa cache con React Query
- Maneja estados de carga y error
- Permite refetch manual

## Uso

```tsx
import { FeaturedProductsSection } from "@/components/home/featured-products-section";

export default function HomePage() {
  return (
    <div>
      {/* Otros componentes */}
      <FeaturedProductsSection />
    </div>
  );
}
```

## Dependencias

- `@tanstack/react-query` - Para manejo de estado de servidor
- `lucide-react` - Para iconos
- Componentes UI personalizados (Button, Card, Alert, etc.)

## Estados Manejados

1. **Carga**: Muestra skeletons mientras se obtienen los datos
2. **Error**: Muestra mensaje de error con botón de reintentar
3. **Vacío**: Mensaje amigable cuando no hay productos
4. **Éxito**: Muestra todos los componentes con datos reales

## Responsive Design

Todos los componentes están optimizados para:

- Mobile: 1 columna
- Tablet: 2-3 columnas
- Desktop: 4+ columnas
- Navegación touch-friendly en carousel
