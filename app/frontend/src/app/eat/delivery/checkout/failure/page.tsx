'use client';

import { useRouter } from 'next/navigation';
import { XCircle, AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function DeliveryPaymentFailurePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pago no procesado</h1>
          <p className="text-lg text-gray-600">No se pudo completar tu pedido</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold text-gray-900 mb-2">¿Qué pasó?</h2>
              <p className="text-gray-600 text-sm mb-4">
                El pago no pudo ser procesado. Esto puede ocurrir por:
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Fondos insuficientes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Tarjeta vencida o bloqueada</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Cancelaste la transacción</span>
                </li>
              </ul>
            </div>
          </div>
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
            onClick={() => router.push('/eat/delivery')}
            className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Intentar nuevamente
          </button>
        </div>
      </div>
    </div>
  );
}
