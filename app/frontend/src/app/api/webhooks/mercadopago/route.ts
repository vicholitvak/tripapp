import { NextRequest, NextResponse } from 'next/server';
import { TourBookingService } from '@/lib/services/tourBookingService';
import { DeliveryBookingService } from '@/lib/services/deliveryBookingService';
import { OrderService } from '@/lib/services/orderService';

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
        case 'service':
          // TODO: Implementar actualización para otras categorías
          console.log(`Categoría ${category} no implementada aún para ${externalReference}`);
          break;

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
