# Arquitectura de la Aplicación SpinHunters

Este documento describe la estructura de la aplicación SpinHunters, las responsabilidades de cada ruta y el flujo de autenticación.

## Estructura de Directorios

La aplicación sigue la estructura de directorios de Next.js App Router:

```
app/
  (marketing)/
    page.tsx                 # Landing page estática (SSR)
  (auth)/
    login/
      page.tsx               # Página de login con dos pestañas: Contraseña y Enlace mágico
    register/
      page.tsx               # Formulario de registro con email y contraseña
  auth/
    callback/
      route.ts               # Ruta del servidor para intercambiar código por sesión y actualizar perfil
  dashboard/
    layout.tsx               # Layout que requiere sesión, redirecciona a /login si no hay sesión
    page.tsx                 # Dashboard principal con información del usuario y membresía
    profile/
      page.tsx               # Página de edición de perfil (cliente)
  admin/
    layout.tsx               # Layout que verifica si el usuario es admin, redirecciona a /dashboard si no
    page.tsx                 # Dashboard de administración
    users/
      page.tsx               # Búsqueda de usuarios
      [id]/
        page.tsx             # Detalle de usuario (solo lectura de membresías)
  layout.tsx                 # Layout raíz con tema oscuro
  globals.css                # Estilos globales y utilidades
middleware.ts                # Protección de rutas /dashboard/*
```

## Responsabilidades de Rutas

### Rutas Públicas

- **app/(marketing)/page.tsx**: Landing page estática para visitantes no autenticados.
- **app/(auth)/login/page.tsx**: Página de login con dos opciones:
  - Login con email y contraseña
  - Login con enlace mágico enviado por email
- **app/(auth)/register/page.tsx**: Formulario de registro para nuevos usuarios.

### Rutas de Autenticación

- **app/auth/callback/route.ts**: Ruta del servidor que:
  1. Intercambia el código de autenticación por una sesión
  2. Obtiene el usuario autenticado
  3. Crea o actualiza el perfil en `public.users`
  4. Redirecciona al dashboard

### Rutas Protegidas (Usuario)

- **app/dashboard/layout.tsx**: Verifica que exista una sesión, redirecciona a /login si no.
- **app/dashboard/page.tsx**: Muestra información del usuario y estado de membresía (solo lectura).
- **app/dashboard/profile/page.tsx**: Permite al usuario editar su perfil.

### Rutas Protegidas (Admin)

- **app/admin/layout.tsx**: Verifica que el usuario sea administrador, redirecciona a /dashboard si no.
- **app/admin/page.tsx**: Dashboard de administración con búsqueda rápida y acciones.
- **app/admin/users/page.tsx**: Búsqueda avanzada de usuarios.
- **app/admin/users/[id]/page.tsx**: Detalle de usuario con visualización de membresías (solo lectura).

## Flujo de Autenticación

### Registro de Usuario

1. El usuario completa el formulario en `/register`
2. Se crea una cuenta en `auth.users` mediante `supabase.auth.signUp()`
3. El usuario recibe un email de confirmación
4. Al hacer clic en el enlace, se redirecciona a `/auth/callback?code=xxx`
5. El callback crea un perfil en `public.users` vinculado al `auth.users.id`

### Login con Contraseña

1. El usuario ingresa email y contraseña en `/login` (pestaña Contraseña)
2. Se autentica mediante `supabase.auth.signInWithPassword()`
3. Si es exitoso, se redirecciona automáticamente a `/dashboard`

### Login con Enlace Mágico

1. El usuario ingresa su email en `/login` (pestaña Enlace Mágico)
2. Se envía un enlace mediante `supabase.auth.signInWithOtp()`
3. El usuario recibe un email con un enlace
4. Al hacer clic en el enlace, se redirecciona a `/auth/callback?code=xxx`
5. El callback establece la sesión y redirecciona a `/dashboard`

### Protección de Rutas

- El middleware verifica la existencia de una sesión para todas las rutas que comienzan con `/dashboard`
- El layout de admin verifica que el usuario tenga permisos de administrador consultando `public.admin_users`

## Integración con POS

- La aplicación solo lee datos de membresías desde `public.memberships_view`
- No se permite crear ni modificar membresías desde la aplicación web
- La gestión de membresías se realiza exclusivamente desde el sistema POS
- En la interfaz de administración se muestra un aviso claro sobre esta limitación

## Tema y Estilos

- La aplicación utiliza un tema oscuro con acentos en rojo (#CA2227)
- Los estilos se definen en `globals.css` con utilidades como `.btn`, `.btn-primary`, `.card`, etc.
- Tailwind CSS se utiliza para la mayoría de los estilos, con extensiones personalizadas en `tailwind.config.ts`