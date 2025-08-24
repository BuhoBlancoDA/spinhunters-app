# Mapeos de Supabase en SpinHunters App

Este documento describe los mapeos entre las tablas de autenticación y las tablas de la aplicación en Supabase, así como las políticas de acceso a datos.

## Mapeos de Identidad

La aplicación utiliza un sistema de doble identidad para separar la autenticación (gestionada por Supabase Auth) de los datos de perfil (gestionados en la base de datos):

```
auth.users.id → public.users.auth_user_id
```

- `auth.users.id`: Identificador único generado por Supabase Auth cuando un usuario se registra
- `public.users.auth_user_id`: Campo en la tabla de usuarios que vincula con la identidad de autenticación

Para las membresías y otras relaciones, se utiliza el ID del perfil:

```
public.users.id → public.memberships_view.user_id
```

- `public.users.id`: Identificador único del perfil del usuario en la base de datos
- `public.memberships_view.user_id`: Campo en la vista de membresías que vincula con el perfil

## Flujo de Creación de Identidad

1. Un usuario se registra → se crea un registro en `auth.users`
2. El usuario confirma su email → se redirecciona a `/auth/callback`
3. El callback verifica si existe un perfil para ese email:
   - Si existe, vincula el `auth.users.id` con el perfil existente
   - Si no existe, crea un nuevo perfil y establece `auth_user_id`

## Importante: Gestión de Membresías

La aplicación web **no crea ni modifica membresías**. Solo lee datos de `public.memberships_view`.

- ✅ **Lectura**: La app web puede leer membresías desde `public.memberships_view`
- ❌ **Escritura**: La creación y modificación de membresías se realiza exclusivamente desde el sistema POS

## Consultas Correctas

### Para obtener el perfil del usuario autenticado:

```sql
SELECT * FROM public.users 
WHERE auth_user_id = '<auth.user.id>'
```

### Para actualizar el perfil del usuario:

```sql
UPDATE public.users
SET name = 'Nuevo Nombre', alternate_email = 'nuevo@gmail.com', ...
WHERE id = <profile.id>  -- NO usar auth_user_id aquí
```

### Para obtener las membresías de un usuario:

```sql
SELECT * FROM public.memberships_view
WHERE user_id = <profile.id>  -- ID del perfil, NO el auth_user_id
ORDER BY created_at DESC
```

## Errores Comunes a Evitar

1. **❌ Incorrecto**: Usar `auth.user.id` directamente para buscar membresías
   ```sql
   -- INCORRECTO
   SELECT * FROM memberships_view WHERE user_id = '<auth.user.id>'
   ```

2. **❌ Incorrecto**: Actualizar el perfil usando `auth_user_id`
   ```sql
   -- INCORRECTO
   UPDATE users SET name = 'Nuevo' WHERE auth_user_id = '<auth.user.id>'
   ```

3. **❌ Incorrecto**: Crear o modificar membresías desde la aplicación web
   ```sql
   -- PROHIBIDO
   INSERT INTO memberships (user_id, plan, ...) VALUES (...)
   ```

## Diagrama de Relaciones

```
┌─────────────┐       ┌─────────────┐       ┌─────────────────────┐
│  auth.users │       │ public.users │       │ public.memberships  │
├─────────────┤       ├─────────────┤       ├─────────────────────┤
│     id      │───┐   │     id      │───┐   │        id           │
│    email    │   │   │    email    │   │   │      user_id        │
│  user_meta  │   └──▶│ auth_user_id│   └──▶│       plan          │
└─────────────┘       │    name     │       │      status         │
                      │ alternate_* │       │    expires_at       │
                      └─────────────┘       └─────────────────────┘
                                                      │
                                                      ▼
                                            ┌─────────────────────┐
                                            │public.memberships_view
                                            ├─────────────────────┤
                                            │        id           │
                                            │      user_id        │
                                            │       plan          │
                                            │      status         │
                                            │    expires_at       │
                                            └─────────────────────┘
```

## Recordatorio

La gestión de membresías se realiza exclusivamente desde el sistema POS. La aplicación web solo muestra información de membresías en modo de solo lectura.