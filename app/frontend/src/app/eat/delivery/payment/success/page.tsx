'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { clearCart } = useCart();

  useEffect(() => {
    // Clear cart on success
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <CheckCircle className="w-24 h-24 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Pedido Confirmado!</h1>
        <p className="text-gray-600 mb-6">
          Tu pedido ha sido recibido y está siendo preparado. Recibirás una notificación cuando esté listo para entregar.
        </p>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="text-left space-y-3">
            <div>
              <p className="text-sm text-gray-500">Número de pedido</p>
              <p className="text-lg font-bold text-gray-900">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tiempo estimado de entrega</p>
              <p className="text-lg font-bold text-gray-900">30-45 minutos</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Estado</p>
              <p className="text-lg font-bold text-green-600">Preparándose</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/eat/delivery')}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-semibold"
          >
            Seguir comprando
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            Volver al inicio
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Puedes ver el estado de tu pedido en tu dashboard
        </p>
      </div>
    </div>
  );
}
