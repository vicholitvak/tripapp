'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, MapPin, Clock, Loader, ArrowLeft } from 'lucide-react';
import { DeliveryBookingService, DeliveryOrder } from '@/lib/services/deliveryBookingService';

function DeliveryPaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<DeliveryOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processPayment = async () => {
      try {
        const paymentId = searchParams.get('payment_id');
        const status = searchParams.get('status');
        const externalReference = searchParams.get('external_reference');
        const orderId = externalReference || localStorage.getItem('pending_delivery_order');

        if (!orderId) throw new Error('No se encontró la orden');

        const orderData = await DeliveryBookingService.getById(orderId);
        if (!orderData) throw new Error('Orden no encontrada');

        if (paymentId && status === 'approved') {
          await DeliveryBookingService.updatePaymentStatus(orderId, 'approved', paymentId);
          orderData.payment.status = 'approved';
          orderData.payment.transactionId = paymentId;
          orderData.status = 'confirmed';
        }

        setOrder(orderData);
        localStorage.removeItem('pending_delivery_order');
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Error al procesar el pago');
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Procesando tu pago...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white px-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowLeft className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error || 'No se pudo cargar la información'}</p>
          <button
            onClick={() => router.push('/eat/delivery')}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold"
          >
            Volver al menú
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Pedido confirmado!</h1>
          <p className="text-lg text-gray-600">Tu pago ha sido procesado exitosamente</p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Tu pedido está en camino</h2>
            <p className="text-orange-100">Código de pedido: {order.id}</p>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-600">Tiempo estimado</p>
                <p className="text-gray-900">{order.estimatedDeliveryTime || '30-45 minutos'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-600">Dirección de entrega</p>
                <p className="text-gray-900">
                  {order.deliveryAddress.street}, {order.deliveryAddress.city}
                </p>
                {order.deliveryAddress.instructions && (
                  <p className="text-gray-600 text-sm">{order.deliveryAddress.instructions}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Items del pedido</h3>
            <div className="space-y-2 mb-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="text-gray-900">${(item.price * item.quantity).toLocaleString('es-CL')}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${order.subtotal.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Envío</span>
                <span>${order.deliveryFee.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="font-bold text-gray-900">Total pagado</span>
                <span className="text-2xl font-bold text-orange-600">
                  ${order.total.toLocaleString('es-CL')} CLP
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-2">Próximos pasos</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Recibirás un correo de confirmación en {order.customerEmail}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>El restaurante está preparando tu pedido</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Te contactaremos cuando el pedido esté en camino</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push('/eat/delivery')}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 font-semibold"
          >
            Volver al menú
          </button>
          <button
            onClick={() => router.push('/profile')}
            className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold"
          >
            Ver mis pedidos
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DeliveryPaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Procesando tu pago...</p>
        </div>
      </div>
    }>
      <DeliveryPaymentSuccessContent />
    </Suspense>
  );
}
