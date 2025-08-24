
# Supabase Security Policies (RLS) — EVA POS · SpinHunters App

Este documento describe **cómo protegemos los datos** en Supabase mediante **RLS (Row-Level Security)** y funciones auxiliares. Refleja el comportamiento vigente en producción y cómo trabajamos en desarrollo local.

> Principios:
>
> * **Mínimo privilegio**: cada rol solo ve y modifica lo que necesita.
> * Identidad clara:
>
>   * `auth.users.id` (ID de autenticación) → se mapea a `public.users.auth_user_id`.
>   * El **perfil** del usuario está en `public.users` con PK `public.users.id`.
>   * Las relaciones de negocio (p. ej. `memberships.user_id`) apuntan a **`public.users.id`** (no a `auth.users.id`).
> * La **app web** no crea ni modifica membresías: solo **lee** `public.memberships_view`.
>   La **gestión** (alta/renovación/cancelación) ocurre en el **POS** o en RPCs **solo-admin**.

---

## 1) Tablas con RLS habilitado

Habilitamos RLS en:

* `public.users`
* `public.memberships`
* `public.membership_periods`
* `public.payment_methods`
* `public.ledger`
* `public.health_check` *(si existe)*

> **Nunca** deshabilites RLS en producción. Las excepciones temporales solo se permiten en entornos locales y con revisiones explícitas.

---

## 2) Función de administración

**`public.is_admin()`** — determina si el usuario autenticado es administrador.

* **Definición** esperada (conceptual):

  * `SECURITY DEFINER`
  * `STABLE`
  * `SET search_path = public`
  * Devuelve `TRUE` si existe una fila en `public.admin_users` con `user_id = auth.uid()`.

**Notas de seguridad**

* La función debe vivir en `public` y usar `search_path` fijo (`public`) para evitar búsquedas de objetos fuera del esquema esperado.
* Recomendado: conceder `EXECUTE` a `authenticated` y **no** conceder a `anon`.

---

## 3) Políticas por tabla (producción)

A continuación resumimos las políticas efectivas. La implementación exacta se mantiene en los archivos SQL versionados (p. ej., `sql/05_rls_secure.sql`).

### `public.users`

* **SELECT / UPDATE**

  * Permitido si `auth.uid() = users.auth_user_id` (el usuario sobre su propio perfil).
  * Permitido a **admins** (`is_admin()`).
* **INSERT**

  * Permitido si `NEW.auth_user_id = auth.uid()` (el usuario crea su propio perfil tras el callback).
  * Permitido a **admins**.

> Reglas adicionales:
>
> * Evitar que un usuario actualice el `auth_user_id` de otro.
> * `email`, `username` únicos: dejar que las restricciones de la tabla validen conflictos.

---

### `public.memberships`

* **SELECT**

  * El usuario ve **solo sus** membresías evaluando el vínculo `users.id` ↔ `memberships.user_id`:

    ```sql
    auth.uid() = (
      select u.auth_user_id
      from public.users u
      where u.id = memberships.user_id
      limit 1
    )
    ```
  * Permitido a **admins**.
* **INSERT / UPDATE / DELETE**

  * **Solo admins**.

> Decisión de producto: la app web **no** altera membresías; el POS es la fuente de verdad.

---

### `public.membership_periods`

* **SELECT**

  * Por defecto, **solo admins**.
  * (Opcional) Se puede abrir lectura condicionada al dueño si el negocio lo necesita.
* **INSERT / UPDATE / DELETE**

  * **Solo admins**.

---

### `public.payment_methods`

* **SELECT**

  * **Todos los autenticados** (catálogo de lectura).
* **INSERT / UPDATE / DELETE**

  * **Solo admins**.

---

### `public.ledger`

* **TODAS** las operaciones (SELECT/INSERT/UPDATE/DELETE)

  * **Solo admins**.

> Decisión de producto: **los usuarios finales no ven movimientos contables**.

---

### `public.health_check` *(si existe)*

* **SELECT**

  * **Todos los autenticados** (o incluso público si es un ping sin datos sensibles).
* **UPDATE**

  * **Solo admins** (si fuera necesario).

---

## 4) Vistas

* **`public.memberships_view`** y **`public.ledger_view`**

  * Son vistas **de solo lectura**.
  * Las políticas **se evalúan sobre las tablas subyacentes** (RLS vive en las tablas, no en la vista).
  * No definas políticas “permisivas” pensando que una vista restringe; **no** otorga privilegios adicionales por sí misma.

---

## 5) RPCs y funciones con `SECURITY DEFINER`

* Cualquier RPC que **escriba** en tablas sensibles (p. ej., crear membresía) **debe**:

  * Comprobar primero `public.is_admin()` y abortar con `not_authorized` si no lo es.
  * Usar `SECURITY DEFINER` y `SET search_path = public`.
  * Calificar **todas** las columnas con alias de tabla (`m.user_id`, `u.email`, etc.) para evitar ambigüedades con parámetros OUT.

* Ejemplo de política interna de una RPC de administración:

  ```plpgsql
  if not public.is_admin() then
    raise exception 'not_authorized';
  end if;
  -- ... operaciones ...
  ```

---

## 6) Desarrollo local (solo para diagnóstico)

En la consola SQL de Supabase, por defecto **no** hay JWT y `auth.uid()` será `NULL`. Para **probar** funciones que requieren identidad:

```sql
-- Simular usuario autenticado en la sesión SQL
set local role authenticated;
select set_config(
  'request.jwt.claims',
  json_build_object('sub', '<TU_AUTH_USER_ID>')::text,
  true
);
select auth.uid();  -- debe devolver <TU_AUTH_USER_ID>
```

> **No** copies esta simulación en producción ni la dejes en `DO $$ ... $$`. Es solo para pruebas puntuales en local/diagnóstico.

---

## 7) Checklist de seguridad (producción)

* [ ] RLS **habilitado** en todas las tablas listadas.
* [ ] `is_admin()` con `SECURITY DEFINER`, `STABLE`, `search_path = public`.
* [ ] RPCs sensibles (creación/actualización de membresías, ledger, etc.) verifican `is_admin()` y califican columnas.
* [ ] `ledger`: solo admins (usuarios no ven movimientos).
* [ ] `memberships`: usuarios solo ven **las suyas**; mutaciones solo admin.
* [ ] `users`: usuario solo su perfil; inserción ligada a su `auth_user_id`.
* [ ] No existen funciones “comodín” que hagan bypass de RLS.
* [ ] No hay vistas con lógicas que expongan más de lo que las tablas permiten.
* [ ] No hay `SECURITY DEFINER` con `search_path` inseguro (dinámico o con esquemas no controlados).

---

## 8) Compatibilidad con la App

* **Callback** (`/auth/callback`): upsert a `public.users` (perfil) por `email`/`auth_user_id`. No toca membresías.
* **Dashboard**: lee `public.memberships_view` filtrando por `public.users.id` (obtenido buscando el perfil por `auth_user_id`).
* **Admin**: acceso solo si `auth.user.id` existe en `public.admin_users`.
* **App web**: **no** crea ni anula membresías, **no** toca `ledger`.

---

## 9) Cambios futuros

Si cambias columnas, índices o firmas de funciones:

* Actualiza el SQL versionado (p. ej., `sql/05_rls_secure.sql` y migraciones asociadas).
* Ajusta este documento para que el comportamiento descrito **siempre** corresponda a lo desplegado.

---

**Fin.**
