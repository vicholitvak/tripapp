/**
 * Email Service using SendGrid
 *
 * Handles sending transactional emails for:
 * - Order confirmations
 * - Payment notifications
 * - Payout notifications
 * - Review requests
 *
 * Setup:
 * 1. Install: npm install @sendgrid/mail
 * 2. Add env var: SENDGRID_API_KEY=your_key
 * 3. Verify sender email in SendGrid dashboard
 */

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface OrderConfirmationData {
  orderId: string;
  customerEmail: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  currency: string;
}

interface PayoutNotificationData {
  providerId: string;
  providerEmail: string;
  providerName: string;
  amount: number;
  currency: string;
  status: 'approved' | 'rejected' | 'processed';
}

export class EmailService {
  private static FROM_EMAIL = 'noreply@santurist.cl'; // TODO: Configure verified sender
  private static FROM_NAME = 'Santurist';

  /**
   * Send raw email using SendGrid
   * This is a server-side only operation
   */
  private static async sendEmail(data: EmailData): Promise<boolean> {
    try {
      // Check if we're in a server environment
      if (typeof window !== 'undefined') {
        console.error('EmailService can only be used server-side');
        return false;
      }

      const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

      if (!SENDGRID_API_KEY) {
        console.warn('SENDGRID_API_KEY not configured, email not sent');
        console.log('Would send email:', data);
        return false;
      }

      // Use fetch to call SendGrid API
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: data.to }],
            subject: data.subject,
          }],
          from: {
            email: this.FROM_EMAIL,
            name: this.FROM_NAME,
          },
          content: [
            {
              type: 'text/html',
              value: data.html,
            },
            ...(data.text ? [{
              type: 'text/plain',
              value: data.text,
            }] : []),
          ],
        }),
      });

      if (!response.ok) {
        console.error('SendGrid error:', await response.text());
        return false;
      }

      console.log(`Email sent successfully to ${data.to}`);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Send order confirmation email to customer
   */
  static async sendOrderConfirmation(data: OrderConfirmationData): Promise<boolean> {
    const itemsHtml = data.items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toLocaleString()} ${data.currency}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmación de Orden</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #ea580c;">¡Gracias por tu compra!</h1>

          <p>Hola ${data.customerName},</p>

          <p>Hemos recibido tu orden <strong>#${data.orderId.slice(0, 8)}</strong> y está siendo procesada.</p>

          <h2 style="color: #ea580c; margin-top: 30px;">Resumen de tu orden:</h2>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #ea580c;">Producto</th>
                <th style="padding: 12px 8px; text-align: center; border-bottom: 2px solid #ea580c;">Cantidad</th>
                <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #ea580c;">Precio</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 12px 8px; text-align: right; font-weight: bold;">Total:</td>
                <td style="padding: 12px 8px; text-align: right; font-weight: bold; color: #ea580c;">
                  $${data.total.toLocaleString()} ${data.currency}
                </td>
              </tr>
            </tfoot>
          </table>

          <p>Los proveedores han sido notificados y procesarán tu orden pronto.</p>

          <div style="margin-top: 30px; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b;">
            <p style="margin: 0;"><strong>¿Necesitas ayuda?</strong></p>
            <p style="margin: 5px 0 0 0;">Contáctanos en info@santurist.cl</p>
          </div>

          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Este es un correo automático, por favor no respondas directamente.
          </p>
        </div>
      </body>
      </html>
    `;

    const text = `
¡Gracias por tu compra!

Hola ${data.customerName},

Hemos recibido tu orden #${data.orderId.slice(0, 8)} y está siendo procesada.

Resumen de tu orden:
${data.items.map(item => `- ${item.name} (${item.quantity}x) - $${item.price.toLocaleString()} ${data.currency}`).join('\n')}

Total: $${data.total.toLocaleString()} ${data.currency}

Los proveedores han sido notificados y procesarán tu orden pronto.

