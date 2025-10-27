'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';

interface Booking {
  tourTitle: string;
  date: string;
  tourId: string;
  numberOfPeople: number;
  totalPrice: number;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const preferenceId = searchParams.get('preference_id');
  const bookingId = searchParams.get('external_reference'); // From MP redirect, but may need to fetch

  useEffect(() => {
    if (bookingId) {
      // Fetch booking from backend or Firebase
      fetch(`/api/bookings/${bookingId}`)
        .then(res => res.json())
        .then(data => setBooking(data))
        .catch(err => console.error(err));
    }
  }, [bookingId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">¡Pago Exitoso!</h1>
        {booking ? (
          <div>
            <p className="text-lg mb-2">Reserva confirmada: {booking.tourTitle}</p>
            <p className="text-lg mb-2">ID de Reserva: {bookingId}</p>
            <p className="text-lg mb-4">Fecha: {new Date(booking.date).toLocaleDateString()}</p>
            <Link href="/tours" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Ver Tours
            </Link>
          </div>
        ) : (
          <p>Procesando confirmación...</p>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-green-600 mb-4">¡Pago Exitoso!</h1>
          <p>Cargando...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}

