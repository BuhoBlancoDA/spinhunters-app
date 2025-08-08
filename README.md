# SpinHunters App

Aplicación de membresías y dashboard para SpinHunters, desarrollada con Next.js y Supabase.

## Características

- Autenticación de usuarios con magic link
- Dashboard de usuario para ver estado de membresía
- Panel de administración para gestionar usuarios y membresías
- Diseño oscuro con los colores de SpinHunters (negro, rojo #CA2227 y blanco)
- Integración con Supabase para base de datos y autenticación

## Requisitos Previos

- Node.js v20 o superior
- npm, yarn o pnpm (recomendado pnpm)
- Cuenta en Supabase para la base de datos
- Cuenta en Brevo para envío de emails (opcional para desarrollo local)

## Configuración del Entorno Local

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/spinhunters-app.git
cd spinhunters-app
```

### 2. Instalar Dependencias

```bash
# Con npm
npm install

# Con yarn
yarn install

# Con pnpm (recomendado)
pnpm install
```

### 3. Verificar Variables de Entorno

Verifica que el archivo `.env.production` existe en la raíz del proyecto con las siguientes variables:

```
# Supabase
VITE_SUPABASE_URL=https://cvkooqqlxlttoplkxgla.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Nota importante**: Este proyecto utiliza un único proyecto Supabase tanto para desarrollo local como para producción. No crees un nuevo proyecto ni modifiques estas credenciales a menos que se te indique específicamente.

### 4. Acceder al Proyecto Supabase Existente

1. Solicita acceso al proyecto Supabase existente al administrador del sistema
2. Verifica que puedes acceder al panel de control de Supabase con las credenciales proporcionadas
3. Familiarízate con la estructura de la base de datos según se describe en el archivo `doc/DATABASE.md`

> **Nota importante**: No es necesario ejecutar los scripts SQL ni configurar las políticas RLS, ya que el proyecto Supabase ya está configurado y en uso.

### 5. Ejecutar la Aplicación en Modo Desarrollo

```bash
# Con npm
npm run dev

# Con yarn
yarn dev

# Con pnpm
pnpm dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

## Despliegue en Producción

### Despliegue en Vercel

La forma más sencilla de desplegar la aplicación es utilizando Vercel:

1. Crea una cuenta en [Vercel](https://vercel.com) si aún no tienes una
2. Conecta tu repositorio de GitHub a Vercel
3. Configura las siguientes variables de entorno en Vercel, utilizando los mismos valores que están en `.env.production`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Despliega la aplicación

> **Nota importante**: Asegúrate de usar exactamente las mismas credenciales de Supabase que se utilizan para desarrollo local, ya que ambos entornos comparten el mismo proyecto Supabase.

### Configuración de DNS

Para configurar el dominio personalizado:

1. En tu panel de control de DNS (por ejemplo, cPanel), crea un registro CNAME:
   - Nombre: `app`
   - Valor: `cname.vercel-dns.com`
2. En Vercel, añade el dominio personalizado (por ejemplo, `app.spinhunters.com`) en la configuración del proyecto

### Configuración de Edge Functions en Supabase

Si necesitas trabajar con las Edge Functions existentes en el proyecto Supabase:

1. Instala Supabase CLI siguiendo las [instrucciones oficiales](https://supabase.com/docs/guides/cli)
2. Inicia sesión en Supabase CLI:
   ```bash
   supabase login
   ```
3. Solicita la referencia del proyecto al administrador del sistema
4. Vincula el proyecto existente:
   ```bash
   supabase link --project-ref referencia-del-proyecto-existente
   ```
5. Para desplegar nuevas funciones o actualizar las existentes, coordina con el equipo y luego ejecuta:
   ```bash
   supabase functions deploy
   ```

> **Nota importante**: Ten cuidado al modificar o desplegar Edge Functions, ya que podrías afectar a otros proyectos que utilizan el mismo proyecto Supabase.

## Estructura del Proyecto

```
/docs/                  # Documentación detallada
/src/
  /app/                 # Rutas y páginas de la aplicación
    /(routes)/          # Rutas principales
      /admin/           # Panel de administración
      /dashboard/       # Dashboard de usuario
      /login/           # Página de inicio de sesión
      /register/        # Página de registro
    /auth/              # Rutas de autenticación
  /components/          # Componentes reutilizables
  /lib/                 # Utilidades y clientes
    supabaseClient.ts   # Cliente de Supabase
    api.ts              # Funciones de API
  /types/               # Definiciones de tipos
/supabase/
  /sql/                 # Scripts SQL para la base de datos
  /functions/           # Edge Functions de Supabase
```

## Uso de la Aplicación

### Registro de Usuarios

1. Los usuarios acceden a la página de registro
2. Completan el formulario con sus datos
3. Reciben un magic link por email
4. Al hacer clic en el enlace, se crea su cuenta y se redirige al dashboard

### Panel de Administración

1. Accede a `/admin` (actualmente cualquier usuario puede acceder, pero en producción deberías implementar un sistema de roles)
2. Busca usuarios por email
3. Gestiona membresías: activa/desactiva, cambia plan, establece fecha de expiración

## Mantenimiento

### Actualizaciones

Para actualizar la aplicación:

1. Actualiza el código fuente
2. Ejecuta `pnpm install` para actualizar dependencias
3. Despliega nuevamente en Vercel

### Copias de Seguridad

El proyecto ya tiene configuradas copias de seguridad automáticas de la base de datos en Supabase:

1. Las copias de seguridad se realizan mediante un cron job en GitHub Actions (ver detalles en `doc/DEPLOYMENT.md`)
2. Las copias se almacenan en Google Drive y se mantienen las últimas 30 versiones

> **Nota importante**: No modifiques la configuración de las copias de seguridad sin coordinar con el equipo, ya que esto podría afectar a otros proyectos que utilizan el mismo proyecto Supabase.

## Soporte

Para soporte técnico, contacta al equipo de desarrollo o crea un issue en el repositorio de GitHub.

## Licencia

Este proyecto es propiedad de SpinHunters. Todos los derechos reservados.
