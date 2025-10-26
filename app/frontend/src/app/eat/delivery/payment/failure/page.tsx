'use client';

import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

export default function PaymentFailurePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <AlertCircle className="w-24 h-24 text-red-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pago No Completado</h1>
        <p className="text-gray-600 mb-6">
          Hubo un problema al procesar tu pago. Por favor, intenta de nuevo.
        </p>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="text-left space-y-3">
            <div>
              <p className="text-sm text-gray-500">Razón</p>
              <p className="text-lg font-bold text-red-600">Pago rechazado</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Recomendación</p>
              <p className="text-sm text-gray-700">Verifica tu información de tarjeta e intenta nuevamente</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/eat/delivery/cart')}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-semibold"
          >
            Volver al carrito
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            Volver al inicio
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Si el problema persiste, contacta al soporte
        </p>
      </div>
    </div>
  );
}
