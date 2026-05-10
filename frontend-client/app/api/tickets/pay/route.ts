import { NextRequest, NextResponse } from 'next/server';
import { construirBackendUrl, validarIdSeguro } from '../../_lib/backend';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { id?: string };
    const idSeguro = validarIdSeguro(body.id ?? '', 'identificador de entrada');

    const respuesta = await fetch(construirBackendUrl(['entradas', idSeguro, 'pagar']), {
      method: 'POST',
    });
    const data = await respuesta.json();

    return NextResponse.json(data, { status: respuesta.status });
  } catch (error) {
    const mensaje =
      error instanceof Error ? error.message : 'No pudimos procesar el pago.';
    return NextResponse.json({ message: mensaje }, { status: 400 });
  }
}
