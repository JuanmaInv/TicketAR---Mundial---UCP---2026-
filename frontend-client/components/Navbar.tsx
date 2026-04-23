import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

export default function Navbar() {
  return (
    <nav className="relative sticky top-0 z-50 w-full border-b border-slate-700 bg-slate-950 backdrop-blur-md shadow-sm overflow-hidden">
      {/* Diagonal flag composition for both modes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-y-0 left-0 w-[33.34%] overflow-hidden">
          <div className="absolute inset-0 -skew-x-12 -translate-x-[7%] bg-[linear-gradient(90deg,#006847_0%,#006847_34%,#ffffff_34%,#ffffff_66%,#ce1126_66%,#ce1126_100%)] opacity-80" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[11px] font-black text-slate-900/80">◉</div>
        </div>

        <div className="absolute inset-y-0 left-[33.33%] w-[33.34%] overflow-hidden">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(180deg,#b22234_0%,#b22234_7.7%,#ffffff_7.7%,#ffffff_15.4%)] opacity-82 [clip-path:polygon(6%_0,100%_0,94%_100%,0_100%)]" />
          <div className="absolute left-[9%] top-[8%] h-[54%] w-[34%] bg-[#3c3b6e]/92 [clip-path:polygon(10%_0,100%_0,90%_100%,0_100%)]" />
          <div className="absolute left-[12%] top-[14%] h-[40%] w-[28%] opacity-85 bg-[radial-gradient(circle,rgba(255,255,255,0.9)_1.2px,transparent_1.3px)] [background-size:9px_9px]" />
        </div>

        <div className="absolute inset-y-0 left-[66.66%] w-[33.34%] overflow-hidden">
          <div className="absolute inset-0 -skew-x-12 translate-x-[7%] bg-[linear-gradient(90deg,#d80621_0%,#d80621_32%,#ffffff_32%,#ffffff_68%,#d80621_68%,#d80621_100%)] opacity-80" />
          <svg
            viewBox="0 0 64 64"
            className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 text-[#d80621] drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M31.8 6.5l3.2 7.8 8-2.9-2 8.2h8.6l-6.5 5.5 6.2 4.9-8.1 2.2 3.7 8-7.7-2.4-1.8 11.8h-3.1l-1.9-11.8-7.7 2.4 3.7-8-8.1-2.2 6.2-4.9-6.5-5.5h8.6l-2-8.2 8 2.9 3.2-7.8z"
            />
          </svg>
        </div>

        {/* Contrast veil to keep nav text readable */}
        <div className="absolute inset-0 bg-slate-950/45" />
      </div>

      <div className="relative z-10 container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tighter text-slate-100">
            Ticket<span className="text-[var(--usa-blue)]">AR</span>
            <span className="ml-2 text-xs font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[var(--canada-red)] via-[var(--usa-blue)] to-[var(--mexico-green)]">
              MUNDIAL 2026
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link href="/" className="text-sm font-bold text-slate-100 transition-colors hover:text-white">
            Inicio
          </Link>
          <Link href="/matches" className="text-sm font-bold text-slate-100 transition-colors hover:text-white">
            Partidos
          </Link>
          <Link href="/about" className="text-sm font-bold text-slate-100 transition-colors hover:text-white">
            Sobre Nosotros
          </Link>
          <Link href="/my-tickets" className="text-sm font-bold text-slate-100 transition-colors hover:text-white">
            Mis Entradas
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login" className="rounded-full bg-[var(--usa-blue)] px-5 py-2 text-sm font-black uppercase tracking-wider text-white transition-all hover:bg-blue-800 hover:shadow-[0_0_15px_rgba(0,43,127,0.3)]">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </nav>
  );
}
