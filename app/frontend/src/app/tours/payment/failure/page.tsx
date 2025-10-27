'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle, AlertTriangle, RefreshCw, Home } from 'lucide-react';

function TourPaymentFailureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    const externalReference = searchParams.get('external_reference');
    const storedBooking = localStorage.getItem('pending_tour_booking');
    const id = externalReference || storedBooking;

    if (id) {
      setBookingId(id);
    }
  }, [searchParams]);

  const handleRetry = () => {
    if (bookingId) {
      // Mantener el booking ID para reintento
      router.push('/tours');
    } else {
      router.push('/tours');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header de error */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pago no procesado
          </h1>
          <p className="text-lg text-gray-600">
            No se pudo completar tu reserva
          </p>
        </div>

        {/* Información del error */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold text-gray-900 mb-2">¿Qué pasó?</h2>
              <p className="text-gray-600 text-sm mb-4">
                El pago no pudo ser procesado. Esto puede ocurrir por varios motivos:
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>Fondos insuficientes en tu cuenta o tarjeta</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>Tarjeta vencida o bloqueada</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>Límite de compra excedido</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>Cancelaste la transacción</span>
                </li>
              </ul>
            </div>
          </div>

          {bookingId && (
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <p className="text-sm text-gray-600 mb-1">Código de referencia:</p>
              <p className="text-gray-900 font-mono text-sm">{bookingId}</p>
            </div>
          )}
        </div>

        {/* Sugerencias */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-2">¿Qué puedes hacer?</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Verifica los datos de tu tarjeta y vuelve a intentar</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Intenta con otro método de pago</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Contacta a tu banco si el problema persiste</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>La reserva no se ha confirmado, no se hizo ningún cargo</span>
            </li>
          </ul>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Ir al inicio
          </button>
          <button
            onClick={handleRetry}
            className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Intentar nuevamente
          </button>
        </div>

        {/* Información de contacto */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            ¿Necesitas ayuda?{' '}
            <a
              href="mailto:soporte@santurist.com"
              className="text-teal-600 hover:text-teal-700 font-semibold"
            >
              Contáctanos
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TourPaymentFailurePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    }>
      <TourPaymentFailureContent />
    </Suspense>
  );
}
