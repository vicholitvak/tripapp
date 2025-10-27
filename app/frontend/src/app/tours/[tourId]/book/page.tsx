'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  AlertTriangle,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  TrendingDown,
  Gift,
  Shield,
  Info,
} from 'lucide-react';
import { Tour, TourInstance, TourBooking } from '@/types/tours';
import { TourService } from '@/lib/services/tourService';
import { TourBookingService } from '@/lib/services/tourBookingService';
import { MOCK_TOURS } from '@/lib/seeds/toursSeed';
import { Suspense } from 'react';

function TourBookingContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const tourId = params.tourId as string;
  const instanceId = searchParams.get('instance');

  const [tour, setTour] = useState<(Tour & { instances: TourInstance[] }) | null>(null);
  const [instance, setInstance] = useState<TourInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
    emergencyContact: '',
    emergencyPhone: '',
  });
  const [specialRequests, setSpecialRequests] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    // TODO: Replace with actual API call
    const foundTour = MOCK_TOURS.find((t) => t.id === tourId);
    if (foundTour) {
      setTour(foundTour);
      const foundInstance = foundTour.instances.find((i) => i.id === instanceId);
      if (foundInstance) {
        setInstance(foundInstance);
      }
    }
    setLoading(false);

    // Pre-fill user info if logged in
    if (user) {
      setContactInfo((prev) => ({
        ...prev,
        name: user.displayName || '',
        email: user.email || '',
      }));
    }
  }, [tourId, instanceId, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tour || !instance || !user) return;
    if (!acceptedTerms) {
      alert('Debes aceptar los términos y condiciones para continuar');
      return;
    }

    setSubmitting(true);

    try {
      const booking: Partial<TourBooking> = {
        tourId: tour.id!,
        tourInstanceId: instance.id!,
        tourTitle: tour.title,
        providerId: tour.providerId,
        customerId: user.uid,
        customerEmail: contactInfo.email,
        customerName: contactInfo.name,
        numberOfPeople,
        pricePerPerson: instance.pricePerPerson,
        totalAmount: instance.pricePerPerson * numberOfPeople,
        discountApplied: instance.dynamicPricing?.isActive
          ? instance.dynamicPricing.discountPercentage
          : undefined,
        contactInfo: {
          phone: contactInfo.phone,
          emergencyContact: contactInfo.emergencyContact || undefined,
          emergencyPhone: contactInfo.emergencyPhone || undefined,
        },
        specialRequests: specialRequests || undefined,
        dietaryRestrictions: dietaryRestrictions.length > 0 ? dietaryRestrictions : undefined,
        reviewSubmitted: false,
      };

      // Crear booking y obtener link de pago de Mercado Pago
      const { bookingId, initPoint } = await TourBookingService.createBookingWithPayment(
        booking,
        contactInfo.name,
        contactInfo.email,
        contactInfo.phone
      );

      // Guardar booking ID en localStorage para después del pago
      localStorage.setItem('pending_tour_booking', bookingId);

      // Redirigir a Mercado Pago
      window.location.href = initPoint;
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Error al crear la reserva. Por favor intenta nuevamente.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información de reserva...</p>
        </div>
      </div>
    );
  }

  if (!tour || !instance) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Información no encontrada</h1>
          <p className="text-gray-600 mb-4">
            No se pudo cargar la información del tour o la instancia seleccionada.
          </p>
          <button
            onClick={() => router.push('/tours')}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Ver todos los tours
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Inicia sesión para reservar</h1>
          <p className="text-gray-600 mb-4">
            Debes iniciar sesión para poder realizar una reserva.
          </p>
          <button
            onClick={() => router.push('/login?redirect=/tours/' + tourId + '/book?instance=' + instanceId)}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (date: { toDate?: () => Date } | Date): string => {
    const d = (date as { toDate?: () => Date }).toDate
      ? (date as { toDate: () => Date }).toDate()
      : new Date(date as Date);
    return d.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const hasDiscount = instance.dynamicPricing?.isActive;
  const discountPercentage = instance.dynamicPricing?.discountPercentage || 0;
  const pricePerPerson = instance.pricePerPerson;
  const totalAmount = pricePerPerson * numberOfPeople;
  const canBook = numberOfPeople <= instance.availableSpots && instance.status !== 'full';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Completar reserva</h1>
        <p className="text-gray-600 mb-8">{tour.title}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de reserva */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información del tour */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Detalles del tour</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar className="w-5 h-5 text-teal-600" />
                    <span className="font-semibold">{formatDate(instance.date)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Clock className="w-5 h-5 text-teal-600" />
                    <span>
                      {instance.startTime} - {instance.endTime}
                    </span>
                  </div>
                  {instance.meetingPoint && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Punto de encuentro:</p>
                      <p className="font-semibold text-gray-900">
                        {instance.meetingPoint.address}
                      </p>
                      {instance.meetingPoint.instructions && (
                        <p className="text-sm text-gray-600 mt-1">
                          {instance.meetingPoint.instructions}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Descuento activo */}
                {hasDiscount && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
                      <TrendingDown className="w-5 h-5" />
                      ¡{discountPercentage}% de descuento aplicado!
                    </div>
                    {instance.dynamicPricing?.bonusIncentives &&
                      instance.dynamicPricing.bonusIncentives.length > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2 text-red-600 text-sm mb-1">
                            <Gift className="w-4 h-4" />
                            Bonos incluidos:
                          </div>
                          {instance.dynamicPricing.bonusIncentives.map((bonus, index) => (
                            <div key={index} className="flex items-center gap-2 text-red-600 text-sm">
                              <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                              <span>{bonus}</span>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                )}
              </div>

              {/* Número de personas */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-600" />
                  Número de personas
                </h3>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setNumberOfPeople(Math.max(1, numberOfPeople - 1))}
                    className="w-10 h-10 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-bold text-gray-700"
                  >
                    -
                  </button>
                  <div className="text-2xl font-bold text-gray-900 w-12 text-center">
                    {numberOfPeople}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setNumberOfPeople(Math.min(instance.availableSpots, numberOfPeople + 1))
                    }
                    className="w-10 h-10 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-bold text-gray-700"
                  >
                    +
                  </button>
                  <span className="text-gray-600 ml-4">
                    {instance.availableSpots} cupos disponibles
                  </span>
                </div>

                {numberOfPeople > instance.availableSpots && (
                  <p className="mt-3 text-sm text-red-600 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    No hay suficientes cupos disponibles
                  </p>
                )}
              </div>

              {/* Información de contacto */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Información de contacto</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactInfo.name}
                      onChange={(e) =>
                        setContactInfo({ ...contactInfo, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Juan Pérez"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactInfo.email}
                      onChange={(e) =>
                        setContactInfo({ ...contactInfo, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="juan@ejemplo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      required
                      value={contactInfo.phone}
                      onChange={(e) =>
                        setContactInfo({ ...contactInfo, phone: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="+56 9 1234 5678"
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">Contacto de emergencia (opcional)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={contactInfo.emergencyContact}
                        onChange={(e) =>
                          setContactInfo({ ...contactInfo, emergencyContact: e.target.value })
                        }
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Nombre"
                      />
                      <input
                        type="tel"
                        value={contactInfo.emergencyPhone}
                        onChange={(e) =>
                          setContactInfo({ ...contactInfo, emergencyPhone: e.target.value })
                        }
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Teléfono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Solicitudes especiales */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Información adicional (opcional)
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Solicitudes especiales
                    </label>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Menciona cualquier necesidad especial, alergias, o solicitudes particulares..."
                    />
                  </div>
                </div>
              </div>

              {/* Términos y condiciones */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    Acepto los{' '}
                    <a href="#" className="text-teal-600 hover:underline">
                      términos y condiciones
                    </a>{' '}
                    y la{' '}
                    <a href="#" className="text-teal-600 hover:underline">
                      política de cancelación {tour.cancellationPolicy.name}
                    </a>
                    . Entiendo que si el tour no alcanza el mínimo de participantes, será
                    cancelado y recibiré un reembolso completo.
                  </label>
                </div>
              </div>

              {/* Botón de submit */}
              <button
                type="submit"
                disabled={!canBook || !acceptedTerms || submitting}
                className={`w-full py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                  !canBook || !acceptedTerms || submitting
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : hasDiscount
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Proceder al pago
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Resumen de la reserva */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen de reserva</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Precio por persona:</span>
                  {hasDiscount && instance.originalPrice ? (
                    <div className="text-right">
                      <div className="text-sm text-gray-500 line-through">
                        ${instance.originalPrice.toLocaleString('es-CL')}
                      </div>
                      <div className="font-semibold text-red-600">
                        ${pricePerPerson.toLocaleString('es-CL')}
                      </div>
                    </div>
                  ) : (
                    <span className="font-semibold">
                      ${pricePerPerson.toLocaleString('es-CL')}
                    </span>
                  )}
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>Número de personas:</span>
                  <span className="font-semibold">{numberOfPeople}</span>
                </div>

                {hasDiscount && (
                  <div className="flex justify-between text-red-600">
                    <span>Descuento:</span>
                    <span className="font-semibold">-{discountPercentage}%</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t-2 border-gray-200">
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total:</span>
                  <span className={hasDiscount ? 'text-red-600' : ''}>
                    ${totalAmount.toLocaleString('es-CL')}
                  </span>
                </div>
              </div>

              {/* Información de seguridad */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Pago seguro</p>
                    <p className="text-blue-700">
                      Tu información está protegida con encriptación de nivel bancario.
                    </p>
                  </div>
                </div>
              </div>

              {/* Política de cancelación */}
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold mb-1">
                      Política: {tour.cancellationPolicy.name}
                    </p>
                    {tour.cancellationPolicy.rules.slice(0, 2).map((rule, index) => (
                      <p key={index} className="text-xs text-gray-600 mt-1">
                        • {rule.description}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Advertencia de cupo mínimo */}
              {instance.status === 'at_risk' && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-900">
                      <p className="font-semibold mb-1">Tour en riesgo</p>
                      <p className="text-yellow-700">
                        Este tour necesita {instance.minParticipants - instance.bookedSpots} personas más para confirmarse. Si no se alcanza el mínimo, recibirás un reembolso completo.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TourBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    }>
      <TourBookingContent />
    </Suspense>
  );
}
