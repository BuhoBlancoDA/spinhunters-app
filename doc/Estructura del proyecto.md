Perfecto, Dan. Me voy a mojar y elegir la línea que te da **menos fricción hoy** y te deja **escala limpia mañana**.

# Línea elegida (por qué)

* **App separada en Vercel** (Next.js) en `app.spinhunters.es`.
* **WordPress** sigue en **Sered (cPanel)** sin tocarlo (solo redirecciones/enlaces).
* **Supabase** como **identidad y DB única** (tu proyecto actual).
* **Brevo** para emails (verificación, bienvenida, recordatorios).

**Motivo:** cPanel (Sered) es perfecto para WordPress, pero no para desplegar apps Node modernas sin pelea. Vercel te da CI/CD, SSL y rollbacks en 2 clics. Con un **CNAME en cPanel** apuntas el subdominio a Vercel y listo.

---

# Qué te voy a entregar (resumen)

1. **Checklist de arranque** (proyecto, DNS, .env).
2. **Qué archivos/documentos** de tu stack actual copiar al nuevo repo (y dónde).
3. **Esqueleto de RLS y roles** con tus tres roles: *Cazadores*, *Ultimate (activa)*, *Estudiantes*.
4. **Edge Functions** mínimas (nombres, payloads, seguridad).
5. **Instrucciones Brevo** (plantillas y webhooks).
6. **Instrucciones WordPress (Sered)** para integrar sin romper nada.
7. **Guía para tu Agente de IA** (brief técnico paso a paso y criterios de aceptación).

---

# 1) Checklist de arranque

## A. Repositorio y stack

* Crea repo: **`spinhunters-app`**.
* Tech: **Next.js + TypeScript + Supabase JS + shadcn/ui**.
* Páginas iniciales: `/login`, `/register`, `/dashboard`, `/admin`.

## B. DNS en Sered (cPanel)

1. En el **Zone Editor** de `spinhunters.es`, crea **CNAME**:

   * **Nombre:** `app`
   * **Destino:** `cname.vercel-dns.com`
2. En Vercel, añade dominio `app.spinhunters.es` al proyecto.
3. Espera propagación (normalmente < 30 min).

## C. Variables de entorno (Vercel → Project → Settings → Environment Variables)

* `NEXT_PUBLIC_SUPABASE_URL`
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`
* `SUPABASE_SERVICE_ROLE` *(solo en Server/Edge)*
* `BREVO_API_KEY`
* `BREVO_FROM_EMAIL` (p.ej. `no-reply@spinhunters.es`)
* `APP_BASE_URL` = `https://app.spinhunters.es`

---

# 2) Qué documentos del stack actual copiar al nuevo repo

Crea carpeta `/docs` en el repo y copia estos archivos (para que tu Agente de IA tenga **contexto fiel** y no “reinvente”):

* `/docs/ARCHITECTURE.md` (referencia para la vista global)
* `/docs/SUPABASE_STRUCTURE.md` (esquema y tablas actuales)
* `/docs/DATABASE.md` (campos, vistas, índices, triggers)
* `/docs/README.md` (requisitos, notas operativas)
* `/docs/DEPLOYMENT.md` y `/docs/DESPLIEGUE.md` (historial de despliegue/backup)
* `/docs/USER_REGISTRATION_PROPOSAL.md` (requisitos de registro y perfil)

> **Por qué**: estos docs son tu “contrato” vivo. Tu Agente debe leer **/docs** antes de tocar código.

Además, crea:

* `/supabase/sql/` → aquí guardar **migraciones** nuevas (SQL).
* `/supabase/functions/` → aquí definir **especificaciones** de Edge Functions (aunque se creen desde Supabase CLI, documenta payloads aquí).

---

# 3) Roles y RLS (mínimo viable, listo para hoy)

## A. Modelo de roles

* **Cazadores** = cualquier usuario con cuenta creada (base).
* **Ultimate (activa)** = usuarios con `memberships.status='active'` y `plan='ultimate'`.
* **Estudiantes** = etiqueta por curso (cuando integremos Classroom), guardado en `enrollments` o una relación `user_courses`.

Añade columna (si no existe):

* `users.role_hint` (texto) → *opcional, solo informativo para admin.*
* **No** confíes en una columna para permisos; usa **consultas** a `memberships` y **RLS**.

