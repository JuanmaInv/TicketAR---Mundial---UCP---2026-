'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import {
  esRolAdmin,
  getTickets,
  getUsuario,
  getTicketQr,
  getSectores,
  getSectoresDeTodosLosPartidos,
  getPartidos,
  pagarTicket,
  Sector,
} from '@/lib/api';
import WorldCupLoader from '@/components/WorldCupLoader';
import { Partido, Ticket } from '@/types/ticket';

type EntradaApi = Ticket & {
  idUsuario?: string;
  id_usuario?: string;
  idSector?: string;
  id_sector?: string;
  idPartido?: string;
  id_partido?: string;
  cantidad?: number;
  precioUnitario?: number;
  precio_unitario?: number;
  precioTotal?: number;
  precio_total?: number;
};

function escapeHtml(valor: string): string {
  return valor
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function redirigirPagoSeguro(urlPago: string): boolean {
  try {
    const url = new URL(urlPago, window.location.origin);
    const protocoloValido = url.protocol === 'https:' || url.protocol === 'http:';
    if (!protocoloValido) return false;
    window.location.assign(url.toString());
    return true;
  } catch {
    return false;
  }
}

export default function MyTicketsPage() {
  const { user, isLoaded } = useUser();
  const [entradas, setEntradas] = useState<EntradaApi[]>([]);
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [dniUsuario, setDniUsuario] = useState<string>('');
  const [nombresSectorPorClave, setNombresSectorPorClave] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState('');
  const [esAdmin, setEsAdmin] = useState(false);

  const cargarDatos = useCallback(async () => {
    if (!user?.emailAddresses[0]?.emailAddress) return;

    try {
      setMensajeEstado('');
      const [datosUsuario, entradasApi, sectoresApi, partidosApi, sectoresPorPartidoApi] = await Promise.all([
        getUsuario(user.emailAddresses[0].emailAddress, {
          userId: user.id,
          userEmail: user.emailAddresses[0].emailAddress,
        }),
        getTickets(),
        getSectores(),
        getPartidos(),
        getSectoresDeTodosLosPartidos(),
      ]);

      if (datosUsuario?.id) {
        if (esRolAdmin(datosUsuario.rol)) {
          setEsAdmin(true);
          setEntradas([]);
          return;
        }

        setDniUsuario(datosUsuario.numeroPasaporte ?? '');
        setSectores(sectoresApi);
        setPartidos(partidosApi);
        const mapaNombres: Record<string, string> = {};
        sectoresPorPartidoApi.forEach((item) => {
          item.sectores.forEach((sector) => {
            mapaNombres[`${item.idPartido}:real:${sector.idSector}`] = sector.nombre;
            mapaNombres[`${item.idPartido}:partidoSector:${sector.id}`] = sector.nombre;
          });
        });
        setNombresSectorPorClave(mapaNombres);

        const misEntradas = (entradasApi as EntradaApi[]).filter((entrada) => {
          const esDelUsuario =
            entrada.idUsuario === datosUsuario.id ||
            entrada.id_usuario === datosUsuario.id;
          const estadoNormalizado = String(entrada.estado ?? '').trim().toUpperCase();
          const estadoVisible =
            estadoNormalizado === 'PAGADO' ||
            estadoNormalizado === 'VENDIDO' ||
            estadoNormalizado === 'RESERVADO' ||
            estadoNormalizado === 'CANCELADO';

          return esDelUsuario && estadoVisible;
        });
        setEntradas(misEntradas);
      }
    } catch {
      setEntradas([]);
      throw new Error('No pudimos actualizar tus entradas. Intenta nuevamente.');
    } finally {
      setCargando(false);
    }
  }, [user]);

  async function actualizarLista() {
    setActualizando(true);
    setMensajeEstado('');
    try {
      await cargarDatos();
      setMensajeEstado('Lista actualizada correctamente.');
    } catch (error) {
      setMensajeEstado(
        error instanceof Error
          ? error.message
          : 'No pudimos actualizar tus entradas. Intenta nuevamente.',
      );
    } finally {
      setActualizando(false);
    }
  }

  useEffect(() => {
    if (isLoaded) {
      if (user) {
        void cargarDatos();
      } else {
        setCargando(false);
      }
    }
  }, [isLoaded, user, cargarDatos]);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <WorldCupLoader />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <h1 className="text-3xl font-black uppercase italic mb-4 text-foreground">Inicia sesion para ver tus entradas</h1>
        <Link href="/login" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">Ir al Login</Link>
      </div>
    );
  }

  if (esAdmin) {
    return (
      <main className="min-h-screen py-12 px-4 bg-background text-foreground">
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-10 text-center">
          <h1 className="text-3xl font-black uppercase italic mb-3">Panel de Administrador</h1>
          <p className="text-muted-foreground font-bold mb-6">
            Esta cuenta administra partidos y no tiene entradas de compra.
          </p>
          <Link
            href="/stats"
            className="inline-block rounded-xl bg-blue-600 px-8 py-4 text-xs font-black uppercase tracking-widest text-white"
          >
            Ir a Estadisticas
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-10 md:py-20 px-3 md:px-4 bg-background transition-colors duration-500">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 md:mb-12 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase text-foreground mb-2">
              Mis <span className="text-blue-500">Entradas</span>
            </h1>
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Acreditaciones oficiales FIFA 2026</p>
          </div>
          <button
            type="button"
            onClick={() => {
              void actualizarLista();
            }}
            disabled={actualizando}
            className="text-blue-500 disabled:text-muted-foreground text-[10px] font-black uppercase tracking-widest hover:text-foreground transition-colors disabled:cursor-not-allowed"
          >
            {actualizando ? 'Actualizando...' : 'Actualizar Lista'}
          </button>
        </header>
        {mensajeEstado && (
          <div className="mb-6 rounded-xl border border-border bg-card p-3 text-xs font-bold text-foreground">
            {mensajeEstado}
          </div>
        )}

        {entradas.length === 0 ? (
          <div className="bg-card border border-border rounded-[2.5rem] p-12 text-center shadow-xl">
            <div className="text-6xl mb-6">T</div>
            <h2 className="text-2xl font-black text-foreground mb-4 italic uppercase tracking-tight">Tu billetera esta vacia</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto font-medium">
              No tienes reservas activas. El Mundial te espera, no te quedes afuera.
            </p>
            <Link href="/matches" className="inline-block bg-blue-600 text-white px-10 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20">
              Buscar Partidos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {entradas.map((entrada) => (
              <TicketCard
                key={entrada.id}
                entrada={entrada}
                sectores={sectores}
                partidos={partidos}
                dniUsuario={dniUsuario}
                nombresSectorPorClave={nombresSectorPorClave}
                alActualizar={cargarDatos}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function TicketCard({
  entrada,
  sectores,
  partidos,
  dniUsuario,
  nombresSectorPorClave,
  alActualizar,
}: {
  entrada: EntradaApi;
  sectores: Sector[];
  partidos: Partido[];
  dniUsuario: string;
  nombresSectorPorClave: Record<string, string>;
  alActualizar: () => Promise<void>;
}) {
  const [qr, setQr] = useState<string | null>(null);
  const [verQr, setVerQr] = useState(false);
  const [pagando, setPagando] = useState(false);
  const [descargandoPdf, setDescargandoPdf] = useState(false);
  const [mensajeAccion, setMensajeAccion] = useState('');

  const cantidad = entrada.cantidad ?? 1;
  const totalPagado = entrada.precioTotal ?? entrada.precio_total;

  const idSectorEntrada = entrada.idSector || entrada.id_sector || '';
  const idPartidoEntrada = entrada.idPartido || entrada.id_partido || '';
  const sector = sectores.find((s) => s.id === idSectorEntrada);
  const partido = partidos.find((p) => p.id === (entrada.idPartido || entrada.id_partido));
  const nombreSector =
    sector?.nombre ||
    nombresSectorPorClave[`${idPartidoEntrada}:real:${idSectorEntrada}`] ||
    nombresSectorPorClave[`${idPartidoEntrada}:partidoSector:${idSectorEntrada}`] ||
    'Sector no identificado';
  const precioUnitario = entrada.precioUnitario ?? entrada.precio_unitario;
  const estadoNormalizado = String(entrada.estado ?? '').trim().toUpperCase();
  const esPagado = estadoNormalizado === 'PAGADO' || estadoNormalizado === 'VENDIDO';
  const esReservado = estadoNormalizado === 'RESERVADO';
  const esCancelado = estadoNormalizado === 'CANCELADO';

  async function pagarEntrada() {
    setPagando(true);
    setMensajeAccion('');
    try {
      const respuesta = await pagarTicket(entrada.id);

      if (respuesta.resultadoPago?.paymentUrl) {
        const redireccionExitosa = redirigirPagoSeguro(respuesta.resultadoPago.paymentUrl);
        if (!redireccionExitosa) {
          throw new Error('El enlace de pago recibido no es valido.');
        }
        return;
      }

      setMensajeAccion('Pago procesado con exito. Tu entrada ahora es valida.');
      void alActualizar();
    } catch {
      setMensajeAccion('No pudimos procesar el pago. Intenta nuevamente o proba otro medio de pago.');
    } finally {
      setPagando(false);
    }
  }

  async function descargarPdf() {
    if (!esPagado) return;

    setDescargandoPdf(true);
    setMensajeAccion('');
    try {
      const qrData = await getTicketQr(entrada.id);
      const tituloPartido = partido
        ? `${partido.equipo_local} vs ${partido.equipo_visitante}`
        : 'Partido no disponible';
      const fechaPartido = partido?.fecha_partido
        ? new Date(partido.fecha_partido).toLocaleString('es-AR')
        : 'Fecha no disponible';
      const estadio = partido?.nombre_estadio ?? 'Estadio no disponible';
      const precioUnitarioTexto =
        typeof precioUnitario === 'number'
          ? `ARS $${precioUnitario.toLocaleString()}`
          : 'No disponible';
      const totalTexto =
        typeof totalPagado === 'number'
          ? `ARS $${totalPagado.toLocaleString()}`
          : 'No disponible';
      const nombreSectorSeguro = escapeHtml(nombreSector);

      const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Entrada ${entrada.id}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; background: #0f172a; color: #0f172a; }
    .ticket { width: 860px; margin: 24px auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 2px solid #1d4ed8; }
    .head { background: linear-gradient(135deg,#1d4ed8,#0f766e); color: #fff; padding: 24px; }
    .title { font-size: 32px; font-weight: 900; margin: 0; letter-spacing: 1px; }
    .sub { margin-top: 8px; font-size: 14px; opacity: .95; }
    .content { display: flex; gap: 24px; padding: 24px; }
    .left { flex: 1; }
    .right { width: 250px; text-align: center; border-left: 1px dashed #94a3b8; padding-left: 20px; }
    .label { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; margin-top: 14px; letter-spacing: .08em; }
    .value { font-size: 16px; font-weight: 800; margin-top: 4px; color: #0f172a; }
    .badge { display:inline-block; margin-top: 12px; padding: 6px 10px; border-radius: 999px; background:#dcfce7; color:#166534; font-size:11px; font-weight:900; letter-spacing:.08em; }
    .foot { padding: 16px 24px 24px; font-size: 12px; color: #334155; }
    .qr { width: 220px; height: 220px; background:#fff; border:1px solid #cbd5e1; border-radius: 12px; padding: 8px; box-sizing: border-box; }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="head">
      <h1 class="title">TicketAR</h1>
      <div class="sub">Entrada oficial Mundial 2026</div>
    </div>
    <div class="content">
      <div class="left">
        <div class="label">ID de entrada</div><div class="value">${escapeHtml(entrada.id)}</div>
        <div class="label">Estado</div><div class="value">${escapeHtml(estadoNormalizado)}</div>
        <div class="label">Partido</div><div class="value">${escapeHtml(tituloPartido)}</div>
        <div class="label">Fecha</div><div class="value">${escapeHtml(fechaPartido)}</div>
        <div class="label">Estadio</div><div class="value">${escapeHtml(estadio)}</div>
        <div class="label">Sector</div><div class="value">${nombreSectorSeguro}</div>
        <div class="label">Cantidad</div><div class="value">${cantidad}</div>
        <div class="label">Precio unitario</div><div class="value">${escapeHtml(precioUnitarioTexto)}</div>
        <div class="label">Total abonado</div><div class="value">${escapeHtml(totalTexto)}</div>
        <div class="label">Titular</div><div class="value">${escapeHtml(dniUsuario ? `DNI ${dniUsuario}` : 'DNI no disponible')}</div>
      </div>
      <div class="right">
        <div class="badge">Ticket valido</div>
        <img class="qr" src="${qrData}" alt="QR de entrada" />
      </div>
    </div>
    <div class="foot">
      Presentar este codigo QR al ingresar al estadio.
    </div>
  </div>
</body>
</html>`;

      const ventana = window.open('', '_blank');
      if (!ventana) {
        throw new Error('No pudimos abrir la ventana para descargar el PDF.');
      }
      ventana.document.open();
      ventana.document.write(html);
      ventana.document.close();
      ventana.focus();
      ventana.print();
      setMensajeAccion('PDF generado. Guarda el archivo desde el dialogo de impresion.');
    } catch {
      setMensajeAccion('No pudimos generar el PDF de la entrada. Intenta nuevamente.');
    } finally {
      setDescargandoPdf(false);
    }
  }

  const cargarQr = async () => {
    if (esPagado) {
      try {
        const dataUrl = await getTicketQr(entrada.id);
        setQr(dataUrl);
        setVerQr(true);
      } catch {
        setMensajeAccion('No pudimos generar el QR. Contacta a soporte si el problema continua.');
      }
    } else {
      setMensajeAccion('Esta entrada todavia no fue abonada. Completa el pago para ver tu QR.');
    }
  };

  return (
    <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row relative group hover:border-blue-600/30 transition-all duration-500 shadow-lg">
      <div
        className={`absolute top-0 left-0 w-full h-1 ${
          esPagado
            ? 'bg-emerald-500'
            : esCancelado
              ? 'bg-red-500'
              : 'bg-amber-500'
        }`}
      />

      <div className="p-8 flex-1 border-b md:border-b-0 md:border-r border-border">
        <div className="flex justify-between items-start mb-8">
          <div className="flex flex-col gap-1">
            <span
              className={`w-fit px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${
                esPagado
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : esCancelado
                    ? 'bg-red-500/10 text-red-500'
                    : 'bg-amber-500/10 text-amber-500'
              }`}
            >
              {estadoNormalizado}
            </span>
          </div>
          <span className="text-muted-foreground text-[10px] font-mono tracking-widest uppercase">
            ENTRADA #{entrada.id.substring(0, 8)}
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-8">
          <div className="flex-1">
            <h3 className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1 opacity-50">Partido</h3>
            <p className="text-xl font-black text-foreground italic uppercase leading-none">
              {partido ? `${partido.equipo_local} VS ${partido.equipo_visitante}` : 'Cargando encuentro...'}
            </p>
            <p className="text-muted-foreground text-xs font-bold mt-2 uppercase tracking-tighter italic">
              {partido ? partido.nombre_estadio : 'Estadio Oficial'}
            </p>
          </div>

          <div className="flex-1">
            <h3 className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1 opacity-50">Ubicacion</h3>
            <p className="text-xl font-black text-blue-500 italic uppercase leading-none">
              {nombreSector}
            </p>
            {typeof precioUnitario === 'number' ? (
              <p className="text-foreground/60 text-xs font-bold mt-2 uppercase tracking-tighter">
                Precio unitario: ARS ${precioUnitario.toLocaleString()}
              </p>
            ) : typeof totalPagado === 'number' ? (
              <p className="text-foreground/60 text-xs font-bold mt-2 uppercase tracking-tighter">
                Total abonado: ARS ${totalPagado.toLocaleString()}
              </p>
            ) : (
              <p className="text-foreground/60 text-xs font-bold mt-2 uppercase tracking-tighter">
                Precio no disponible
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
          <div>
            <p className="text-muted-foreground text-[9px] font-black uppercase tracking-widest">Titular de Cuenta</p>
            <p className="text-foreground text-xs font-bold italic">Acceso validado via DNI</p>
            {dniUsuario && (
              <p className="text-foreground/70 text-[11px] font-black uppercase tracking-wider mt-1">
                DNI: {dniUsuario}
              </p>
            )}
            <p className="text-foreground/70 text-[11px] font-black uppercase tracking-wider mt-2">Cantidad: {cantidad}</p>
            {typeof precioUnitario === 'number' && (
              <p className="text-foreground/70 text-[11px] font-black uppercase tracking-wider mt-1">
                Precio unitario: ARS ${precioUnitario.toLocaleString()}
              </p>
            )}
            {typeof totalPagado === 'number' && (
              <p className="text-foreground/70 text-[11px] font-black uppercase tracking-wider mt-1">
                Total abonado: ARS ${totalPagado.toLocaleString()}
              </p>
            )}
          </div>

          {esReservado && (
            <button
              type="button"
              onClick={() => {
                void pagarEntrada();
              }}
              disabled={pagando}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 animate-pulse"
            >
              {pagando ? 'PROCESANDO...' : 'CONTINUAR PAGO'}
            </button>
          )}
          {esPagado && (
            <button
              type="button"
              onClick={() => {
                void descargarPdf();
              }}
              disabled={descargandoPdf}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {descargandoPdf ? 'GENERANDO PDF...' : 'DESCARGAR PDF'}
            </button>
          )}
        </div>
        {esReservado && (
          <p className="mt-2 text-xs font-bold text-amber-500">
            PDF disponible al completar el pago.
          </p>
        )}
        {esCancelado && (
          <p className="mt-2 text-xs font-bold text-red-500">
            Esta reserva fue cancelada o vencio.
          </p>
        )}

        {mensajeAccion && (
          <p className="mt-4 rounded-xl border border-border bg-background p-3 text-xs font-bold text-foreground">
            {mensajeAccion}
          </p>
        )}
      </div>

      <div className="p-6 md:p-10 bg-slate-100 dark:bg-black/40 flex flex-col items-center justify-center min-w-[220px] md:min-w-[280px] border-l border-border">
        {verQr && qr ? (
          <div className="bg-white p-3 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
            <Image src={qr} alt="QR Access" width={160} height={160} unoptimized />
            <p className="text-black text-[8px] font-black text-center mt-2 uppercase tracking-[0.3em]">Scannable at Gate</p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              void cargarQr();
            }}
            className="flex flex-col items-center gap-4 group"
          >
            <div
              className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all shadow-2xl ${
                esPagado
                  ? 'bg-blue-600 group-hover:bg-blue-500 group-hover:scale-110'
                  : 'bg-muted opacity-40 cursor-not-allowed'
              }`}
            >
              <span className="text-4xl">QR</span>
            </div>
            <div className="text-center">
              <span
                className={`text-[10px] font-black uppercase tracking-widest block transition-all ${
                  esPagado
                    ? 'text-muted-foreground group-hover:text-foreground'
                    : 'text-muted-foreground/60'
                }`}
              >
                {esPagado ? 'Ver Codigo QR' : 'Esperando Pago'}
              </span>
              {!esPagado && (
                <span className="text-[8px] text-muted-foreground/40 font-bold uppercase mt-1 block tracking-tighter">
                  Bloqueado por seguridad
                </span>
              )}
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
