Aquí tienes el **`DATABASE.md`** completo listo para pegar y reemplazar el archivo actual.

---

# Database Structure and Schema (EVA POS · SpinHunters)

Este documento refleja **la estructura real** compartida entre el POS (EVA) y la SpinHunters App. Describe tablas, vistas, funciones/triggers y un resumen de RLS tal como están hoy en Supabase.

> Nota clave de identidad:
>
> * `auth.users.id` (ID de autenticación) se mapea a `public.users.auth_user_id`.
> * El **perfil** del usuario vive en `public.users` y su PK es `public.users.id`.
> * Las relaciones de negocio (p. ej., `memberships.user_id`) apuntan a **`public.users.id`** (no a `auth.users.id`).

---

## Tablas

### `public.users`

Perfil del usuario (no confundir con `auth.users`).

| Columna           | Tipo                               | Notas                                                      |
| ----------------- | ---------------------------------- | ---------------------------------------------------------- |
| id                | `uuid` `default gen_random_uuid()` | **PK** (perfil)                                            |
| name              | `text` `not null`                  | Nombre visible                                             |
| email             | `text` `not null`                  | Único (`users_email_key`) + índice `idx_users_email_lower` |
| created\_at       | `timestamptz` `default now()`      |                                                            |
| updated\_at       | `timestamptz` `default now()`      | Trigger `update_users_updated_at`                          |
| alternate\_email  | `text`                             | Gmail (para Classroom/servicios)                           |
| auth\_user\_id    | `uuid`                             | FK opcional → `auth.users(id)` (`users_auth_user_id_fkey`) |
| username          | `text`                             | Único (`users_username_key`)                               |
| discord\_nickname | `text`                             |                                                            |
| ggpoker\_username | `text`                             |                                                            |

**Índices y triggers**

* `create index if not exists idx_users_email_lower on public.users (lower(email));`
* Trigger: `update_users_updated_at` → `update_updated_at_column()`.

---

### `public.memberships`

Membresías administradas por el POS.

| Columna           | Tipo                                 | Notas                                                        |
| ----------------- | ------------------------------------ | ------------------------------------------------------------ |
| id                | `uuid` `default gen_random_uuid()`   | **PK**                                                       |
| user\_id          | `uuid` `not null`                    | FK → `public.users(id)` (`memberships_user_id_fkey`)         |
| plan              | `text` `not null`                    | Texto libre (no ENUM), compatible con denominaciones del POS |
| status            | `text` `not null` `default 'active'` | CHECK en `('active','expired','cancelled')`                  |
| start\_date       | `timestamptz` `not null`             |                                                              |
| expires\_at       | `timestamptz` `not null`             |                                                              |
| created\_at       | `timestamptz` `default now()`        |                                                              |
| updated\_at       | `timestamptz` `default now()`        | Trigger `update_memberships_updated_at`                      |
| ggpoker\_username | `text`                               |                                                              |
| discord\_nickname | `text`                               |                                                              |
| notes             | `text`                               |                                                              |
| eva               | `boolean` `default false`            | Flag interno del POS                                         |

**Índice único parcial (una activa por usuario/plan)**

```sql
create unique index if not exists uniq_active_membership
on public.memberships(user_id, plan)
where status = 'active';
```

**Triggers relevantes**

* `fill_membership_from_user` (BEFORE INSERT) → `membership_defaults_from_user()`
  Completa campos opcionales de la membresía (discord, ggpoker, etc.) desde `public.users`.
* `update_memberships_updated_at` (BEFORE UPDATE) → `update_updated_at_column()`.

---

### `public.membership_periods`

Historial de periodos asociados a una membresía (renovaciones, cambios de plan, etc.).

| Columna        | Tipo                               | Notas                         |
| -------------- | ---------------------------------- | ----------------------------- |
| id             | `uuid` `default gen_random_uuid()` | **PK**                        |
| membership\_id | `uuid` `not null`                  | FK → `public.memberships(id)` |
| start\_date    | `timestamptz` `not null`           |                               |
| end\_date      | `timestamptz` `not null`           |                               |
| plan           | `text` `not null`                  |                               |
| created\_at    | `timestamptz` `default now()`      |                               |

> Nota: el POS puede usar esta tabla para auditoría/renovaciones. La app web la consulta en **solo lectura**.

---

### `public.payment_methods`

Métodos de pago (catálogo POS).

| Columna     | Tipo          | Notas        |
| ----------- | ------------- | ------------ |
| id          | `uuid`        | **PK**       |
| name        | `text`        | Nombre único |
| created\_at | `timestamptz` |              |
| updated\_at | `timestamptz` |              |

> La descripción puntual usada en un cobro vive en `ledger.payment_method_description` (no aquí).

---

### `public.products`

Catálogo simple del POS.

| Columna     | Tipo          | Notas  |
| ----------- | ------------- | ------ |
| id          | `uuid`        | **PK** |
| name        | `text`        |        |
| price       | `numeric`     |        |
| category    | `text`        |        |
| created\_at | `timestamptz` |        |
| updated\_at | `timestamptz` |        |

