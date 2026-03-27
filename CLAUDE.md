# CLAUDE.md

## Descripción del Proyecto
Aplicación web construida con Next.js 15, TypeScript y Tailwind CSS.
La aplicacion web es un portal donde los usuarios pueden entrar a seleccionar qué comida quieren elegir para su desayuno. El menú es a partir de un restaurante, en dónde los usuarios van a poder elegir del menú las opciones que prefieran entre el menú disponible. La idea, es que los usuarios elijan su comida, pero por detrás, yo como administrador pueda ver qué usuario eligió cual producto y poder tener una lista de precios y productos elegidos por todos los usuarios.


## Stack Tecnológico
- Framework: Next.js 15 (App Router)
- Lenguaje: TypeScript strict
- Estilos: Tailwind CSS + shadcn/ui
- Componentes: 21st.dev community components
- Generación de imágenes: Nano Banana 2 (Gemini 3.1 Flash)
- Diseño UI: Google Stitch MCP

## Comandos
- `npm run dev`: Servidor de desarrollo (port 3000)
- `npm run build`: Build de producción
- `npm run lint`: ESLint
- `npm run test`: Tests

## Convenciones de código
- Usar named exports, no default exports
- Componentes en PascalCase
- Archivos de componentes en `/src/components/`
- Usar CSS con utilidades de Tailwind, no archivos CSS personalizados
- Funciones utilitarias en `/src/lib/`

## MCP Servers activos
- **Stitch**: Generación de diseños UI desde prompts de texto
- **Nano Banana 2**: Generación y edición de imágenes con Gemini
- **21st.dev Magic**: Componentes UI modernos generados por IA

## Reglas de negocio — Selección del menú

Cada usuario puede elegir **máximo 1 ítem por categoría** con las siguientes restricciones:

| Categoría | Regla |
|---|---|
| Bebidas Calientes | Máximo 1. **Exclusivo** con Bebidas Frías (no se pueden combinar) |
| Bebidas Frías | Máximo 1. **Exclusivo** con Bebidas Calientes |
| Platos Principales | Máximo 1 plato. El "Ingrediente adicional" solo se puede agregar si el plato es "Combinados" u "Omelet de huevos o claras" |
| Panadería | Máximo 1 |

### Comportamiento en el frontend (`MenuClient.tsx`)
- Al seleccionar un ítem ya seleccionado → se **deselecciona**
- Al reemplazar por otro del mismo tipo de bebida → reemplazo **directo** (sin modal)
- Al reemplazar por bebida del tipo opuesto, o cambiar plato/panadería → aparece **modal de confirmación**
- Bebidas del tipo opuesto al seleccionado aparecen **deshabilitadas** visualmente
- "Ingrediente adicional" aparece deshabilitado si el plato principal no es Combinados u Omelet

### Validación backend (`POST /api/orders`)
Las mismas reglas se validan en el servidor antes de guardar. Devuelve `400` con mensaje descriptivo si se viola alguna regla.

### Nombres clave en el seed (no cambiar sin actualizar la lógica)
- `"Ingrediente adicional"` — addon que requiere plato compatible
- `"Combinados"` — plato que acepta addon
- `"Omelet de huevos o claras"` — plato que acepta addon

## Notas importantes
- NUNCA hacer commit de archivos .env
- Usar variables de entorno para todas las API keys
- Seguir el sistema de diseño generado por UI/UX Pro Max
- La pantalla de entrada (`/`) usa el diseño generado por Google Stitch (proyecto "Pastelería Florida — Portal de Pedidos")