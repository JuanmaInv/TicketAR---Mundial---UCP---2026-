'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  esRolAdmin,
  formatPrice,
  getEstadisticasAdmin,
  getUsuario,
} from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function StatsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<Awaited<
    ReturnType<typeof getEstadisticasAdmin>
  > | null>(null);

  useEffect(() => {
    async function cargar() {
      if (!isLoaded) return;
      if (!user?.emailAddresses[0]?.emailAddress) {
        router.push('/login');
        return;
      }

      try {
        const email = user.emailAddresses[0].emailAddress;
        const perfil = await getUsuario(email, {
          userId: user.id,
          userEmail: email,
        });
        if (!esRolAdmin(perfil?.rol)) {
          router.push('/matches');
          return;
        }

        const stats = await getEstadisticasAdmin({
          userId: user.id,
          userEmail: email,
        });
        setData(stats);
      } catch (e) {
        const mensaje =
          e instanceof Error
            ? e.message
            : 'No se pudieron cargar las estadisticas.';
        if (mensaje.includes('403') || mensaje.toLowerCase().includes('acceso denegado')) {
          setError('No tienes permisos de administrador para ver esta seccion.');
        } else {
          setError(mensaje);
        }
      } finally {
        setCargando(false);
      }
    }
    void cargar();
  }, [isLoaded, router, user]);

  if (cargando) {
    return (
      <main className="min-h-screen bg-background p-6 text-foreground">
        <p className="text-sm font-black uppercase tracking-wider">
          Cargando estadisticas...
        </p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-background p-6 text-foreground">
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm font-bold text-red-500">
          {error || 'No hay datos disponibles.'}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-6 text-foreground">
      <div className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-4xl font-black uppercase italic">Panel Admin</h1>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-black uppercase text-muted-foreground">
              Ingresos Totales
            </p>
            <p className="mt-2 text-3xl font-black text-emerald-500">
              {formatPrice(data.ingresosTotales)}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-black uppercase text-muted-foreground">
              Entradas Vendidas
            </p>
            <p className="mt-2 text-3xl font-black">{data.entradasVendidas}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-black uppercase text-muted-foreground">
              Entradas Pendientes
            </p>
            <p className="mt-2 text-3xl font-black">{data.entradasPendientes}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-xl font-black uppercase mb-4">Ganancia por Partido</h2>
          <div className="space-y-3">
            {data.ventasPorPartido.length === 0 ? (
              <p className="text-sm font-bold text-muted-foreground">
                Todavia no hay ventas pagadas.
              </p>
            ) : (
              data.ventasPorPartido.map((item) => (
                <div
                  key={item.partido}
                  className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
                >
                  <div>
                    <p className="font-black">{item.partido}</p>
                    <p className="text-xs text-muted-foreground">
                      Entradas vendidas: {item.entradasVendidas}
                    </p>
                  </div>
                  <p className="font-black text-emerald-500">
                    {formatPrice(item.ingresos)}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
