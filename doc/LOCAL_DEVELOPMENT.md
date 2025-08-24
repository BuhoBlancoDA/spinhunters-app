
# Local Development — SpinHunters App (EVA POS compatible)

Este documento explica **cómo ejecutar y probar la app en local** usando el **mismo proyecto de Supabase** que utiliza el POS (EVA). Está alineado con la arquitectura actual y con las restricciones de seguridad/roles vigentes.

> **Puntos clave**
>
> * La app usa **App Router** de Next.js en `app/` (no existe `src/app/`).
> * Autenticación con **Email + Contraseña** y **Enlace Mágico** (Magic Link).
>   \- Tras confirmar el email, `/auth/callback` guarda el perfil en `public.users` (upsert) y redirige al Dashboard.
> * La app **no crea ni modifica membresías**. Solo **lee** desde `public.memberships_view`.
>   La gestión de membresías se hace en el **POS** (EVA).

---

## Requisitos

* **Node.js** 18 LTS o 20 LTS
* **pnpm** (recomendado) o npm
* Acceso al **proyecto Supabase** donde corre el POS (URL y anon key)
* Un correo para pruebas (usa alias `+test` para no impactar usuarios reales)

---

## Estructura de archivos

La app vive en `app/` y sigue esta estructura:

```
app/
  (marketing)/page.tsx            # Landing SSR
  (auth)/
    login/page.tsx                # Login (Contraseña y Magic Link)
    register/page.tsx             # Registro (Email + Contraseña)
  auth/callback/route.ts          # Intercambia el código por sesión y hace upsert de perfil
  dashboard/
    layout.tsx                    # Requiere sesión (redirige a /login si no hay)
    page.tsx                      # Panel básico del usuario (Server Component)
    profile/page.tsx              # Edición de perfil (Client Component)
  admin/
    layout.tsx                    # Requiere rol admin (redirige si no lo es)
    page.tsx                      # Home admin (mock o lectura)
    users/page.tsx                # Búsqueda de usuarios (solo lectura)
    users/[id]/page.tsx           # Detalle usuario (solo lectura de membresías)
  layout.tsx                      # Único RootLayout (tema oscuro, header/footer)
  globals.css                     # Estilos base (modo oscuro, branding #CA2227)
middleware.ts                     # Protege /dashboard/*
```

---

## Variables de entorno

Crea un archivo **`.env.local`** en la raíz del proyecto con:

```
NEXT_PUBLIC_SUPABASE_URL=<<TU_URL_SUPABASE>>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<<TU_ANON_KEY>>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **No** uses la Service Role Key en la app web.
> `NEXT_PUBLIC_SITE_URL` debe apuntar a tu host local para construir las URLs de callback.

---

## Configuración en Supabase (una sola vez)

En **Supabase → Authentication → URL Configuration**:

1. Activa **Email confirmations**.
2. Agrega `http://localhost:3000/auth/callback` en **Redirect URLs**.
3. (Opcional) Revisa que los correos de confirmación **sí llegan** (usa un email tuyo con alias `+local`).

> Usamos **el mismo** proyecto de Supabase que producción. Tenlo presente para no usar correos reales ni tocar perfiles en uso. Trabaja con emails “dummy” (por ejemplo: `tuemail+local01@dominio.com`).

---

## Instalación y ejecución

```bash
pnpm install
pnpm dev
# abre http://localhost:3000
```

* Si prefieres npm: `npm install && npm run dev`.

---

## Flujo de pruebas

### 1) Registro

1. Ve a `/register`.
2. Completa el formulario (Email + Contraseña + metadata: `username`, `gmail`, `discord`, `ggpoker`).
3. Revisa el correo y confirma el **Enlace Mágico** (confirmación de email).
4. La app te redirige a **`/auth/callback`**:

   * Se establece la sesión (`exchangeCodeForSession`).
   * Se hace **upsert** del perfil en `public.users` usando `auth_user_id`/`email` y guardando metadata.
   * Se redirige a **`/dashboard`**.

