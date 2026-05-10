export default function AboutPage() {
  const teamMembers = [
    { name: "Juan Martín", role: "Project Manager", accent: "hover:shadow-[0_0_50px_rgba(16,185,129,0.7)] hover:border-emerald-500" },
    { name: "Julián", role: "Analista del Frontend", accent: "hover:shadow-[0_0_50px_rgba(168,85,247,0.7)] hover:border-purple-500" },
    { name: "Adolfo", role: "Desarrollador Frontend", accent: "hover:shadow-[0_0_50px_rgba(59,130,246,0.7)] hover:border-blue-500" },
    { name: "Damian", role: "Frontend Tester", accent: "hover:shadow-[0_0_50px_rgba(6,182,212,0.7)] hover:border-cyan-500" },
    { name: "Santiago", role: "Backend - Base De Datos", accent: "hover:shadow-[0_0_50px_rgba(239,68,68,0.7)] hover:border-red-500" },
    { name: "Erwin", role: "Desarrollador del Backend", accent: "hover:shadow-[0_0_50px_rgba(249,115,22,0.7)] hover:border-orange-500" },
    { name: "Sosa", role: "Analista del Backend", accent: "hover:shadow-[0_0_50px_rgba(234,179,8,0.7)] hover:border-yellow-500" },
    { name: "Valentino", role: "Backend Tester ", accent: "hover:shadow-[0_0_50px_rgba(236,72,153,0.7)] hover:border-pink-500" }
  ];

  return (
    <main className="min-h-screen py-20 px-4 bg-background text-foreground transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20 text-center">
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
            <span className="text-foreground transition-colors duration-500">
              El Equipo Detrás de la
            </span>
            <br/>
            <span className="text-blue-600 dark:text-blue-400">Magia</span>
          </h1>
          <div className="w-24 h-2 bg-blue-600 dark:bg-blue-500 mx-auto mt-8 rounded-full shadow-[0_10px_20px_rgba(59,130,246,0.4)]"></div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member) => (
            <article 
              key={member.name}
              className="group relative p-10 rounded-[3rem] bg-card border border-slate-200 dark:border-white/5 transition-all duration-500 hover:-translate-y-3 shadow-2xl dark:shadow-none"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 mb-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-5xl border border-slate-100 dark:border-white/5 shadow-inner group-hover:scale-110 duration-500">
                  👨‍💻
                </div>
                <h2 className="text-2xl font-black italic text-foreground mb-2 tracking-tighter uppercase transition-colors">
                  {member.name}
                </h2>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">
                  {member.role}
                </p>
              </div>
              <div className={`absolute inset-0 rounded-[3rem] border-2 border-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${member.accent.split(' ').filter(c => c.startsWith('hover:border')).map(c => c.replace('hover:', '')).join(' ')}`}></div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
