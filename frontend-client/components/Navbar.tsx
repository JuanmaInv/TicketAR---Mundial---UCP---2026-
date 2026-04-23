import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tighter text-slate-900">
            Ticket<span className="text-[var(--usa-blue)]">AR</span>
            <span className="ml-2 text-xs font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[var(--canada-red)] via-[var(--usa-blue)] to-[var(--mexico-green)]">
              MUNDIAL 2026
            </span>
          </span>
        </Link>
        
        <div className="hidden items-center gap-8 md:flex">
          <Link href="/" className="text-sm font-bold text-slate-600 transition-colors hover:text-[var(--usa-blue)]">
            Inicio
          </Link>
          <Link href="/matches" className="text-sm font-bold text-slate-600 transition-colors hover:text-[var(--usa-blue)]">
            Partidos
          </Link>
          <Link href="/about" className="text-sm font-bold text-slate-600 transition-colors hover:text-[var(--usa-blue)]">
            Sobre Nosotros
          </Link>
          <Link href="/my-tickets" className="text-sm font-bold text-slate-600 transition-colors hover:text-[var(--usa-blue)]">
            Mis Entradas
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="rounded-full bg-[var(--usa-blue)] px-5 py-2 text-sm font-black uppercase tracking-wider text-white transition-all hover:bg-blue-800 hover:shadow-[0_0_15px_rgba(0,43,127,0.3)]">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </nav>
  );
}
