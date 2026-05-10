import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-zinc-950 pt-12 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="flex flex-col gap-4">
            <span className="text-2xl font-bold tracking-tighter text-white">
              Ticket<span className="text-blue-500">AR</span>
            </span>
            <p className="text-sm text-zinc-400 max-w-xs leading-relaxed">
              Plataforma oficial de venta de entradas para la Copa Mundial de la FIFA 2026.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Navegacion</h3>
            <ul className="space-y-3">
              <li><Link href="/matches" className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors">Catalogo de Partidos</Link></li>
              <li><Link href="/about" className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors">Quienes Somos</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/terms" className="text-sm text-zinc-400 hover:text-blue-400 transition-colors">Terminos y Condiciones</Link></li>
              <li><Link href="#" className="text-sm text-zinc-400 hover:text-blue-400 transition-colors">Politica de Privacidad</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-500">&copy; {new Date().getFullYear()} TicketAR Mundial. Todos los derechos reservados.</p>
          <div className="flex gap-4"><span className="text-xs text-zinc-500 flex items-center gap-1">Desarrollado con <span className="text-blue-500">Next.js</span></span></div>
        </div>
      </div>
    </footer>
  );
}
