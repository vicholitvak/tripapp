'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UnifiedCartService } from '@/lib/services/unifiedCartService';
import { OrderService } from '@/lib/services/orderService';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle, Loader, AlertCircle, Home, Package } from 'lucide-react';

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const processPayment = async () => {
      try {
        setLoading(true);

        // Obtener parámetros de Mercado Pago
        const mpPaymentId = searchParams.get('payment_id');
        const mpExternalId = searchParams.get('external_reference');
        const mpStatus = searchParams.get('status');

        if (!mpPaymentId) {
          throw new Error('No se encontró información de pago');
        }

        setPaymentId(mpPaymentId);

        // Obtener IDs guardados
        const pendingOrderId = localStorage.getItem('pending_order_id');
        const pendingPreferenceId = localStorage.getItem('pending_preference_id');

        if (!pendingOrderId) {
          throw new Error('No se encontró la orden');
        }

        setOrderId(pendingOrderId);

        // Actualizar estado de la orden a "confirmado"
        await OrderService.confirmPayment(
          pendingOrderId,
          mpPaymentId
        );

        // Limpiar carrito
        UnifiedCartService.clearCart(user.uid);

        // Limpiar localStorage
        localStorage.removeItem('pending_order_id');
        localStorage.removeItem('pending_preference_id');

        setError(null);
      } catch (error) {
        console.error('Error processing payment:', error);
        setError(
          error instanceof Error
            ? error.message
            : 'Error al procesar el pago'
        );
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [user, router, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Procesando tu pago...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Error en el pago</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/marketplace/cart')}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Volver al carrito
            </button>
            <button
              onClick={() => router.push('/marketplace')}
              className="px-6 py-2 border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
            >
              Seguir comprando
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center py-12">
      <div className="max-w-2xl w-full mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Pago completado!
          </h1>
          <p className="text-gray-600 mb-8">
            Tu pedido ha sido confirmado y será procesado por los proveedores
          </p>

          {/* Información de la orden */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 space-y-4 text-left">
            <div>
              <p className="text-sm text-gray-600">Número de orden</p>
              <p className="text-lg font-semibold text-gray-900">#{orderId}</p>
            </div>
            {paymentId && (
              <div>
                <p className="text-sm text-gray-600">ID de transacción</p>
                <p className="text-lg font-semibold text-gray-900">
                  {paymentId}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Estado</p>
              <p className="text-lg font-semibold text-green-600">
                Confirmado
              </p>
            </div>
          </div>

          {/* Pasos siguientes */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="font-semibold text-gray-900 mb-4">Próximos pasos</h2>
            <div className="space-y-3 text-left">
              <div className="flex gap-3">
                <Package className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">
                    Los proveedores procesarán tu pedido
                  </p>
                  <p className="text-sm text-gray-600">
                    Recibirás confirmaciones por email de cada proveedor
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Package className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">
                    Rastrearás tu pedido desde tu cuenta
                  </p>
                  <p className="text-sm text-gray-600">
                    Accede a &quot;Mis pedidos&quot; para ver el estado de cada artículo
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => router.push('/profile/orders')}
              className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <Package className="w-5 h-5" />
              Ver mis pedidos
            </button>
            <button
              onClick={() => router.push('/marketplace')}
              className="flex-1 px-6 py-3 border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Seguir comprando
            </button>
          </div>

          {/* Soporte */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              ¿Tienes preguntas? Contacta a{' '}
              <a href="mailto:support@santurist.com" className="text-orange-600 hover:underline">
                nuestro soporte
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
