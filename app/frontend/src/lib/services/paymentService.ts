import { UnifiedCart } from '@/types/marketplace';

/**
 * Servicio de Pagos con Mercado Pago
 *
 * Documentación: https://www.mercadopago.com.ar/developers/es/docs
 *
 * Requisitos:
 * 1. Crear cuenta en https://www.mercadopago.com.ar
 * 2. Obtener Access Token de la aplicación
 * 3. Guardar en .env.local: NEXT_PUBLIC_MP_PUBLIC_KEY
 */

export interface MercadoPagoPreference {
  external_reference: string; // Order ID
  items: Array<{
    title: string;
    quantity: number;
    currency_id: string;
    unit_price: number;
  }>;
  payer: {
    name: string;
    email: string;
    phone?: {
      area_code: string;
      number: number;
    };
    address?: {
      street_name: string;
      street_number: string;
      zip_code: string;
    };
  };
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return: string;
  notification_url: string;
  binary_mode: boolean;
  metadata?: Record<string, unknown>;
}

export class PaymentService {
  private static MP_API = 'https://api.mercadopago.com';
  private static ACCESS_TOKEN = process.env.NEXT_PUBLIC_MP_ACCESS_TOKEN || '';

  /**
   * Crea una preferencia de pago en Mercado Pago
   * Esta preferencia se usa para redirigir al usuario a pagar
   */
  static async createMercadoPagoPreference(
    orderId: string,
    cart: UnifiedCart,
    customerName: string,
    customerEmail: string,
    baseUrl: string = 'https://santurist.vercel.app'
  ): Promise<{
    preferenceId: string;
    initPoint: string;
  }> {
    try {
      // Agrupar items por nombre para Mercado Pago
      const items = cart.items.map(item => ({
        title: item.listingName,
        quantity: item.quantity,
        currency_id: 'CLP',
        unit_price: item.price,
      }));

      // Agregar línea de comisión si existe
      if (cart.commission > 0) {
        items.push({
          title: 'Comisión de plataforma',
          quantity: 1,
          currency_id: 'CLP',
          unit_price: cart.commission,
        });
      }

      const preference: MercadoPagoPreference = {
        external_reference: orderId,
        items,
        payer: {
          name: customerName,
          email: customerEmail,
        },
        back_urls: {
          success: `${baseUrl}/marketplace/checkout/success`,
          failure: `${baseUrl}/marketplace/checkout/failure`,
          pending: `${baseUrl}/marketplace/checkout/pending`,
        },
        auto_return: 'approved',
        notification_url: `${baseUrl}/api/webhooks/mercadopago`,
        binary_mode: true, // Solo aprobado o rechazado
      };

      const response = await fetch(`${this.MP_API}/checkout/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.ACCESS_TOKEN}`,
        },
        body: JSON.stringify(preference),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Mercado Pago Error: ${error.message}`);
      }

      const data = await response.json();

      return {
        preferenceId: data.id,
        initPoint: data.init_point,
      };
    } catch (error) {
      console.error('Error creating Mercado Pago preference:', error);
      throw error;
    }
  }

  /**
   * Verifica el estado de un pago
   */
  static async verifyPayment(transactionId: string): Promise<{
    status: 'approved' | 'pending' | 'rejected' | 'cancelled';
    amount: number;
    externalReference: string;
    payerEmail: string;
  }> {
    try {
      const response = await fetch(
        `${this.MP_API}/v1/payments/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${this.ACCESS_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to verify payment');
      }

      const data = await response.json();

      return {
        status: data.status,
        amount: data.transaction_amount,
        externalReference: data.external_reference,
        payerEmail: data.payer?.email || '',
      };
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  /**
   * Procesa un reembolso
   */
  static async refundPayment(transactionId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.MP_API}/v1/payments/${transactionId}/refunds`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.ACCESS_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to refund payment');
      }
    } catch (error) {
      console.error('Error refunding payment:', error);
      throw error;
    }
  }

  /**
   * Obtiene el estado de una preferencia
   */
  static async getPreferenceStatus(preferenceId: string): Promise<Record<string, unknown>> {
    try {
      const response = await fetch(
        `${this.MP_API}/checkout/preferences/${preferenceId}`,
        {
          headers: {
            Authorization: `Bearer ${this.ACCESS_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get preference status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting preference status:', error);
      throw error;
    }
  }

  /**
   * Valida que los credenciales de Mercado Pago estén configurados
   */
  static isConfigured(): boolean {
    return !!this.ACCESS_TOKEN;
  }

  /**
   * Crea enlace de pago directo (para testing o pago simplificado)
   * Nota: Esto es solo para demostración, en producción usar preferences
   */
  static createPaymentLink(
    orderId: string,
    amount: number,
    description: string,
    baseUrl: string = 'https://santurist.vercel.app'
  ): string {
    const params = new URLSearchParams({
      preferenceId: orderId, // Debería ser el preferenceId real
      back_urls_failure: `${baseUrl}/marketplace/checkout/failure`,
      back_urls_success: `${baseUrl}/marketplace/checkout/success`,
    });

    return `https://www.mercadopago.com.ar/checkout/v1/redirect?${params.toString()}`;
  }
}