¿Necesitas ayuda? Contáctanos en info@santurist.cl
    `;

    return this.sendEmail({
      to: data.customerEmail,
      subject: `Confirmación de Orden #${data.orderId.slice(0, 8)} - Santurist`,
      html,
      text,
    });
  }

  /**
   * Send payout notification to provider
   */
  static async sendPayoutNotification(data: PayoutNotificationData): Promise<boolean> {
    let statusText = '';
    let statusColor = '';

    switch (data.status) {
      case 'approved':
        statusText = 'aprobada';
        statusColor = '#10b981';
        break;
      case 'processed':
        statusText = 'procesada y transferida';
        statusColor = '#10b981';
        break;
      case 'rejected':
        statusText = 'rechazada';
        statusColor = '#ef4444';
        break;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Actualización de Pago</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #ea580c;">Actualización de tu solicitud de pago</h1>

          <p>Hola ${data.providerName},</p>

          <div style="margin: 30px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; color: #666;">Estado:</p>
            <p style="margin: 5px 0; font-size: 24px; font-weight: bold; color: ${statusColor};">
              ${statusText.toUpperCase()}
            </p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">Monto:</p>
            <p style="margin: 5px 0; font-size: 20px; font-weight: bold;">
              $${data.amount.toLocaleString()} ${data.currency}
            </p>
          </div>

          ${data.status === 'processed' ? `
            <p>El dinero ha sido transferido a tu cuenta bancaria registrada. Debería aparecer en 1-3 días hábiles.</p>
          ` : data.status === 'rejected' ? `
            <p>Lamentablemente, tu solicitud de pago fue rechazada. Por favor contacta a soporte para más detalles.</p>
          ` : `
            <p>Tu solicitud de pago ha sido aprobada y será procesada en las próximas 24 horas.</p>
          `}

          <div style="margin-top: 30px; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b;">
            <p style="margin: 0;"><strong>¿Tienes preguntas?</strong></p>
            <p style="margin: 5px 0 0 0;">Contáctanos en providers@santurist.cl</p>
          </div>

          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Este es un correo automático, por favor no respondas directamente.
          </p>
        </div>
      </body>
      </html>
    `;

    const text = `
Actualización de tu solicitud de pago

Hola ${data.providerName},

Estado: ${statusText.toUpperCase()}
Monto: $${data.amount.toLocaleString()} ${data.currency}

${data.status === 'processed'
  ? 'El dinero ha sido transferido a tu cuenta bancaria registrada. Debería aparecer en 1-3 días hábiles.'
  : data.status === 'rejected'
  ? 'Lamentablemente, tu solicitud de pago fue rechazada. Por favor contacta a soporte para más detalles.'
  : 'Tu solicitud de pago ha sido aprobada y será procesada en las próximas 24 horas.'}

¿Tienes preguntas? Contáctanos en providers@santurist.cl
    `;

    return this.sendEmail({
      to: data.providerEmail,
      subject: `Actualización de Pago - $${data.amount.toLocaleString()} ${data.currency}`,
      html,
      text,
    });
  }

  /**
   * Send new order notification to provider
   */
  static async sendNewOrderToProvider(
    providerEmail: string,
    providerName: string,
    orderId: string,
    items: Array<{ name: string; quantity: number }>,
    total: number,
    currency: string
  ): Promise<boolean> {
    const itemsList = items.map(item => `- ${item.name} (${item.quantity}x)`).join('\n');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nueva Orden Recibida</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #ea580c;">¡Nueva orden recibida!</h1>

          <p>Hola ${providerName},</p>

          <p>Has recibido una nueva orden <strong>#${orderId.slice(0, 8)}</strong>.</p>

          <div style="margin: 20px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #ea580c;">Productos:</h3>
            <p style="white-space: pre-line; margin: 0;">${itemsList}</p>
            <p style="margin: 15px 0 0 0;"><strong>Total: $${total.toLocaleString()} ${currency}</strong></p>
          </div>

          <p>Por favor inicia sesión en tu panel de proveedor para ver los detalles completos y confirmar la orden.</p>

          <a href="https://santurist.cl/provider/orders"
             style="display: inline-block; margin: 20px 0; padding: 12px 30px; background-color: #ea580c; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Ver Orden
          </a>

          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Este es un correo automático, por favor no respondas directamente.
          </p>
        </div>
      </body>
      </html>
    `;

    const text = `
¡Nueva orden recibida!

Hola ${providerName},

Has recibido una nueva orden #${orderId.slice(0, 8)}.

Productos:
${itemsList}

Total: $${total.toLocaleString()} ${currency}

Por favor inicia sesión en tu panel de proveedor para ver los detalles completos y confirmar la orden.

https://santurist.cl/provider/orders
    `;

    return this.sendEmail({
      to: providerEmail,
      subject: `Nueva Orden #${orderId.slice(0, 8)} - Santurist`,
      html,
      text,
    });
  }

  /**
   * Send review request to customer after order completion
   */
  static async sendReviewRequest(
    customerEmail: string,
    customerName: string,
    orderId: string,
    providerName: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>¿Cómo fue tu experiencia?</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #ea580c;">¿Cómo fue tu experiencia?</h1>

          <p>Hola ${customerName},</p>

          <p>Tu orden con <strong>${providerName}</strong> ha sido completada.</p>

          <p>¿Te gustaría compartir tu experiencia? Tu opinión ayuda a otros viajeros y a los proveedores a mejorar.</p>

          <a href="https://santurist.cl/orders/${orderId}/review"
             style="display: inline-block; margin: 20px 0; padding: 12px 30px; background-color: #ea580c; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Dejar Reseña
          </a>

          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Gracias por usar Santurist. ¡Esperamos verte pronto!
          </p>
        </div>
      </body>
      </html>
    `;

    const text = `
¿Cómo fue tu experiencia?

Hola ${customerName},

Tu orden con ${providerName} ha sido completada.

¿Te gustaría compartir tu experiencia? Tu opinión ayuda a otros viajeros y a los proveedores a mejorar.

Deja tu reseña aquí: https://santurist.cl/orders/${orderId}/review

Gracias por usar Santurist. ¡Esperamos verte pronto!
    `;

    return this.sendEmail({
      to: customerEmail,
      subject: `¿Cómo fue tu experiencia con ${providerName}?`,
      html,
      text,
    });
  }
}
