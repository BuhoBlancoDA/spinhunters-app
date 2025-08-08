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

#### memberships
Rastrea las membresías asociadas con los usuarios.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid | Clave primaria, generada automáticamente |
| created_at | timestamp with time zone | Marca de tiempo de creación, generada automáticamente |
| updated_at | timestamp with time zone | Marca de tiempo de última actualización |
| user_id | uuid | Clave foránea a users.id |
| plan | text | Tipo de plan de membresía |
| start_date | date | Fecha de inicio de la membresía |
| expires_at | date | Fecha de expiración de la membresía |
| status | text | Estado actual (active, expired, cancelled) |
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
| type | text | Tipo de transacción (income, expense) |
| category | text | Categoría de la transacción |
| payment_method_id | uuid | Clave foránea a payment_methods.id |
| user_id | uuid | Clave foránea a users.id (opcional) |
| membership_id | uuid | Clave foránea a memberships.id (opcional) |

#### health_check
Tabla simple para verificar la conectividad de la base de datos.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | serial | Clave primaria, auto-incrementada |
| status | text | Siempre 'ok', para verificaciones de conectividad |
| last_checked | timestamp with time zone | Última verificación |

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
  l.created_at,
  l.updated_at,
  l.transaction_date,
  l.description,
  l.amount,
  l.type,
  l.category,
  l.payment_method_id,
  pm.name as payment_method_name,
  l.user_id,
  u.name as user_name,
  l.membership_id
FROM 
  ledger l
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

### Funciones y Triggers

#### update_expired_memberships
Una función que actualiza automáticamente el estado de las membresías expiradas.

```sql
CREATE OR REPLACE FUNCTION update_expired_memberships()
RETURNS void AS $$
BEGIN
  UPDATE memberships
  SET status = 'expired'
  WHERE expires_at < CURRENT_DATE
  AND status = 'active';
END;
$$ LANGUAGE plpgsql;
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
-- Permitir a usuarios autenticados realizar todas las operaciones en sus propios datos
CREATE POLICY "Allow users CRUD for authenticated"
ON public.users
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
```

#### Tabla memberships
```sql
-- Permitir a usuarios autenticados realizar todas las operaciones en membresías
CREATE POLICY "Allow memberships CRUD for authenticated"
ON public.memberships
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
```

## Migraciones Recientes

Las migraciones más recientes incluyen:

1. **20240630_add_notes_eva_fields.sql**
   - Añade campos `notes` (texto) y `eva` (booleano) a la tabla memberships
   - Actualiza la vista memberships_view para incluir estos campos

2. **20240626_add_payment_method_description.sql**
   - Añade el campo `description` a la tabla payment_methods

3. **20240621_add_discord_nickname.sql**
   - Añade el campo `discord_nickname` a la tabla memberships

4. **20240620_update_membership_schema.sql**
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