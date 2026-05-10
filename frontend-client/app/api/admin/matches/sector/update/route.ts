import { NextRequest, NextResponse } from 'next/server';
import { construirBackendUrl, validarIdSeguro } from '../../../../_lib/backend';

type AuthHeaders = {
  userId: string;
  userEmail: string;
};

type ActualizarSectorPartidoPayload = {
  precio?: number;
  capacidadDisponible?: number;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      partidoId?: string;
      sectorId?: string;
      payload?: ActualizarSectorPartidoPayload;
      auth?: AuthHeaders;
    };

    const partidoIdSeguro = validarIdSeguro(
      body.partidoId ?? '',
      'identificador de partido',
    );
    const sectorIdSeguro = validarIdSeguro(
      body.sectorId ?? '',
      'identificador de sector',
    );

    const respuesta = await fetch(
      construirBackendUrl([
        'sectores',
        'partido',
        partidoIdSeguro,
        'sector',
        sectorIdSeguro,
      ]),
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': body.auth?.userId ?? '',
          'x-user-email': body.auth?.userEmail ?? '',
        },
        body: JSON.stringify(body.payload ?? {}),
      },
    );
    const data = await respuesta.json();

    return NextResponse.json(data, { status: respuesta.status });
  } catch (error) {
    const mensaje =
      error instanceof Error
        ? error.message
        : 'No pudimos actualizar el sector.';
    return NextResponse.json({ message: mensaje }, { status: 400 });
  }
}
