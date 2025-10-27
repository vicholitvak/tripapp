'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Calendar, Users, MapPin, Clock, Loader, ArrowLeft } from 'lucide-react';
import { TourBookingService } from '@/lib/services/tourBookingService';
import { TourBooking } from '@/types/tours';

function TourPaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [booking, setBooking] = useState<TourBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Obtener payment_id de Mercado Pago
        const paymentId = searchParams.get('payment_id');
        const status = searchParams.get('status');
        const externalReference = searchParams.get('external_reference');

        // Intentar obtener booking ID desde localStorage o URL
        const bookingId = externalReference || localStorage.getItem('pending_tour_booking');

        if (!bookingId) {
          throw new Error('No se encontró la reserva');
        }

        // Obtener datos del booking
        const bookingData = await TourBookingService.getById(bookingId);
        if (!bookingData) {
          throw new Error('Reserva no encontrada');
        }

        // Actualizar estado del pago si es necesario
        if (paymentId && status === 'approved') {
          await TourBookingService.updatePaymentStatus(bookingId, 'paid', paymentId);
          bookingData.payment = {
            ...bookingData.payment,
            status: 'paid',
            transactionId: paymentId,
          };
          bookingData.status = 'confirmed';
        }

        setBooking(bookingData);

        // Limpiar localStorage
        localStorage.removeItem('pending_tour_booking');
      } catch (err) {
        console.error('Error processing payment:', err);
        setError(err instanceof Error ? err.message : 'Error al procesar el pago');
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50 to-white">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Procesando tu pago...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white px-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowLeft className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error || 'No se pudo cargar la información'}</p>
          <button
            onClick={() => router.push('/tours')}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold"
          >
            Ver tours disponibles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header de éxito */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Reserva confirmada!
          </h1>
          <p className="text-lg text-gray-600">
            Tu pago ha sido procesado exitosamente
          </p>
        </div>

        {/* Detalles de la reserva */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">{booking.tourTitle}</h2>
            <p className="text-teal-100">Código de reserva: {booking.id}</p>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-600">Fecha</p>
                <p className="text-gray-900">
                  {booking.tourInstanceId && 'Ver detalles en tu perfil'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-600">Participantes</p>
                <p className="text-gray-900">
                  {booking.numberOfPeople} persona{booking.numberOfPeople > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-600">Información de contacto</p>
                <p className="text-gray-900">{booking.customerName}</p>
                <p className="text-gray-600 text-sm">{booking.customerEmail}</p>
                {booking.contactInfo?.phone && (
                  <p className="text-gray-600 text-sm">{booking.contactInfo.phone}</p>
                )}
              </div>
            </div>

            {booking.specialRequests && (
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-600">Solicitudes especiales</p>
                  <p className="text-gray-900">{booking.specialRequests}</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Precio por persona</span>
              <span className="text-gray-900">
                ${booking.pricePerPerson.toLocaleString('es-CL')} CLP
              </span>
            </div>
            {booking.discountApplied && booking.discountApplied > 0 && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-green-600">Descuento ({booking.discountApplied}%)</span>
                <span className="text-green-600">
                  -${((booking.totalAmount * booking.discountApplied) / 100).toLocaleString('es-CL')} CLP
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="font-bold text-gray-900">Total pagado</span>
              <span className="text-2xl font-bold text-teal-600">
                ${booking.totalAmount.toLocaleString('es-CL')} CLP
              </span>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-2">Próximos pasos</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Recibirás un correo de confirmación en {booking.customerEmail}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>El proveedor del tour se pondrá en contacto contigo antes del día del tour</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Puedes ver los detalles de tu reserva en tu perfil</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Si tienes dudas, contacta al proveedor del tour directamente</span>
            </li>
          </ul>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push('/tours')}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            Ver más tours
          </button>
          <button
            onClick={() => router.push('/profile')}
            className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold"
          >
            Ver mis reservas
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TourPaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50 to-white">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <TourPaymentSuccessContent />
    </Suspense>
  );
}
