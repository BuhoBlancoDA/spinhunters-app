// app/(marketing)/page.tsx
import Image from 'next/image'
import type { Metadata } from 'next'

export const dynamic = 'force-static'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'SpinHunters — Domina el póker',
  description:
    'Accede a herramientas privadas, tu membresía y al panel personal. Compatible con tu cuenta actual del ecosistema SpinHunters.',
}

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="section">
        <div className="container-narrow text-center">
          <div className="badge mb-6 w-fit mx-auto">
            <span className="h-2 w-2 rounded-full bg-brand"></span>
            Plataforma oficial de miembros
          </div>

          <h1 className="heading">
            Domina el póker con <span className="text-brand">SpinHunters</span>
          </h1>

          <p className="muted mt-4 max-w-2xl mx-auto">
            Accede a tu membresía, coaching, herramientas avanzadas y a tu panel personal.
            Todo en un solo lugar.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <a href="/login" className="btn btn-primary">Acceder a mi cuenta</a>
            <a href="/register" className="btn btn-ghost">Crear cuenta</a>
          </div>

          {/* Imagen decorativa (marco con halo) */}
          <div className="mt-12 max-w-4xl mx-auto hero-frame">
            <Image
              src="/hero-dashboard.png"
              alt="SpinHunters — herramientas y panel"
              width={1400}
              height={820}
              priority
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* BENEFICIOS / FUNCIONALIDADES */}
      <section className="section">
        <div className="container-narrow">
          <div className="features">
            <div className="feature-card">
              <div className="icon-badge mb-3">🦉</div>
              <h3 className="text-lg font-semibold">Herramientas privadas</h3>
              <p className="muted mt-2">
                Acceso a EVA Analyzer, rangos avanzados y otros desarrollos exclusivos.
              </p>
            </div>

            <div className="feature-card">
              <div className="icon-badge mb-3">💳</div>
              <h3 className="text-lg font-semibold">Gestiona tu membresía</h3>
              <p className="muted mt-2">
                Compra/renueva la <strong>Membresía Ultimate</strong>, revisa estado e historial.
              </p>
            </div>

            <div className="feature-card">
              <div className="icon-badge mb-3">🎫</div>
              <h3 className="text-lg font-semibold">Soporte & Contacto</h3>
              <p className="muted mt-2">
                Envía tickets y accede a links oficiales de soporte y comunidad.
              </p>
            </div>

            <div className="feature-card">
              <div className="icon-badge mb-3">🎓</div>
              <h3 className="text-lg font-semibold">Classroom oficial</h3>
              <p className="muted mt-2">
                Conecta tu Gmail y sigue el progreso de tus cursos desde el aula oficial.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="section">
        <div className="container-narrow">
          <h2 className="text-2xl md:text-3xl font-bold text-center">¿Cómo funciona?</h2>
          <div className="steps mt-8">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="font-semibold">Crea tu cuenta</h3>
              <p className="muted mt-1">Regístrate con email y contraseña y verifica tu correo.</p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="font-semibold">Completa tu perfil</h3>
              <p className="muted mt-1">Usuario, Gmail (Classroom), Discord y (opcional) GGpoker.</p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="font-semibold">Accede al panel</h3>
              <p className="muted mt-1">
                Revisa tu estado de membresía y utiliza tus herramientas privadas.
              </p>
            </div>
          </div>

          <div className="text-center mt-10">
            <a href="/register" className="btn btn-primary">Empieza ahora</a>
          </div>
        </div>
      </section>
    </>
  )
}
