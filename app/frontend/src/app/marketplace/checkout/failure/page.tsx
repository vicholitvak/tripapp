'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle, Home, ShoppingCart } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function CheckoutFailurePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const reason = searchParams.get('reason') || 'Pago rechazado';

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center py-12">
      <div className="max-w-2xl w-full mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pago no completado
          </h1>
          <p className="text-gray-600 mb-8">
            Lamentablemente, no pudimos procesar tu pago. Por favor, intenta nuevamente.
          </p>

          {/* Razón del error */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <p className="text-red-800">
              <strong>Motivo:</strong> {reason}
            </p>
          </div>

          {/* Sugerencias */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="font-semibold text-gray-900 mb-4 text-left">
              ¿Qué puedes hacer?
            </h2>
            <ul className="text-left space-y-2 text-gray-700">
              <li>✓ Verifica que tu tarjeta o método de pago sea válido</li>
              <li>✓ Revisa que haya fondos disponibles</li>
              <li>✓ Intenta con otro método de pago</li>
              <li>✓ Contacta a tu banco si continúa el problema</li>
            </ul>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => router.push('/marketplace/checkout')}
              className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Intentar de nuevo
            </button>
            <button
              onClick={() => router.push('/marketplace')}
              className="flex-1 px-6 py-3 border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Volver al marketplace
            </button>
          </div>

          {/* Soporte */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Si el problema persiste, contacta a{' '}
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
