// ─────────────────────────────────────────────────────────────
// Port: EmailSender
// DIP: el dominio define qué necesita ("enviar un correo"),
//      no cómo se hace (SendGrid, SES, Resend, etc.).
// ─────────────────────────────────────────────────────────────

export interface EmailPayload {
  to:      string;
  subject: string;
  html:    string;
}

export interface EmailSender {
  send(payload: EmailPayload): Promise<void>;
}

export const EMAIL_SENDER = 'EMAIL_SENDER';
