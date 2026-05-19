import nodemailer from "nodemailer";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const resend = resendApiKey ? new Resend(resendApiKey) : null;

interface TransactionalEmailInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendTransactionalEmail(payload: TransactionalEmailInput) {
  if (resend) {
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "NestMart <noreply@nestmart.local>",
      to: payload.to,
      subject: payload.subject,
      html: payload.html
    });
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? "noreply@nestmart.local",
    to: payload.to,
    subject: payload.subject,
    html: payload.html
  });
}