## B. Policies (orientación)

* `users`:

  * `select`: `auth.uid() = id` **o** es admin.
  * `update`: solo su fila (campos seguros: `name`, `alternate_email`, `phone`, `discord`, etc.).
  * `insert`: por Auth hook (id=auth.uid()).
* `memberships`:

  * `select`: dueños leen las suyas.
  * `insert/update`: **solo** Edge Function con `service_role` o `role=admin`.
  * **Nunca** permitir que el cliente cambie `status` o `expires_at`.
* `ledger` / `payment_intents`: escritura **solo** funciones server-side.

*(Tu README y docs ya contemplan RLS de prod; este es el ajuste con tus roles.)*

---

# 4) Edge Functions (nombres, payloads y seguridad)

Crea estas funciones (Supabase Edge Functions). Todas aceptan `Authorization: Bearer <service_role>` **o** un JWT con claim `role=admin`:

1. `admin.upsertMembership`

* **POST /admin.upsertMembership**
* **Body:**

  ```json
  {
    "user_id":"UUID",
    "plan":"ultimate",
    "status":"active|pending|expired|cancelled",
    "expires_at":"2025-12-31T23:59:59Z",
    "notes":"opcional"
  }
  ```
* **Acción:** inserta/actualiza membresía; valida que solo admin cambie `status`/`expires_at`.

2. `admin.recordPayment`

* **POST /admin.recordPayment**
* **Body:**

  ```json
  {
    "user_id":"UUID",
    "amount": 49.00,
    "currency":"USD",
    "method":"manual|paypal|stripe|transfer",
    "reference":"texto",
    "metadata": {}
  }
  ```
* **Acción:** crea `ledger` con movimiento; si `method != manual`, marca `payment_intents` y **activa membresía** cuando corresponda.

3. `notify.email`

* **POST /notify.email**
* **Body:**

  ```json
  {
    "template":"welcome|membership_activated|membership_expiring|membership_expired",
    "user_id":"UUID",
    "variables": { "name":"Dan", "expires_at":"..." }
  }
  ```
* **Acción:** llama Brevo API usando `BREVO_API_KEY`.

4. `cron.expirations`

* **GET/POST /cron.expirations**
* **Acción:** diariamente:

  * marca `memberships` expiradas por fecha,
  * dispara `notify.email` para “expiring” (7 días antes) y “expired”.

> **Tip:** Documenta cada función en `/supabase/functions/*.md` con **Request/Response**, **errores** y **SQL afectado**.

---

# 5) Brevo (implementación)

## A. Configurar remitente

* Verifica dominio `spinhunters.es` en Brevo (DNS SPF/DKIM desde Sered).
* Crea **sender**: `no-reply@spinhunters.es`.

## B. Plantillas

Crea 4 plantillas (IDs visibles en Brevo):

* `welcome` — asunto: “¡Bienvenido a SpinHunters!”
* `membership_activated` — “Tu membresía Ultimate ya está activa”
* `membership_expiring` — “Tu membresía vence pronto”
* `membership_expired` — “Tu membresía ha expirado”

Variables típicas: `{{ params.name }}`, `{{ params.expires_at }}`, `{{ params.dashboard_url }}`.

## C. Llamada desde Edge

* Usa Brevo API v3 (`/smtp/email`) con `BREVO_API_KEY`.
* En `notify.email`, mapea `template` → `templateId` y `params`.

---

# 6) WordPress en Sered (integración tranquila)

**Hoy (rápido):**

* Añade CTA “Mi Cuenta / Dashboard” que apunte a `https://app.spinhunters.es`.
* Para páginas de pago/beneficios, coloca **bloques condicionados** (“Si tienes Ultimate, entra por aquí → dashboard”), y guías al App.

**Mañana (cuando quieras SSO):**

* Instala plugin **OpenID Connect / OAuth**.
* Configura **Supabase** como proveedor (Auth URL/Token URL/UserInfo).
* Usuarios iniciados en App podrán entrar en WP sin password. *(Lo hacemos cuando ya estés cómodo con el App).*

---

# 7) Flujo de usuario (MVP hoy)