---

### `public.ledger`

Movimientos contables del POS. **Solo administradores** pueden ver/gestionar esta tabla (los usuarios finales **no** ven sus movimientos).

| Columna                      | Tipo          | Notas                                     |
| ---------------------------- | ------------- | ----------------------------------------- |
| id                           | `uuid`        | **PK**                                    |
| type                         | `text`        | `'income'` \| `'expense'` (CHECK del POS) |
| amount                       | `numeric`     |                                           |
| description                  | `text`        |                                           |
| product\_id                  | `uuid`        | FK opcional → `public.products(id)`       |
| payment\_method\_id          | `uuid`        | FK → `public.payment_methods(id)`         |
| created\_at                  | `timestamptz` |                                           |
| created\_by                  | `uuid`        | FK opcional → `auth.users(id)`            |
| name\_or\_email              | `text`        |                                           |
| currency                     | `text`        |                                           |
| payment\_method\_description | `text`        |                                           |

> Aclaración: En el esquema actual del POS **no existen** `transaction_date`, `category`, `user_id` o `membership_id` dentro de `ledger`.

---

### `public.health_check` (si aplica)

Tabla mínima de diagnóstico.

| Columna       | Tipo          | Notas           |
| ------------- | ------------- | --------------- |
| id            | `serial`      | **PK**          |
| status        | `text`        | default `'ok'`  |
| last\_checked | `timestamptz` | default `now()` |

---

### `public.admin_users`

Usuarios administradores.

| Columna  | Tipo   | Notas                     |
| -------- | ------ | ------------------------- |
| user\_id | `uuid` | **PK** → `auth.users(id)` |

---

## Vistas

### `public.memberships_view`

Vista de **solo lectura** para listar membresías con datos del usuario.

```sql
create or replace view public.memberships_view as
select
  m.id,
  m.user_id,
  u.name  as user_name,
  u.email as user_email,
  u.alternate_email as user_alternate_email,
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
from public.memberships m
join public.users u on u.id = m.user_id;
```

### `public.ledger_view`

Vista para mostrar movimientos con nombres de producto y método de pago.

```sql
create or replace view public.ledger_view as
select
  l.id,
  l.type,
  l.amount,
  l.description,
  l.product_id,
  p.name as product_name,
  l.payment_method_id,
  pm.name as payment_method_name,
  l.created_at,
  l.created_by,
  l.name_or_email,
  l.currency,
  l.payment_method_description
from public.ledger l
left join public.products p on p.id = l.product_id
left join public.payment_methods pm on pm.id = l.payment_method_id;
```

---

## Funciones & Triggers (resumen)

* `update_updated_at_column()`
  Triggers:

  * `update_users_updated_at` (en `users`)
  * `update_memberships_updated_at` (en `memberships`)
  * (Opcional) en `products`, `payment_methods`, `ledger` según tu proyecto.

* `membership_defaults_from_user()`
  Trigger:

  * `fill_membership_from_user` (BEFORE INSERT en `memberships`).
    Completa campos opcionales desde el perfil (`users`).

* (Opcional) `record_membership_period()` + trigger de auditoría
  Para historizar cambios relevantes en `memberships` hacia `membership_periods`.

> **Recomendación técnica**: dentro de funciones PL/pgSQL, **califica** siempre columnas con alias de tabla (`m.user_id`, `u.email`, etc.) para evitar ambigüedad con parámetros OUT.

---

## RLS (resumen funcional)

> Las políticas se definen en `supabase/sql/05_rls_secure.sql`. Aquí va el comportamiento esperado:

* **users**

  * `SELECT / UPDATE`: el usuario sobre su propia fila (`auth.uid() = auth_user_id`) o admin (`is_admin() = true`).
  * `INSERT`: permitido si `auth_user_id = auth.uid()` (o admin).

* **memberships**

  * `SELECT`: el usuario ve **solo sus** membresías (vía enlace `users.id` ↔ `memberships.user_id`), o admin.
  * `INSERT / UPDATE / DELETE`: **solo admin** (la app web no crea ni modifica membresías).

* **membership\_periods**

  * Por defecto: **solo admin** (la lectura por dueño es opcional según necesidades).

* **payment\_methods**

  * `SELECT`: cualquier autenticado.
  * Mutaciones: **solo admin**.

* **ledger**

  * **Todas** las operaciones: **solo admin**.
  * Decisión de producto: los usuarios finales **no** ven movimientos contables.

---

## Convenciones de uso en la App

* El **callback** de autenticación (`/auth/callback`) realiza **upsert de perfil** en `public.users` (por `email`/`auth_user_id`). **No** toca `memberships`.
* El **dashboard** consulta estado de membresía en `public.memberships_view` usando **`users.id`** (perfil), **no** `auth.users.id`.
* La **gestión** de membresías (crear, cancelar, renovar) se hace desde el **POS** o mediante RPCs **solo-admin**.

---
