# Guía de Desarrollo Local para SpinHunters App

Esta guía proporciona instrucciones detalladas para configurar y ejecutar la aplicación SpinHunters en un entorno de desarrollo local.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

- **Node.js v20 o superior**: [Descargar desde nodejs.org](https://nodejs.org/)
- **pnpm**: Instalar con `npm install -g pnpm`
- **Git**: [Descargar desde git-scm.com](https://git-scm.com/)
- **Editor de código**: Recomendamos [Visual Studio Code](https://code.visualstudio.com/)

## Configuración Inicial

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/spinhunters-app.git
cd spinhunters-app
```

### 2. Instalar Dependencias

```bash
pnpm install
```

### 3. Acceder al Proyecto Supabase Existente

Para el desarrollo local, utilizaremos el mismo proyecto Supabase que se usa en producción:

1. Solicita acceso al proyecto Supabase existente al administrador del sistema
2. Obtén la URL del proyecto y la clave anónima (anon key) para configurar tus variables de entorno

> **Nota importante**: No es necesario crear un nuevo proyecto Supabase ni ejecutar los scripts SQL, ya que utilizaremos la misma instancia de Supabase que está en producción.

### 4. Configuración de Auth en Supabase

Para que la autenticación funcione correctamente en desarrollo local, asegúrate de que en Supabase → Authentication → URL Configuration estén configurados los siguientes valores:

- **Site URL**: http://localhost:3000
- **Redirect URLs**: http://localhost:3000 (y cualquier callback que use la app)
- **Allowed origins (CORS)**: http://localhost:3000

> **Nota**: Esta configuración ya debería estar realizada por el administrador del sistema. Si tienes problemas con la autenticación, verifica estos valores.

### 5. Configurar Variables de Entorno

Para el desarrollo local, necesitas crear un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
# server-only opcional (NO usar en el cliente)
SUPABASE_SERVICE_ROLE=<service-role>
APP_BASE_URL=http://localhost:3000
```

> **Nota importante**: Como estamos usando credenciales de producción, recuerda que las pruebas en local tocan datos reales. Usa usuarios de prueba o emails con alias +test para evitar afectar datos de producción.

## Ejecutar la Aplicación

### Iniciar el Servidor de Desarrollo

```bash
pnpm dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

## Flujo de Trabajo de Desarrollo

### Estructura de Archivos

La aplicación sigue una estructura basada en el enrutamiento de Next.js 13 con App Router:

- `src/app/(routes)`: Contiene las rutas principales de la aplicación
  - `login`: Página de inicio de sesión
  - `register`: Página de registro
  - `dashboard`: Dashboard del usuario
  - `admin`: Panel de administración
- `src/app/auth`: Contiene las rutas de autenticación
- `src/lib`: Contiene utilidades y clientes
- `src/types`: Contiene definiciones de tipos TypeScript

### Autenticación

La aplicación utiliza la autenticación de Supabase con magic links:

1. El usuario ingresa su correo electrónico en la página de inicio de sesión o registro
2. Recibe un enlace por correo electrónico
3. Al hacer clic en el enlace, se autentica y se redirige al dashboard

Para probar la autenticación localmente:

1. Configura un servicio de correo electrónico en Supabase (o usa el servicio de prueba incluido)
2. Registra un usuario con tu correo electrónico
3. Verifica tu bandeja de entrada para el magic link
4. Haz clic en el enlace para autenticarte

### Desarrollo de Componentes

Para desarrollar nuevos componentes:

1. Crea el componente en `src/components`
2. Importa y utiliza el componente en las páginas correspondientes

### Estilo y Tema

La aplicación utiliza Tailwind CSS para los estilos y tiene un tema oscuro con los colores de SpinHunters:

- Negro: Fondo principal
- Rojo: `#CA2227` para acentos y botones principales
- Blanco: Texto y elementos de contraste

## Pruebas

### Pruebas Manuales

Para probar manualmente la aplicación:

1. **Registro de Usuario**:
   - Accede a `/register`
   - Completa el formulario con datos válidos
   - Verifica que recibas el magic link por correo electrónico
   - Haz clic en el enlace y verifica que seas redirigido al dashboard

2. **Inicio de Sesión**:
   - Accede a `/login`
   - Ingresa tu correo electrónico
   - Verifica que recibas el magic link por correo electrónico
   - Haz clic en el enlace y verifica que seas redirigido al dashboard

3. **Dashboard de Usuario**:
   - Verifica que puedas ver tu información de perfil
   - Verifica que puedas ver el estado de tu membresía (si tienes una)

4. **Panel de Administración**:
   - Accede a `/admin`
   - Verifica que puedas buscar usuarios por correo electrónico
   - Verifica que puedas ver y gestionar membresías

### Pruebas Automatizadas

Para implementar pruebas automatizadas (pendiente):

1. Instala las dependencias de prueba:
   ```bash
   pnpm add -D jest @testing-library/react @testing-library/jest-dom
   ```

2. Configura Jest en `jest.config.js`

3. Escribe pruebas en archivos con extensión `.test.tsx` o `.spec.tsx`

4. Ejecuta las pruebas:
   ```bash
   pnpm test
   ```

## Solución de Problemas

### Problemas Comunes

#### Error de Conexión a Supabase

**Síntoma**: La aplicación no puede conectarse a Supabase.

**Solución**:
1. Verifica que las variables de entorno estén configuradas correctamente
2. Asegúrate de que el proyecto de Supabase esté activo
3. Verifica que las claves de API sean correctas

#### Error de Autenticación

**Síntoma**: No puedes iniciar sesión o registrarte.

**Solución**:
1. Verifica que el servicio de correo electrónico de Supabase esté configurado correctamente
2. Revisa los registros de Supabase para ver si hay errores
3. Asegúrate de que la URL de redirección en la configuración de autenticación sea correcta

#### Problemas con Tailwind CSS

**Síntoma**: Los estilos no se aplican correctamente.

**Solución**:
1. Ejecuta `pnpm build` para regenerar los estilos
2. Verifica que las clases de Tailwind estén escritas correctamente
3. Asegúrate de que `globals.css` esté importado en `layout.tsx`

## Recursos Adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)
- [Documentación de TypeScript](https://www.typescriptlang.org/docs)

## Contribución

Para contribuir al proyecto:

1. Crea una rama para tu característica o corrección:
   ```bash
   git checkout -b feature/nombre-de-la-caracteristica
   ```

2. Realiza tus cambios y haz commit:
   ```bash
   git commit -m "Descripción de los cambios"
   ```

3. Envía tus cambios al repositorio:
   ```bash
   git push origin feature/nombre-de-la-caracteristica
   ```

4. Crea un Pull Request en GitHub
