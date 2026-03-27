# BreakfastHub — Guía de configuración y despliegue

## Requisitos previos

- Node.js 18+ instalado
- Cuenta gratuita en [Supabase](https://supabase.com)
- Cuenta gratuita en [Vercel](https://vercel.com)
- Git instalado

---

## Paso 1 — Crear el proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) e inicia sesión (o crea una cuenta gratuita)
2. Haz clic en **"New project"**
3. Completa los campos:
   - **Name:** `breakfasthub`
   - **Database Password:** elige una contraseña segura y guárdala
   - **Region:** elige la más cercana a tus usuarios (ej: `South America (São Paulo)`)
4. Haz clic en **"Create new project"**
5. Espera ~2 minutos mientras Supabase provisiona la base de datos

---

## Paso 2 — Ejecutar el Schema SQL

1. En tu proyecto de Supabase, ve a **SQL Editor** (icono de base de datos en la barra lateral)
2. Haz clic en **"New query"**
3. Abre el archivo `supabase/schema.sql` de este proyecto
4. Copia **todo el contenido** y pégalo en el editor de Supabase
5. Haz clic en **"Run"** (o `Ctrl+Enter`)
6. Verifica que aparezca el mensaje: `Success. No rows returned`

> **Nota:** Si aparece un error sobre `supabase_realtime`, ignóralo — significa que la publicación ya existe. El resto del schema se habrá creado correctamente.

---

## Paso 3 — Ejecutar el Seed SQL (datos de ejemplo)

1. En el **SQL Editor**, haz clic en **"New query"**
2. Abre el archivo `supabase/seed.sql` de este proyecto
3. Copia **todo el contenido** y pégalo en el editor
4. Haz clic en **"Run"**
5. Verifica que aparezca: `Success. No rows returned`

Esto crea:
- 5 categorías (Bebidas Calientes, Bebidas Frías, Platos Principales, Acompañamientos, Panadería)
- 20 productos con precios en COP

Para verificar, ve a **Table Editor** y confirma que las tablas `categories` y `products` tienen datos.

---

## Paso 4 — Obtener las variables de entorno

### Supabase URL y Anon Key
1. En Supabase, ve a **Project Settings** (ícono de engranaje) → **API**
2. Copia:
   - **Project URL** → será tu `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public** key → será tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Service Role Key (para el panel admin)
1. En la misma pantalla de **API**
2. Bajo **Project API keys**, haz clic en **"Reveal"** junto a `service_role`
3. Copia esa key → será tu `SUPABASE_SERVICE_ROLE_KEY`

> **Importante:** La `service_role` key bypasa todas las políticas de seguridad (RLS). Nunca la expongas en el cliente. Solo se usa en las API routes del servidor.

### Habilitar Realtime
1. Ve a **Database** → **Replication** en Supabase
2. Asegúrate de que `order_items` y `orders` estén habilitadas en `supabase_realtime`
3. Si no aparecen, ve a **SQL Editor** y ejecuta:
   ```sql
   alter publication supabase_realtime add table order_items;
   alter publication supabase_realtime add table orders;
   ```

---

## Paso 5 — Configurar variables de entorno locales

1. En la raíz del proyecto, copia el archivo de ejemplo:
   ```bash
   cp .env.local.example .env.local
   ```

2. Abre `.env.local` y rellena los valores:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...tu-anon-key
   SUPABASE_SERVICE_ROLE_KEY=eyJ...tu-service-role-key
   ADMIN_PASSWORD=tu-contraseña-segura
   ```

   > Cambia `ADMIN_PASSWORD` por la contraseña que quieres usar para acceder a `/admin`

---

## Paso 6 — Correr el proyecto en desarrollo

```bash
# Instalar dependencias (si no lo has hecho)
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Verificar que funciona:
- **`/`** → Pantalla de entrada con username
- **`/menu`** → Menú con las 5 categorías y 20 productos
- **`/admin`** → Panel admin (usa la contraseña de `ADMIN_PASSWORD`)
- **`/admin/menu`** → Gestión de productos y categorías

---

## Paso 7 — Desplegar en Vercel (gratuito)

### Opción A — Desde la CLI de Vercel

```bash
# Instalar Vercel CLI globalmente
npm install -g vercel

# Desplegar (la primera vez te pedirá que inicies sesión)
vercel

# Seguir el asistente:
# - Set up and deploy? → Y
# - Which scope? → tu cuenta
# - Link to existing project? → N
# - Project name? → breakfasthub (o el que prefieras)
# - Directory? → ./ (por defecto)
# - Override settings? → N
```

### Opción B — Desde la interfaz web de Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en **"Add New Project"**
3. Importa tu repositorio de GitHub (primero haz `git push` si aún no lo hiciste)
4. Vercel detecta automáticamente que es un proyecto Next.js
5. **Antes de hacer clic en "Deploy"**, configura las variables de entorno:

### Configurar variables de entorno en Vercel

En la pantalla de configuración del proyecto (o en **Settings → Environment Variables**):

| Variable | Valor | Entorno |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://tu-proyecto.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Production, Preview, Development |
| `ADMIN_PASSWORD` | `tu-contraseña` | Production, Preview, Development |

6. Haz clic en **"Deploy"**
7. En ~2 minutos tu app estará en `https://breakfasthub.vercel.app` (o el dominio asignado)

---

## Estructura de la aplicación

```
Rutas públicas:
  /           → Entrada: ingresa tu username
  /menu       → Menú completo con carrito

Rutas de admin:
  /admin      → Dashboard con pedidos en tiempo real
  /admin/menu → Gestión de productos y categorías

API Routes:
  POST /api/auth/admin      → Verificar contraseña admin
  GET/POST /api/users       → Buscar/crear usuarios
  GET/POST /api/orders      → Pedidos (GET admin requiere x-admin-auth)
  GET/POST/PUT/DELETE /api/products    → CRUD productos (escritura requiere x-admin-auth)
  GET/POST/PUT/DELETE /api/categories  → CRUD categorías (escritura requiere x-admin-auth)
```

---

## Flujo de uso

### Para usuarios:
1. Entrar a la URL de la app
2. Escribir un nombre de usuario (sin contraseña)
3. Seleccionar productos del menú usando `+` / `-`
4. Hacer clic en "Confirmar pedido"
5. El pedido queda guardado — pueden volver y modificarlo

### Para el administrador:
1. Ir a `/admin`
2. Ingresar la `ADMIN_PASSWORD`
3. Ver el dashboard con stats y la tabla de todos los pedidos
4. Los pedidos nuevos aparecen **automáticamente** (Supabase Realtime) con badge "NUEVO"
5. Ir a `/admin/menu` para gestionar productos y categorías
6. Exportar a CSV desde la tabla para análisis externo

---

## Solución de problemas frecuentes

### "Error al cargar los pedidos" en el admin
- Verifica que `SUPABASE_SERVICE_ROLE_KEY` esté correctamente configurada en `.env.local`
- Confirma que el schema SQL se ejecutó sin errores

### Los productos no aparecen en el menú
- Ejecuta el seed SQL si no lo has hecho
- Verifica que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` sean correctas

### El Realtime no funciona
- Habilita Realtime en Supabase: **Database → Replication** → activa las tablas `orders` y `order_items`
- Verifica que el navegador no bloquee WebSockets

### Error "ADMIN_PASSWORD" al iniciar sesión en admin
- Verifica que la variable esté definida en `.env.local` (no en `.env`)
- Reinicia el servidor de desarrollo después de cambiar `.env.local`

### Despliegue en Vercel falla
- Asegúrate de que todas las variables de entorno estén configuradas en Vercel
- Revisa los logs de build en Vercel Dashboard → Deployments → (tu deploy) → Logs
