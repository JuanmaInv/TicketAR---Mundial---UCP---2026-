const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function obtenerBackendSeguro(): URL {
  const base = new URL(BACKEND_URL);
  const protocoloValido = base.protocol === 'http:' || base.protocol === 'https:';
  if (!protocoloValido || base.username || base.password) {
    throw new Error('Configuracion de backend invalida.');
  }
  return base;
}

const BASE_BACKEND_SEGURA = obtenerBackendSeguro();

export function construirBackendUrl(segmentos: string[]): string {
  const url = new URL(BASE_BACKEND_SEGURA.toString());
  const segmentosLimpios = segmentos.map((segmento) =>
    encodeURIComponent(segmento),
  );
  url.pathname = `/${segmentosLimpios.join('/')}`;
  url.search = '';
  return url.toString();
}

export function validarIdSeguro(id: string, nombre: string): string {
  const valor = id.trim();
  const patron = /^[a-zA-Z0-9_-]{1,80}$/;
  if (!patron.test(valor)) {
    throw new Error(`El ${nombre} no es valido.`);
  }
  return valor;
}
