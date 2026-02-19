// ─────────────────────────────────────────────────────────────
// Infrastructure: SendGridEmailSender
// LSP: Implementa completamente el contrato EmailSender.
// OCP: Agregar otro proveedor (SES, Resend) no modifica este archivo.
// SRP: Solo sabe enviar correos con SendGrid.
// ─────────────────────────────────────────────────────────────

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';


import { EmailSender, EmailPayload } from '../../domain/ports/EmailSender';

@Injectable()
export class SendGridEmailSender implements EmailSender, OnModuleInit {
  private readonly logger   = new Logger(SendGridEmailSender.name);
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.fromEmail = this.configService.get<string>(
      'SENDGRID_FROM_EMAIL',
      'no-reply@tuapp.com',
    );
  }

  onModuleInit() {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY no está configurada en las variables de entorno.');
    }
    sgMail.setApiKey(apiKey);
    this.logger.log('SendGrid inicializado correctamente.');
  }

  async send(payload: EmailPayload): Promise<void> {
    const msg = {
      to:      payload.to,
      from:    this.fromEmail,
      subject: payload.subject,
      html:    payload.html,
    };

    await sgMail.send(msg);
    this.logger.log(`Correo enviado a ${payload.to} | Asunto: "${payload.subject}"`);
  }
}
