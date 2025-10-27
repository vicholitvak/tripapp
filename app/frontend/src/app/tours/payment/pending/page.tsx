'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Clock, AlertCircle, Home, RefreshCw } from 'lucide-react';

function TourPaymentPendingContent() {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header de pendiente */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-12 h-12 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pago pendiente
          </h1>
          <p className="text-lg text-gray-600">
            Tu pago está siendo procesado
          </p>
        </div>

        {/* Información del estado pendiente */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold text-gray-900 mb-2">¿Qué significa esto?</h2>
              <p className="text-gray-600 text-sm mb-4">
                Tu pago está siendo verificado. Esto puede tomar unos minutos o hasta 48 horas dependiendo del método de pago utilizado.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-900 mb-2">Métodos que pueden estar pendientes:</p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Transferencia bancaria</li>
                  <li>• Pago en efectivo (Servipag, Sencillito, etc.)</li>
                  <li>• Boleto bancario</li>
                </ul>
              </div>
            </div>
          </div>

          {bookingId && (
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <p className="text-sm text-gray-600 mb-1">Código de referencia:</p>
              <p className="text-gray-900 font-mono text-sm">{bookingId}</p>
            </div>
          )}
        </div>

        {/* Próximos pasos */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-2">Próximos pasos</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Recibirás un correo cuando el pago se confirme</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Si pagaste en efectivo, completa el pago en el punto indicado</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Guarda el código de referencia para consultar el estado</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Puedes revisar el estado en tu perfil</span>
            </li>
          </ul>
        </div>

        {/* Advertencia */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Importante:</strong> Tu reserva no está confirmada hasta que el pago sea aprobado.
            Si el pago es rechazado, la reserva será cancelada automáticamente.
          </p>
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
            onClick={() => router.push('/profile')}
            className="flex-1 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Ver mis reservas
          </button>
        </div>

        {/* Información de contacto */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            ¿Tienes dudas?{' '}
            <a
              href="mailto:soporte@santurist.com"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Contáctanos
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TourPaymentPendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    }>
      <TourPaymentPendingContent />
    </Suspense>
  );
}
