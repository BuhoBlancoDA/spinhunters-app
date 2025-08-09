# Estructura de Datos de Supabase

Este documento proporciona un resumen completo de la estructura de datos actualizada relacionada con Supabase en el sistema SpinHunters POS.

## Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Estructura de la Base de Datos](#estructura-de-la-base-de-datos)
   - [Tablas](#tablas)
   - [Vistas](#vistas)
   - [Relaciones](#relaciones)
   - [Funciones y Triggers](#funciones-y-triggers)
   - [Políticas de Seguridad (RLS)](#políticas-de-seguridad-rls)
3. [Migraciones Recientes](#migraciones-recientes)
4. [Credenciales y Acceso](#credenciales-y-acceso)
5. [Respaldos](#respaldos)

## Visión General

El sistema SpinHunters POS utiliza Supabase como plataforma de base de datos. Supabase es una alternativa de código abierto a Firebase que proporciona una base de datos PostgreSQL con funcionalidades adicionales como autenticación, almacenamiento y APIs en tiempo real.

La estructura de datos está diseñada para soportar las siguientes funcionalidades principales:
- Gestión de usuarios
- Seguimiento de membresías
- Registro financiero
- Inventario de productos
- Verificaciones de salud del sistema

## Estructura de la Base de Datos

### Tablas

#### users
Almacena información sobre los usuarios del sistema.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid | Clave primaria, generada automáticamente |
| created_at | timestamp with time zone | Marca de tiempo de creación, generada automáticamente |
| updated_at | timestamp with time zone | Marca de tiempo de última actualización |
| email | text | Dirección de correo electrónico del usuario |
| name | text | Nombre completo del usuario |
| alternate_email | text | Correo electrónico alternativo |
| auth_user_id | uuid | Columna puente que referencia a auth.users.id (nullable) |

#### memberships
Rastrea las membresías asociadas con los usuarios.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid | Clave primaria, generada automáticamente |
| created_at | timestamp with time zone | Marca de tiempo de creación, generada automáticamente |
| updated_at | timestamp with time zone | Marca de tiempo de última actualización |
| user_id | uuid | Clave foránea a users.id |
| plan | text | Tipo de plan de membresía (TEXT con CHECK constraint, compatible con POS) |
| start_date | date | Fecha de inicio de la membresía |
| expires_at | date | Fecha de expiración de la membresía |
| status | text | Estado actual (TEXT con CHECK constraint: 'pending', 'active', 'expired', 'cancelled') |
| ggpoker_username | text | Nombre de usuario en GGPoker |
| discord_nickname | text | Apodo en Discord |
| notes | text | Notas adicionales sobre la membresía |
| eva | boolean | Campo para activación del sistema (default: false) |

#### products
Almacena información sobre productos disponibles para la venta.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid | Clave primaria, generada automáticamente |
| name | text | Nombre del producto |
| price | decimal | Precio del producto |
| category | text | Categoría del producto |
| created_at | timestamp with time zone | Marca de tiempo de creación |
| updated_at | timestamp with time zone | Marca de tiempo de última actualización |

#### payment_methods
Almacena los métodos de pago disponibles.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid | Clave primaria, generada automáticamente |
| name | text | Nombre del método de pago |
| description | text | Descripción del método de pago |
| created_at | timestamp with time zone | Marca de tiempo de creación |
| updated_at | timestamp with time zone | Marca de tiempo de última actualización |

#### ledger
Registra transacciones financieras.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid | Clave primaria, generada automáticamente |
| created_at | timestamp with time zone | Marca de tiempo de creación |
| updated_at | timestamp with time zone | Marca de tiempo de última actualización |
| transaction_date | date | Fecha de la transacción |
| description | text | Descripción de la transacción |
| amount | numeric | Monto de la transacción |
| type | text | Tipo de transacción (valores: 'income', 'expense', mantenido así para compatibilidad con POS) |
| category | text | Categoría de la transacción |
| payment_method_id | uuid | Clave foránea a payment_methods.id |
| user_id | uuid | Clave foránea a users.id (opcional) |
| membership_id | uuid | Clave foránea a memberships.id (opcional) |
| currency | text | Moneda de la transacción (default: 'EUR') |
| payment_method_description | text | Descripción del método de pago |
| product_id | uuid | Clave foránea a products.id (opcional) |
| created_by | uuid | Clave foránea a auth.users.id (opcional) |
| name_or_email | text | Nombre o email del usuario relacionado con la transacción |

#### health_check
Tabla simple para verificar la conectividad de la base de datos.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | serial | Clave primaria, auto-incrementada |
| status | text | Siempre 'ok', para verificaciones de conectividad |
| last_checked | timestamp with time zone | Última verificación |

#### admin_users
Tabla que almacena los usuarios con privilegios de administrador.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| user_id | uuid | Clave primaria, referencia a auth.users.id |

#### membership_periods
Tabla que almacena el historial de períodos de membresías.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid | Clave primaria, generada automáticamente |
| membership_id | uuid | Clave foránea a memberships.id |
| start_date | timestamptz | Fecha de inicio del período |
| end_date | timestamptz | Fecha de fin del período |
| plan | text | Tipo de plan de membresía |
| created_at | timestamptz | Marca de tiempo de creación, generada automáticamente |

### Vistas

#### memberships_view
Una vista que une las tablas `memberships` y `users` para proporcionar una vista completa de las membresías con información de usuario.

```sql
CREATE VIEW public.memberships_view 
WITH (security_invoker=true)
AS
SELECT 
    m.id,
    m.user_id,
    u.name AS user_name,
    u.email AS user_email,
    u.alternate_email AS user_alternate_email,
    m.plan,
    m.status,
    m.ggpoker_username,
    m.discord_nickname,
    m.notes,
    m.eva,
    m.start_date,
    m.expires_at,
    m.created_at,
    m.updated_at
FROM 
    public.memberships m
JOIN 
    public.users u ON m.user_id = u.id;
```

#### ledger_view
Una vista que une las tablas `ledger`, `users` y `payment_methods` para proporcionar una vista completa de las transacciones financieras.

```sql
CREATE VIEW ledger_view AS
SELECT 
  l.id,
  l.type,
  l.amount,
  l.description,
  l.product_id,
  p.name AS product_name,
  l.payment_method_id,
  pm.name AS payment_method_name,
  l.created_at,
  l.created_by,
  l.name_or_email,
  l.currency,
  l.payment_method_description,
  l.transaction_date,
  l.category,
  l.user_id,
  u.name AS user_name,
  l.membership_id
FROM 
  ledger l
LEFT JOIN 
  products p ON l.product_id = p.id
LEFT JOIN 
  payment_methods pm ON l.payment_method_id = pm.id
LEFT JOIN 
  users u ON l.user_id = u.id;
```

### Relaciones

- `memberships.user_id` → `users.id` (Muchos a Uno)
- `memberships.payment_method_id` → `payment_methods.id` (Muchos a Uno)
- `ledger.payment_method_id` → `payment_methods.id` (Muchos a Uno)
- `ledger.user_id` → `users.id` (Muchos a Uno)
- `ledger.membership_id` → `memberships.id` (Muchos a Uno)
- `ledger.product_id` → `products.id` (Muchos a Uno)
- `ledger.created_by` → `auth.users.id` (Muchos a Uno)
- `membership_periods.membership_id` → `memberships.id` (Muchos a Uno)
- `admin_users.user_id` → `auth.users.id` (Uno a Uno)
- `users.auth_user_id` → `auth.users.id` (Uno a Uno, columna puente para enlazar con auth)

### Índices y Restricciones

- `uniq_active_membership`: Índice único en `memberships(user_id, plan)` donde `status='active'` (asegura una sola membresía activa por usuario y plan)
- `idx_memberships_user`: Índice en `memberships(user_id)` para búsquedas rápidas
- `idx_memberships_status_expires`: Índice en `memberships(status, expires_at)` para expiración eficiente
- `idx_ledger_user`: Índice en `ledger(user_id)` para búsquedas rápidas
- `idx_ledger_membership`: Índice en `ledger(membership_id)` para búsquedas rápidas
- `idx_ledger_payment_method`: Índice en `ledger(payment_method_id)` para búsquedas rápidas
- `payment_methods_name_key`: Restricción única en `payment_methods(name)` para evitar duplicados

### Funciones y Triggers

#### update_expired_memberships
Una función que actualiza automáticamente el estado de las membresías expiradas y devuelve el número de filas actualizadas.

```sql
CREATE OR REPLACE FUNCTION update_expired_memberships()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_count INTEGER;
BEGIN
  UPDATE public.memberships
     SET status='expired'
   WHERE status='active'
     AND expires_at < CURRENT_DATE;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
```

#### is_admin
Una función que determina si el usuario actual tiene privilegios de administrador consultando la tabla `admin_users`.

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(SELECT 1 FROM public.admin_users WHERE user_id = auth.uid());
$$;
```

#### update_updated_at_column
Una función que actualiza automáticamente la columna `updated_at` cuando se actualiza una fila.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Triggers para esta función:
- `update_users_updated_at` (en la tabla users)
- `update_memberships_updated_at` (en la tabla memberships)
- `update_ledger_updated_at` (en la tabla ledger)
- `update_products_updated_at` (en la tabla products)
- `update_payment_methods_updated_at` (en la tabla payment_methods)

### Políticas de Seguridad (RLS)

La base de datos utiliza Row Level Security (RLS) para controlar el acceso a los datos a nivel de fila. Las políticas actuales son:

#### Tabla users
```sql
-- Los usuarios pueden leer sus propios datos o los administradores pueden leer todos
CREATE POLICY "Users can read their own data"
ON public.users FOR SELECT TO authenticated
USING (auth.uid() = auth_user_id OR is_admin());

-- Los usuarios pueden actualizar sus propios datos o los administradores pueden actualizar todos
CREATE POLICY "Users can update their own data"
ON public.users FOR UPDATE TO authenticated
USING (auth.uid() = auth_user_id OR is_admin())
WITH CHECK (auth.uid() = auth_user_id OR is_admin());

-- Los usuarios pueden insertar su propio perfil
CREATE POLICY "Users can insert their own profile"
ON public.users FOR INSERT TO authenticated
WITH CHECK (auth_user_id = auth.uid());
```

#### Tabla memberships
```sql
-- Los usuarios pueden leer sus propias membresías o los administradores pueden leer todas
CREATE POLICY "Users can read their own memberships"
ON public.memberships FOR SELECT TO authenticated
USING (
  is_admin() OR
  auth.uid() = (
    SELECT u.auth_user_id FROM public.users u WHERE u.id = user_id
  )
);

-- Solo los administradores pueden crear membresías
CREATE POLICY "Only admins can create memberships"
ON public.memberships FOR INSERT TO authenticated
WITH CHECK (is_admin());

-- Solo los administradores pueden actualizar membresías
CREATE POLICY "Only admins can update memberships"
ON public.memberships FOR UPDATE TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Solo los administradores pueden eliminar membresías
CREATE POLICY "Only admins can delete memberships"
ON public.memberships FOR DELETE TO authenticated
USING (is_admin());
```

#### Tabla payment_methods
```sql
-- Todos los usuarios autenticados pueden leer los métodos de pago
CREATE POLICY "All authenticated users can read payment methods"
ON public.payment_methods FOR SELECT TO authenticated
USING (true);

-- Solo los administradores pueden crear métodos de pago
CREATE POLICY "Only admins can create payment methods"
ON public.payment_methods FOR INSERT TO authenticated
WITH CHECK (is_admin());

-- Solo los administradores pueden actualizar métodos de pago
CREATE POLICY "Only admins can update payment methods"
ON public.payment_methods FOR UPDATE TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Solo los administradores pueden eliminar métodos de pago
CREATE POLICY "Only admins can delete payment methods"
ON public.payment_methods FOR DELETE TO authenticated
USING (is_admin());
```

#### Tabla ledger
```sql
-- Los usuarios pueden leer sus propias entradas del libro mayor o los administradores pueden leer todas
CREATE POLICY "Users can read their own ledger entries"
ON public.ledger FOR SELECT TO authenticated
USING (auth.uid() = user_id OR is_admin());

-- Solo los administradores pueden crear entradas del libro mayor
CREATE POLICY "Only admins can create ledger entries"
ON public.ledger FOR INSERT TO authenticated
WITH CHECK (is_admin());

-- Solo los administradores pueden actualizar entradas del libro mayor
CREATE POLICY "Only admins can update ledger entries"
ON public.ledger FOR UPDATE TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Solo los administradores pueden eliminar entradas del libro mayor
CREATE POLICY "Only admins can delete ledger entries"
ON public.ledger FOR DELETE TO authenticated
USING (is_admin());
```

#### Tabla health_check
```sql
-- Todos los usuarios autenticados pueden leer el estado de salud
CREATE POLICY "All authenticated users can read health check"
ON public.health_check FOR SELECT TO authenticated
USING (true);

-- Solo los administradores pueden actualizar el estado de salud
CREATE POLICY "Only admins can update health check"
ON public.health_check FOR UPDATE TO authenticated
USING (is_admin())
WITH CHECK (is_admin());
```

## Migraciones Recientes

Las migraciones más recientes incluyen:

1. **04_pos_compatibility.sql**
   - Asegura compatibilidad con el sistema POS existente
   - Añade columna `auth_user_id` a `public.users` como puente a `auth.users.id`
   - Crea índice único `uniq_active_membership` para asegurar una sola membresía activa por usuario y plan
   - Añade constraint único en `payment_methods.name`
   - Asegura que existan los métodos de pago que usa el POS (Neteller, Skrill, Paypal, etc.)
   - Actualiza vistas con `security_invoker=true` manteniendo columnas del POS

2. **05_rls_secure.sql**
   - Crea tabla `admin_users` para gestión de permisos
   - Implementa función `is_admin()` segura que consulta la tabla `admin_users`
   - Habilita RLS en todas las tablas
   - Implementa políticas de seguridad que usan `auth_user_id` para enlazar con `auth.users`
   - Restringe acceso a `ledger` solo para administradores

3. **05_seed_admins.sql**
   - Inserta los UUIDs de los usuarios administradores en la tabla `admin_users`

4. **20240630_add_notes_eva_fields.sql**
   - Añade campos `notes` (texto) y `eva` (booleano) a la tabla memberships
   - Actualiza la vista memberships_view para incluir estos campos

5. **20240626_add_payment_method_description.sql**
   - Añade el campo `description` a la tabla payment_methods

6. **20240621_add_discord_nickname.sql**
   - Añade el campo `discord_nickname` a la tabla memberships

7. **20240620_update_membership_schema.sql**
   - Actualiza el esquema de la tabla memberships

## Credenciales y Acceso

### Ubicación de Credenciales

Las credenciales de Supabase se almacenan en los siguientes lugares:

1. **Desarrollo local**:
   - Archivo: `env/.env.production`
   - Formato:
     ```
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key
     ```

2. **Despliegue continuo (GitHub Actions)**:
   - Las credenciales se almacenan como secretos de GitHub:
     - `SUPABASE_URL`: La URL del proyecto Supabase
     - `SUPABASE_ANON_KEY`: La clave anónima del proyecto Supabase

### Consideraciones de Seguridad

- Nunca incluir credenciales de Supabase en el código fuente
- Usar variables de entorno y secretos de GitHub para almacenar credenciales
- Asegurarse de que el archivo `.env.production` no esté incluido en el control de versiones
- Verificar que las políticas RLS estén correctamente configuradas en Supabase

### Roles y Permisos

- **desktop_app**: Rol con permisos para realizar operaciones CRUD en todas las tablas públicas
- **authenticated**: Rol para usuarios autenticados con permisos según las políticas RLS

## Respaldos

### Respaldos Automatizados

- El sistema está configurado para realizar respaldos diarios utilizando GitHub Actions
- El flujo de trabajo está definido en `.github/workflows/db-backup.yml`
- Los respaldos se almacenan en Google Drive y se mantienen las últimas 30 versiones

### Respaldos Manuales

- Desde la aplicación: Ir a Configuración > Respaldo > "Exportar Datos (CSV)"
- Desde Supabase: Usar la función de respaldo en el panel de control

### Verificación de Respaldos

- Verificar regularmente que los respaldos se estén realizando correctamente
- Probar periódicamente la restauración de un respaldo en un entorno de prueba
