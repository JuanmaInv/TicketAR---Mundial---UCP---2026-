import { Injectable, Logger } from '@nestjs/common';
import * as QRCode from 'qrcode';

/**
 * Servicio de generación de códigos QR.
 *
 * Responsabilidad única: convertir cualquier string (en nuestro caso un UUID de
 * entrada) en una imagen QR codificada en Base64.
 *
 * El QR NO contiene datos personales del usuario. Solo contiene el UUID de la
 * entrada, que es el identificador único en la base de datos. La validación de
 * identidad se realiza en la puerta del estadio presentando el pasaporte físico.
 */
@Injectable()
export class QrService {
  private readonly logger = new Logger(QrService.name);

  /**
   * Genera el código QR de una entrada y lo devuelve como string Base64.
   * El resultado puede usarse directamente como fuente de una etiqueta <img>:
   *   <img src="data:image/png;base64,..." />
   *
   * @param ticketId - UUID único de la entrada (lo que el escáner leerá en la puerta).
   * @returns String Base64 de la imagen PNG del QR.
   */
  async generarQrBase64(ticketId: string): Promise<string> {
    this.logger.log(`Generando QR para el ticket: ${ticketId}`);

    // La librería qrcode genera la imagen directamente en formato Data URL Base64
    const dataUrl = await QRCode.toDataURL(ticketId, {
      errorCorrectionLevel: 'H', // Alta tolerancia a errores, ideal para ambientes con poca luz
      margin: 2,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return dataUrl;
  }
}
