# Guía de Despliegue en Producción para SpinHunters App

Esta guía proporciona instrucciones detalladas para desplegar la aplicación SpinHunters en un entorno de producción utilizando Vercel y Supabase.

## Requisitos Previos

Antes de comenzar, asegúrate de tener:

- Una cuenta en [Vercel](https://vercel.com)
- Una cuenta en [Supabase](https://supabase.com)
- Una cuenta en [Brevo](https://brevo.com) (para envío de emails)
- Acceso al repositorio de GitHub del proyecto
- Acceso al panel de control de DNS de tu dominio (si vas a usar un dominio personalizado)

## Configuración de Supabase

### 1. Acceder al Proyecto de Supabase Existente

1. Inicia sesión en [Supabase](https://supabase.com)
2. Accede al proyecto existente que se utiliza tanto para desarrollo como para producción
3. Verifica que tienes acceso a la URL del proyecto y las claves API (anon key y service role key) que se encuentran en el archivo `.env.production` en la raíz del proyecto

### 2. Verificar la Configuración de la Base de Datos

> **Nota importante**: Como estamos utilizando un proyecto Supabase existente que ya está en uso, la base de datos ya debería estar configurada correctamente. Los siguientes pasos solo son necesarios si se está configurando un nuevo proyecto desde cero o si hay cambios en el esquema que necesitan ser aplicados.

1. En el panel de control de Supabase, ve a la sección "SQL Editor"
2. Verifica que las tablas y políticas descritas en `DATABASE.md` existen y están configuradas correctamente
3. Si es necesario aplicar cambios al esquema, coordina con el equipo para ejecutar los scripts SQL en el siguiente orden:
   - `supabase/sql/01_initial_schema.sql` (solo para nuevas instalaciones)
   - `supabase/sql/04_pos_compatibility.sql` (para compatibilidad con el POS)
   - `supabase/sql/05_rls_secure.sql` (para políticas de seguridad)
   - `supabase/sql/05_seed_admins.sql` (para configurar usuarios administradores)

4. Antes de ejecutar los scripts, verifica:
   - Duplicados en payment_methods (resolver antes de aplicar UNIQUE constraint)
   - Confirmar que los UUIDs de admin en 05_seed_admins.sql existen en auth.users

### 3. Configurar Autenticación

1. En el panel de control de Supabase, ve a "Authentication" > "Providers"
2. Asegúrate de que "Email" esté habilitado
3. Configura la URL de redirección a `https://tu-dominio.com/auth/callback`
4. Personaliza las plantillas de correo electrónico si lo deseas

### 4. Configurar Servicio de Correo Electrónico

Para asegurar la entrega confiable de los magic links:

1. Ve a "Authentication" > "Email Templates"
2. Configura un proveedor SMTP (recomendado para producción)
   - Puedes usar servicios como SendGrid, Mailgun, o Amazon SES
   - Configura los ajustes SMTP según las instrucciones del proveedor

## Configuración de Brevo

1. Crea una cuenta en [Brevo](https://brevo.com) si aún no tienes una
2. Crea una clave API en "SMTP & API" > "API Keys"
3. Crea las plantillas de correo electrónico necesarias:
   - Plantilla de bienvenida
   - Plantilla de activación de membresía
   - Plantilla de expiración próxima
   - Plantilla de membresía expirada
4. Anota los IDs de las plantillas para usarlos en la configuración de la aplicación

## Despliegue en Vercel

### 1. Preparar el Repositorio

Asegúrate de que tu repositorio esté listo para producción:

1. Actualiza la versión en `package.json` si es necesario
2. Asegúrate de que todas las dependencias estén correctamente listadas
3. Verifica que no haya código de depuración o console.logs innecesarios
4. Haz commit de todos los cambios y push al repositorio

### 2. Conectar con Vercel

1. Inicia sesión en [Vercel](https://vercel.com)
2. Haz clic en "Add New" > "Project"
3. Importa tu repositorio de GitHub
4. Configura el proyecto:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: (deja el valor predeterminado)
   - Output Directory: (deja el valor predeterminado)

### 3. Configurar Variables de Entorno

Añade las siguientes variables de entorno en Vercel:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-prod.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-prod
SUPABASE_SERVICE_ROLE_KEY=tu-clave-service-role-prod

# Brevo
BREVO_API_KEY=tu-clave-api-brevo

# Plantillas de Brevo (opcional, pero recomendado)
BREVO_TEMPLATE_WELCOME=id-plantilla-bienvenida
BREVO_TEMPLATE_MEMBERSHIP_ACTIVATED=id-plantilla-activacion
BREVO_TEMPLATE_MEMBERSHIP_EXPIRING=id-plantilla-expiracion-proxima
BREVO_TEMPLATE_MEMBERSHIP_EXPIRED=id-plantilla-expirada
```

### 4. Desplegar la Aplicación

1. Haz clic en "Deploy"
2. Espera a que se complete el despliegue
3. Una vez completado, Vercel te proporcionará una URL para tu aplicación (por ejemplo, `https://spinhunters-app.vercel.app`)

## Configuración de Dominio Personalizado

### 1. Añadir Dominio en Vercel

1. En el panel de proyecto de Vercel, ve a "Settings" > "Domains"
2. Añade tu dominio personalizado (por ejemplo, `app.spinhunters.com`)
3. Sigue las instrucciones para verificar la propiedad del dominio

### 2. Configurar DNS

#### Opción 1: Usando los Nameservers de Vercel (recomendado)

1. Configura tu dominio para usar los nameservers de Vercel
2. Vercel gestionará automáticamente los registros DNS

#### Opción 2: Usando un Registro CNAME

1. En tu proveedor de DNS, crea un registro CNAME:
   - Nombre: `app` (o el subdominio que desees)
   - Valor: `cname.vercel-dns.com`
2. Espera a que se propaguen los cambios de DNS (puede tardar hasta 48 horas)

### 3. Configurar HTTPS

Vercel configura automáticamente HTTPS para tu dominio personalizado con certificados Let's Encrypt.

## Configuración de Edge Functions en Supabase

Para funcionalidades avanzadas como notificaciones y procesamiento en segundo plano:

### 1. Instalar Supabase CLI

```bash
npm install -g supabase
```

### 2. Iniciar Sesión y Vincular Proyecto

```bash
supabase login
supabase link --project-ref tu-referencia-de-proyecto-prod
```

### 3. Desplegar las Funciones

```bash
supabase functions deploy admin
supabase functions deploy notify
supabase functions deploy cron
```

### 4. Configurar Cron Jobs para Tareas Programadas

Para la verificación automática de membresías expiradas:

1. En el panel de control de Supabase, ve a "Database" > "Functions"
2. Configura un cron job para ejecutar la función `update_expired_memberships` diariamente:
   ```sql
   SELECT cron.schedule('daily-expired-memberships', '0 0 * * *', 'SELECT update_expired_memberships()');
   ```

## Verificación Post-Despliegue

### 1. Verificar Funcionalidad Básica

1. Accede a tu aplicación en producción
2. Prueba el registro de usuario
3. Prueba el inicio de sesión
4. Verifica que el dashboard muestre la información correcta

### 2. Verificar Integración con Supabase

1. Verifica que la autenticación funcione correctamente
2. Verifica que los datos se guarden correctamente en la base de datos
3. Verifica que las políticas RLS estén funcionando como se espera

### 3. Verificar Integración con Brevo

1. Prueba el envío de correos electrónicos
2. Verifica que las plantillas se rendericen correctamente

## Monitoreo y Mantenimiento

### Monitoreo

1. Configura alertas en Vercel para errores de despliegue y problemas de rendimiento
2. Configura monitoreo en Supabase para errores de base de datos y uso de recursos
3. Considera implementar una herramienta de monitoreo como Sentry para rastrear errores en tiempo real

### Copias de Seguridad

1. Configura copias de seguridad automáticas de la base de datos en Supabase
2. Considera implementar un script de respaldo adicional para mayor seguridad

### Actualizaciones

Para actualizar la aplicación en producción:

1. Desarrolla y prueba los cambios en el entorno de desarrollo
2. Haz commit de los cambios y push al repositorio
3. Vercel desplegará automáticamente los cambios (si tienes configurado el despliegue automático)
4. Verifica que todo funcione correctamente después del despliegue

## Solución de Problemas en Producción

### Problemas de Despliegue

**Síntoma**: El despliegue falla en Vercel.

**Solución**:
1. Revisa los logs de despliegue en Vercel
2. Verifica que todas las dependencias estén correctamente instaladas
3. Asegúrate de que las variables de entorno estén configuradas correctamente

### Problemas de Autenticación

**Síntoma**: Los usuarios no pueden iniciar sesión o registrarse.

**Solución**:
1. Verifica que la URL de redirección en Supabase sea correcta
2. Revisa los logs de autenticación en Supabase
3. Asegúrate de que el servicio de correo electrónico esté funcionando correctamente

### Problemas de Base de Datos

**Síntoma**: Errores al leer o escribir datos.

**Solución**:
1. Verifica las políticas RLS en Supabase
2. Revisa los logs de la base de datos
3. Asegúrate de que la estructura de la base de datos sea correcta

## Contacto y Soporte

Para soporte técnico o consultas sobre el despliegue, contacta al equipo de desarrollo:

- Email: soporte@spinhunters.com
- GitHub: Crea un issue en el repositorio del proyecto

## Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Brevo](https://developers.brevo.com/)
