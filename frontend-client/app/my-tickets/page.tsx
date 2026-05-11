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
  const [filtroEstado, setFiltroEstado] = useState<'TODAS' | 'PAGADAS' | 'RESERVADAS' | 'CANCELADAS'>('TODAS');

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

  const conteoPagadas = entradas.filter((e) => {
    const estado = String(e.estado ?? '').trim().toUpperCase();
    return estado === 'PAGADO' || estado === 'VENDIDO';
  }).length;
  const conteoReservadas = entradas.filter((e) => String(e.estado ?? '').trim().toUpperCase() === 'RESERVADO').length;
  const conteoCanceladas = entradas.filter((e) => String(e.estado ?? '').trim().toUpperCase() === 'CANCELADO').length;

  const entradasFiltradas = entradas.filter((entrada) => {
    const estado = String(entrada.estado ?? '').trim().toUpperCase();
    if (filtroEstado === 'PAGADAS') return estado === 'PAGADO' || estado === 'VENDIDO';
    if (filtroEstado === 'RESERVADAS') return estado === 'RESERVADO';
    if (filtroEstado === 'CANCELADAS') return estado === 'CANCELADO';
    return true;
  });

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

        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { key: 'TODAS', label: `Todas (${entradas.length})` },
            { key: 'PAGADAS', label: `Pagadas (${conteoPagadas})` },
            { key: 'RESERVADAS', label: `Reservadas (${conteoReservadas})` },
            { key: 'CANCELADAS', label: `Canceladas (${conteoCanceladas})` },
          ].map((opcion) => (
            <button
              key={opcion.key}
              type="button"
              onClick={() => {
                setFiltroEstado(opcion.key as 'TODAS' | 'PAGADAS' | 'RESERVADAS' | 'CANCELADAS');
              }}
              className={`rounded-xl border px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-colors ${
                filtroEstado === opcion.key
                  ? 'border-blue-500 bg-blue-600 text-white'
                  : 'border-border bg-card text-foreground hover:border-blue-400'
              }`}
            >
              {opcion.label}
            </button>
          ))}
        </div>

        {entradasFiltradas.length === 0 ? (
          <div className="bg-card border border-border rounded-[2.5rem] p-12 text-center shadow-xl">
            <div className="text-6xl mb-6">T</div>
            <h2 className="text-2xl font-black text-foreground mb-4 italic uppercase tracking-tight">
              {entradas.length === 0 ? 'Tu billetera esta vacia' : 'No hay entradas para este filtro'}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto font-medium">
              {entradas.length === 0
                ? 'No tienes reservas activas. El Mundial te espera, no te quedes afuera.'
                : 'Cambia el filtro para ver entradas en otro estado.'}
            </p>
            <Link href="/matches" className="inline-block bg-blue-600 text-white px-10 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20">
              Buscar Partidos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {entradasFiltradas.map((entrada) => (
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
      const ventana = window.open('', '_blank', 'noopener,noreferrer');
      if (!ventana) {
        throw new Error('No pudimos abrir la ventana para descargar el PDF.');
      }
      const ventanaSegura = ventana;
      const doc = ventanaSegura.document;
      doc.title = 'Entrada TicketAR';
      doc.body.innerHTML = '';

      const body = doc.body;
      body.style.fontFamily = 'Arial, sans-serif';
      body.style.margin = '0';
      body.style.background = '#0f172a';

      const ticket = doc.createElement('div');
      ticket.style.width = '860px';
      ticket.style.margin = '24px auto';
      ticket.style.background = '#ffffff';
      ticket.style.borderRadius = '20px';
      ticket.style.overflow = 'hidden';
      ticket.style.border = '2px solid #1d4ed8';

      const head = doc.createElement('div');
      head.style.background = 'linear-gradient(135deg,#1d4ed8,#0f766e)';
      head.style.color = '#fff';
      head.style.padding = '24px';
      const title = doc.createElement('h1');
      title.textContent = 'TicketAR';
      title.style.fontSize = '32px';
      title.style.fontWeight = '900';
      title.style.margin = '0';
      const subtitle = doc.createElement('div');
      subtitle.textContent = 'Entrada oficial Mundial 2026';
      subtitle.style.marginTop = '8px';
      subtitle.style.fontSize = '14px';
      head.appendChild(title);
      head.appendChild(subtitle);

      const content = doc.createElement('div');
      content.style.display = 'flex';
      content.style.gap = '24px';
      content.style.padding = '24px';

      const left = doc.createElement('div');
      left.style.flex = '1';
      const right = doc.createElement('div');
      right.style.width = '250px';
      right.style.textAlign = 'center';
      right.style.borderLeft = '1px dashed #94a3b8';
      right.style.paddingLeft = '20px';

      const agregarFila = (label: string, value: string): void => {
        const l = doc.createElement('div');
        l.textContent = label;
        l.style.fontSize = '11px';
        l.style.fontWeight = '700';
        l.style.color = '#475569';
        l.style.textTransform = 'uppercase';
        l.style.marginTop = '14px';
        l.style.letterSpacing = '.08em';
        const v = doc.createElement('div');
        v.textContent = value;
        v.style.fontSize = '16px';
        v.style.fontWeight = '800';
        v.style.marginTop = '4px';
        v.style.color = '#0f172a';
        left.appendChild(l);
        left.appendChild(v);
      };

      agregarFila('ID de entrada', entrada.id);
      agregarFila('Estado', estadoNormalizado);
      agregarFila('Partido', tituloPartido);
      agregarFila('Fecha', fechaPartido);
      agregarFila('Estadio', estadio);
      agregarFila('Sector', nombreSector);
      agregarFila('Cantidad', String(cantidad));
      agregarFila('Precio unitario', precioUnitarioTexto);
      agregarFila('Total abonado', totalTexto);
      agregarFila('Titular', dniUsuario ? `DNI ${dniUsuario}` : 'DNI no disponible');

      const badge = doc.createElement('div');
      badge.textContent = 'Ticket valido';
      badge.style.display = 'inline-block';
      badge.style.marginTop = '12px';
      badge.style.padding = '6px 10px';
      badge.style.borderRadius = '999px';
      badge.style.background = '#dcfce7';
      badge.style.color = '#166534';
      badge.style.fontSize = '11px';
      badge.style.fontWeight = '900';
      badge.style.letterSpacing = '.08em';

      const qrImage = doc.createElement('img');
      qrImage.src = qrData;
      qrImage.alt = 'QR de entrada';
      qrImage.style.width = '220px';
      qrImage.style.height = '220px';
      qrImage.style.background = '#fff';
      qrImage.style.border = '1px solid #cbd5e1';
      qrImage.style.borderRadius = '12px';
      qrImage.style.padding = '8px';
      qrImage.style.boxSizing = 'border-box';

      right.appendChild(badge);
      right.appendChild(qrImage);
      content.appendChild(left);
      content.appendChild(right);

      const foot = doc.createElement('div');
      foot.textContent = 'Presentar este codigo QR al ingresar al estadio.';
      foot.style.padding = '16px 24px 24px';
      foot.style.fontSize = '12px';
      foot.style.color = '#334155';

      ticket.appendChild(head);
      ticket.appendChild(content);
      ticket.appendChild(foot);
      body.appendChild(ticket);

      const dispararImpresion = (): void => {
        ventanaSegura.focus();
        ventanaSegura.print();
      };
      window.setTimeout(dispararImpresion, 150);
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