### 2) Login

* Ve a `/login`.
* Pestaña **Contraseña**: `signInWithPassword({ email, password })`.
* Pestaña **Enlace Mágico**: `signInWithOtp({ email })`.

### 3) Dashboard

* Protegido por **middleware** y por el **layout del dashboard**.
* Muestra datos del **perfil** (`public.users`) y estado de membresía leyendo **solo** `public.memberships_view` (por `users.id`).

### 4) Perfil

* `/dashboard/profile` carga el perfil buscando por **`auth_user_id = auth.user.id`** (¡no por `users.id`!).
* Guarda cambios con `.update(...).eq('id', profile.id)`.

### 5) Admin (opcional)

* Si tu `auth.user.id` está en `public.admin_users`, podrás acceder a `/admin`.
* La sección `Admin > Users` permite **buscar** usuarios y ver detalles **en solo lectura**.
* **No** se crean/actualizan membresías desde la app (se hace en el POS).

---

## Línea roja: Membresías (solo lectura desde la app)

* La app **no** crea ni modifica entradas en `public.memberships`.
* Todo lo relacionado a **alta/renovación/cancelación** se gestiona **en el POS**.
* En el Dashboard, la app solo consulta `public.memberships_view` para mostrar el estado (Ultimate activa, fechas, etc.).

---

## Consejos y resolución de problemas

### Hidratación / Layout duplicado

* Si ves `Hydration failed...` o rutas que colisionan:

  * Verifica que **solo existe** el árbol `app/` (no `src/app/`).
  * Asegúrate de que hay **un único** `app/layout.tsx` y que es el de **tema oscuro** con `globals.css`.
  * Evita `use client` innecesario en layouts server.

### “not\_authorized” ejecutando funciones en SQL

* Las funciones que requieren `auth.uid()` fallarán en la consola SQL si no hay JWT.
  **No** es un error de la app; prueba esos flows desde la app con sesión iniciada, o simula JWT en SQL (solo para diagnóstico).

### El Magic Link vuelve a `/` en lugar de `/dashboard`

* Revisa que `NEXT_PUBLIC_SITE_URL` **sea** `http://localhost:3000`.
* Revisa que `Authentication → URL Configuration → Redirect URLs` incluya `http://localhost:3000/auth/callback`.

### No soy admin pero necesito entrar en `/admin`

* Pide que añadan tu `auth.user.id` a `public.admin_users` en Supabase.
* La app solo **lee** `admin_users` (no lo modifica).

### Estilos inconsistentes

* Usa las utilidades de `globals.css`: `.btn`, `.btn-primary`, `.card`, `.heading`, `.muted`, etc.
* Evita clases “light” (ej. `bg-white`, `text-gray-*`) y usa el tema oscuro (branding `#CA2227`).

---

## Buenas prácticas

* **Commits** atómicos y descriptivos: `feat(auth): add password tab`, `fix(profile): query by auth_user_id`, etc.
* **No** incluir claves sensibles en commits. `.env.local` está en `.gitignore`.
* **No** añadir SQL a la app. Los cambios de base de datos se gestionan por archivos `sql/` y los ejecuta el responsable (DBA/owner).

---

## Qué no hace la app (a propósito)

* **No** gestiona pagos ni métodos de pago.
* **No** crea ni anula membresías.
* **No** muestra movimientos del **ledger** (solo admin en POS).

---

## Resumen

* Corre `pnpm dev`, regístrate, confirma email, revisa el Dashboard.
* El perfil se guarda en `public.users` y las membresías se **leen** desde `memberships_view`.
* `/admin` requiere que tu usuario esté en `public.admin_users`.

Si algo no cuadra con estos pasos, revisa primero **variables de entorno**, **redirects en Supabase** y que **no existan dos árboles de rutas**. Luego, abre un issue con el mensaje exacto del error y el paso donde ocurrió.
