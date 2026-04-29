import Link from 'next/link';

export default function MyTicketsPage() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-12 px-4 bg-[var(--background)]">
      <div className="text-center max-w-lg space-y-6">
        <h1 className="text-5xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-white">
          Mis <span className="text-[var(--usa-blue)]">Entradas</span>
        </h1>

        <div className="bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-3xl p-10 shadow-lg mt-8 relative overflow-hidden">
          {/* Decoración Tricolor */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--canada-red)] via-[var(--usa-blue)] to-[var(--mexico-green)]"></div>

          <div className="w-24 h-24 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🎟️</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Aún no tenés tickets</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-8 font-medium">
            Comprá tus entradas oficiales para el Mundial 2026 y vivilo desde adentro.
          </p>

          <Link
            href="/matches"
            className="inline-block bg-[var(--usa-blue)] text-white font-black tracking-widest uppercase text-sm px-8 py-4 rounded-xl hover:bg-blue-800 hover:shadow-[0_0_15px_rgba(0,43,127,0.3)] transition-all"
          >
            Ver Partidos Disponibles
          </Link>
        </div>
      </div>
    </div>
  );
}
