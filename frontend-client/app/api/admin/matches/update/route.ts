import { NextRequest, NextResponse } from 'next/server';
import { construirBackendUrl, validarIdSeguro } from '../../../_lib/backend';

type AuthHeaders = {
  userId: string;
  userEmail: string;
};

type ActualizarPartidoPayload = {
  equipoLocal?: string;
  equipoVisitante?: string;
  fechaPartido?: string;
  nombreEstadio?: string;
  fase?: string;
  estado?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      partidoId?: string;
      payload?: ActualizarPartidoPayload;
      auth?: AuthHeaders;
    };

    const partidoIdSeguro = validarIdSeguro(
      body.partidoId ?? '',
      'identificador de partido',
    );

    const respuesta = await fetch(construirBackendUrl(['partidos', partidoIdSeguro]), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': body.auth?.userId ?? '',
        'x-user-email': body.auth?.userEmail ?? '',
      },
      body: JSON.stringify(body.payload ?? {}),
    });
    const data = await respuesta.json();

    return NextResponse.json(data, { status: respuesta.status });
  } catch (error) {
    const mensaje =
      error instanceof Error
        ? error.message
        : 'No pudimos actualizar el partido.';
    return NextResponse.json({ message: mensaje }, { status: 400 });
  }
}
