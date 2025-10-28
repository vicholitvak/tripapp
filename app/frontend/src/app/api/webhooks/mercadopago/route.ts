import { NextRequest, NextResponse } from 'next/server';
import { TourBookingService } from '@/lib/services/tourBookingService';
import { DeliveryBookingService } from '@/lib/services/deliveryBookingService';
import { OrderService } from '@/lib/services/orderService';
import { EmailService } from '@/lib/services/emailService';
import { ProviderService } from '@/lib/services/providerService';

/**
 * Webhook de Mercado Pago
 *
 * Este endpoint recibe notificaciones de Mercado Pago cuando cambia el estado de un pago
 * Documentación: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 *
 * Tipos de notificaciones:
 * - payment: Pago creado o actualizado
 * - merchant_order: Orden creada o actualizada
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Webhook recibido:', body);

    // Verificar firma de Mercado Pago (seguridad)
    const xSignature = request.headers.get('x-signature');
    const xRequestId = request.headers.get('x-request-id');

    if (xSignature && xRequestId) {
      // TODO: Implementar verificación de firma según docs de MP
      // https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks#verificar-la-firma
      console.log('Webhook signature:', xSignature);
    }

    // Obtener tipo de notificación
    const { type, action, data } = body;

    // Solo procesar notificaciones de pago
    if (type !== 'payment') {
      return NextResponse.json({ message: 'Tipo de notificación ignorado' }, { status: 200 });
    }

    // Obtener ID del pago
    const paymentId = data?.id;
    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID no encontrado' }, { status: 400 });
    }

    // Obtener información del pago desde Mercado Pago
    const MP_API = 'https://api.mercadopago.com';
    const ACCESS_TOKEN = process.env.NEXT_PUBLIC_MP_ACCESS_TOKEN || '';

    const response = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error('Error al obtener información del pago:', await response.text());
      return NextResponse.json({ error: 'Error al obtener pago' }, { status: 500 });
    }

    const payment = await response.json();
    console.log('Información del pago:', payment);

    // Extraer datos importantes
    const status = payment.status; // approved, pending, rejected, cancelled
    const externalReference = payment.external_reference; // Order ID
    const category = payment.metadata?.category; // tour, delivery, marketplace, stay, service

    if (!externalReference) {
      console.error('External reference no encontrado en el pago');
      return NextResponse.json({ error: 'Order ID no encontrado' }, { status: 400 });
    }

    // Actualizar el estado del pago según la categoría
    try {
      switch (category) {
        case 'tour': {
          // Mapear estado de MP a estado de Tour (paid/pending/refunded)
          let tourPaymentStatus: 'paid' | 'pending' | 'refunded' = 'pending';
          if (status === 'approved') {
            tourPaymentStatus = 'paid';
          } else if (status === 'rejected' || status === 'cancelled') {
            tourPaymentStatus = 'refunded';
          }
          await TourBookingService.updatePaymentStatus(
            externalReference,
            tourPaymentStatus,
            paymentId.toString()
          );
          console.log(`Tour booking ${externalReference} actualizado a ${tourPaymentStatus}`);
          break;
        }

        case 'delivery': {
          // Mapear estado de MP a estado de Delivery (approved/pending/rejected)
          let deliveryPaymentStatus: 'approved' | 'pending' | 'rejected' = 'pending';
          if (status === 'approved') {
            deliveryPaymentStatus = 'approved';
          } else if (status === 'rejected' || status === 'cancelled') {
            deliveryPaymentStatus = 'rejected';
          }
          await DeliveryBookingService.updatePaymentStatus(
            externalReference,
            deliveryPaymentStatus,
            paymentId.toString()
          );
          console.log(`Delivery order ${externalReference} actualizado a ${deliveryPaymentStatus}`);
          break;
        }

        case 'marketplace':
        case 'stay':
        case 'service': {
          // Marketplace orders use OrderService
          if (status === 'approved') {
            // Confirm payment and update order status
            await OrderService.confirmPayment(externalReference, paymentId.toString());
            console.log(`Marketplace order ${externalReference} payment confirmed`);

            // Send confirmation emails
            try {
              // Get order details
              const order = await OrderService.getById(externalReference);

              if (order) {
                // Send email to customer
                await EmailService.sendOrderConfirmation({
                  orderId: order.id!,
                  customerEmail: order.customerEmail,
                  customerName: order.customerEmail.split('@')[0], // Fallback to email
                  items: order.providerOrders.flatMap(po => po.items.map(item => ({
                    name: item.listingName,
                    quantity: item.quantity,
                    price: item.price,
                  }))),
                  total: order.total,
                  currency: 'CLP',
                });

                // Send notification to each provider
                for (const providerOrder of order.providerOrders) {
                  try {
                    const provider = await ProviderService.getById(providerOrder.providerId);
                    if (provider?.personalInfo?.email) {
                      await EmailService.sendNewOrderToProvider(
                        provider.personalInfo.email,
                        provider.personalInfo.displayName || 'Proveedor',
                        order.id!,
                        providerOrder.items.map(item => ({
                          name: item.listingName,
                          quantity: item.quantity,
                        })),
                        providerOrder.subtotal,
                        'CLP'
                      );
                    }
                  } catch (err) {
                    console.error('Error sending provider email:', err);
                    // Continue with other providers even if one fails
                  }
                }

                console.log(`Confirmation emails sent for order ${externalReference}`);
              }
            } catch (emailError) {
              console.error('Error sending confirmation emails:', emailError);
              // Don't fail the webhook if emails fail
            }
          } else if (status === 'rejected' || status === 'cancelled') {
            // Cancel order
            await OrderService.updateStatus(externalReference, 'cancelled');
            console.log(`Marketplace order ${externalReference} cancelled due to payment failure`);
          }
          break;
        }

        default:
          console.log(`Categoría desconocida: ${category}`);
      }
    } catch (error) {
      console.error('Error al actualizar estado del pago:', error);
      // No devolvemos error 500 para que Mercado Pago no reintente
      return NextResponse.json({ message: 'Error al actualizar, pero recibido' }, { status: 200 });
    }

    return NextResponse.json({ message: 'Webhook procesado exitosamente' }, { status: 200 });
  } catch (error) {
    console.error('Error en webhook:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// Mercado Pago también puede enviar GET para verificar el webhook
export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Webhook activo' }, { status: 200 });
}
