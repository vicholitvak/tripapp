'use client';

import { useRouter } from 'next/navigation';
import { Clock, AlertCircle, Home } from 'lucide-react';

export default function DeliveryPaymentPendingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-12 h-12 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pago pendiente</h1>
          <p className="text-lg text-gray-600">Tu pago está siendo procesado</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold text-gray-900 mb-2">¿Qué significa esto?</h2>
              <p className="text-gray-600 text-sm mb-4">
                Tu pago está siendo verificado. Esto puede tomar unos minutos o hasta 48 horas dependiendo del método de pago.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Importante:</strong> Tu pedido no está confirmado hasta que el pago sea aprobado.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 font-semibold flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Ir al inicio
          </button>
          <button
            onClick={() => router.push('/profile')}
            className="flex-1 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold"
          >
            Ver mis pedidos
          </button>
        </div>
      </div>
    </div>
  );
}
