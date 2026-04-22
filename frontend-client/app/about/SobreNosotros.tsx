export default function AboutPage() {
  // Acá definimos a tu equipo. Fijate que cada uno tiene su color de acento para la animación
  const teamMembers = [
    { name: "Juan Martín", role: "Project Manager", accent: "group-hover:border-emerald-500/50 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]" },
    { name: "Julián", role: "Analista del Frontend", accent: "group-hover:border-purple-500/50 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]" },
    { name: "Adolfo", role: "Desarrollador Frontend", accent: "group-hover:border-blue-500/50 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]" }
  ];
  // 2. Renderizamos la parte visual (lo que el usuario ve)
  return (
    <main className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-24">
        
        {/* Cabecera de la página */}
        <header className="text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6">
            La Pasión Nos <span className="text-blue-500">Conecta</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
            Somos TicketAR, la plataforma oficial diseñada por y para fanáticos, garantizando tu lugar en la Copa del Mundo 2026.
          </p>
        </header>

        {/* Sección del Equipo con las Micro-animaciones */}
        <section>
          <h2 className="text-3xl font-bold text-center text-white mb-12 tracking-tight">
            El Equipo Detrás de la <span className="text-emerald-400">Magia</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <article 
                key={index}
                className={`group glass-panel rounded-2xl p-10 text-center transition-all duration-500 ease-out hover:-translate-y-2 ${member.accent}`}
              >
                {/* Avatar con efecto de escala */}
                <div className="w-24 h-24 mx-auto bg-zinc-900 rounded-full mb-6 border border-white/10 transition-transform duration-500 group-hover:scale-110 flex items-center justify-center text-4xl shadow-inner">
                  👨‍💻
                </div>
                
                {/* Nombre con gradiente dinámico */}
                <h3 className="text-2xl font-bold text-white mb-2 transition-colors duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-emerald-400">
                  {member.name}
                </h3>
                <p className="text-zinc-400 font-medium tracking-wide uppercase text-xs">
                  {member.role}
                </p>
              </article>
            ))}
          </div>
        </section>

      </div>
    </main>
  );

}