1. Usuario abre `app.spinhunters.es` → **Register** (magic link).
2. Completa **perfil** (discord, ggpoker, teléfono opcional).
3. Ve **Dashboard**: plan `Ultimate` **pendiente**.
4. Admin (tú) registra **pago manual** en POS o App → `admin.recordPayment` → activa con `admin.upsertMembership`.
5. Se envía email de **activación** por Brevo.
6. Dashboard muestra **Ultimate (activa)** y **fecha de expiración**.

---

# 8) Instrucciones para tu **Agente de IA** (brief operativo)

Pega esto literalmente como **Prompt del Agente**:

**Objetivo General**
Construir y desplegar la app `spinhunters-app` (Next.js + Supabase) siguiendo los documentos en `/docs`, con autenticación Supabase, dashboard de usuario, mini-panel admin, Edge Functions y notificaciones vía Brevo. Integrar con el WordPress existente mediante enlaces y dejar lista la base para pagos y SSO.

**Repos y estructura**

* Crear proyecto Next.js con TypeScript.
* Directorios:

  ```
  /docs/...(copiados)
  /src/app/(routes)  login, register, dashboard, admin
  /src/components/...
  /src/lib/supabaseClient.ts
  /src/lib/api.ts (fetchers server-only)
  /supabase/sql/ (migraciones nuevas)
  /supabase/functions/ (especificaciones funciones + tests)
  ```
* Respetar esquema de `/docs/SUPABASE_STRUCTURE.md` y `/docs/DATABASE.md`.

**Tareas por orden**

1. **Auth**: páginas de Login/Register (magic link), sesión persistente, guardas en `users` con `id = auth.uid()`.
2. **RLS**: políticas seguras (leer/editar su propio perfil; memberships solo admin/functions).
3. **Dashboard usuario**: ver perfil y estado de `memberships` (plan, status, expires\_at).
4. **Admin mini-panel**: buscar usuario por email, activar/cambiar plan “ultimate”, set `expires_at`, añadir nota.
5. **Edge Functions**: `admin.upsertMembership`, `admin.recordPayment`, `notify.email`, `cron.expirations`. Proveer specs y tests.
6. **Brevo**: cliente simple en server (`BREVO_API_KEY`), función `sendTemplateEmail(template, to, params)`.
7. **CI/CD**: despliegue en Vercel con variables de entorno indicadas.
8. **Documentar** en `/docs/` cualquier decisión y endpoint final.

**Restricciones**

* No exponer `SUPABASE_SERVICE_ROLE` al cliente (solo server).
* Ningún cambio de `status` ni `expires_at` desde el cliente.
* Cumplir los esquemas definidos en `/docs`.

**Criterios de aceptación**

* Usuario puede **registrarse**, **loguearse** y **ver su Dashboard**.
* Admin puede **activar Ultimate** y **registrar pago manual**.
* Se envían emails de **welcome** y **membership\_activated**.
* `cron.expirations` marca expiraciones y envía **expiring/expired**.
* RLS comprobada con tests: usuario no puede ver/editar datos de otros ni auto-activarse.

**Entregables**

* Repo con código funcional.
* Scripts SQL en `/supabase/sql/` para migraciones.
* Especificaciones + tests de Edge Functions.
* Guía rápida de operación (README del repo) para activar usuarios y gestionar pagos manuales.

---

# 9) Pasos de implementación para ti (operativos)

1. **DNS**: crea el CNAME `app → cname.vercel-dns.com` en cPanel (Sered).
2. **Vercel**: crea proyecto, conecta repo, añade variables de entorno.
3. **Supabase**: crea las Edge Functions vacías (stub) y pega los handlers básicos.
4. **Brevo**: verifica dominio y crea plantillas (guárdate los IDs).
5. **App**: prueba el flujo de registro → verifica email → entra al Dashboard.
6. **Admin**: desde el mini-panel, activa una cuenta de prueba → verifica email de activación.
7. **WP**: coloca botones “Mi Cuenta/Registro” apuntando a la App.

---

# 10) ¿Qué te pido ahora?

* Confírmame si **Vercel** te vale para el despliegue (recomendado).
* Dime el **nombre del remitente** y estilo de los **emails de Brevo** para dejarte los textos.
* Avísame si deseas que te pase **plantilla de proyecto** (estructura de carpetas + componentes base + supabase client + guards de ruta).

Cuando me confirmes, te mando:

* **SQL de migración mínima** (si hace falta alguna columna/campo),
* **Plantilla de emails** y
* **Esqueleto de endpoints** listo para copiar-pegar.
