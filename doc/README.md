# Documentación de SpinHunters App

Este directorio contiene la documentación oficial para la aplicación web SpinHunters. A continuación se presenta una descripción de cada documento disponible.

## Índice de Documentos

### Arquitectura y Estructura

- [**APP_ARCHITECTURE.md**](./APP_ARCHITECTURE.md) - Describe la arquitectura de la aplicación, la estructura de directorios, las responsabilidades de cada ruta y el flujo de autenticación.

### Base de Datos y Supabase

- [**DATABASE.md**](./DATABASE.md) - Documentación detallada sobre la estructura de la base de datos, incluyendo tablas, vistas, relaciones, funciones y triggers.
- [**SUPABASE_MAPPINGS.md**](./SUPABASE_MAPPINGS.md) - Explica los mapeos entre las tablas de autenticación y las tablas de la aplicación en Supabase.
- [**SECURITY_POLICIES.md**](./SECURITY_POLICIES.md) - Describe las políticas de seguridad (Row Level Security) utilizadas en la aplicación.
- [**POS_COMPATIBILITY.md**](./POS_COMPATIBILITY.md) - Explica las consideraciones de compatibilidad entre la aplicación web y el sistema POS existente.

### Desarrollo y Despliegue

- [**LOCAL_DEVELOPMENT.md**](./LOCAL_DEVELOPMENT.md) - Guía para configurar y ejecutar la aplicación en un entorno de desarrollo local.
- [**PRODUCTION_DEPLOYMENT.md**](./PRODUCTION_DEPLOYMENT.md) - Instrucciones detalladas para desplegar la aplicación en un entorno de producción utilizando Vercel y Supabase.

## Notas Importantes

1. **Gestión de Membresías**: La aplicación web **no crea ni modifica membresías**. Solo lee datos de `public.memberships_view`. La creación y modificación de membresías se realiza exclusivamente desde el sistema POS.

2. **Integración con POS**: La aplicación web comparte la misma base de datos Supabase que el sistema POS. Es importante mantener la compatibilidad entre ambos sistemas.

3. **Autenticación**: La aplicación utiliza Supabase Auth para la autenticación de usuarios. Los usuarios pueden registrarse con email y contraseña o utilizar enlaces mágicos enviados por email.