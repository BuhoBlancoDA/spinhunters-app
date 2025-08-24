// app/(marketing)/page.tsx
import type { Metadata } from 'next';

export const dynamic = 'force-static'; // evita cambios entre SSR/CSR
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'SpinHunters — Domina el póker',
  description:
    'Accede a tu membresía, contenido exclusivo y tu panel personal con la app oficial de SpinHunters.',
};

export default function Home() {
  // IMPORTANTE: nada de Date.now(), Math.random(), window/document aquí
  return (
    <section className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <h1 className="heading">
        Domina el póker con <span className="text-brand">SpinHunters</span>
      </h1>

      <p className="muted mt-4 max-w-2xl">
        Accede a tu membresía, contenido exclusivo y tu panel personal.
        Compatible con tu cuenta actual del ecosistema SpinHunters.
      </p>

      <div className="mt-8 flex gap-4">
        <a href="/(auth)/login" className="btn btn-primary">Acceder a mi cuenta</a>
        <a href="/(auth)/register" className="btn btn-ghost">Crear cuenta</a>
      </div>
    </section>
  );
}
