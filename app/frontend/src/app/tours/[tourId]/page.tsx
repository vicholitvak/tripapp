'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Mountain,
  Info,
  Star,
  ChevronLeft,
  TrendingDown,
  Zap,
  Gift,
  Shield,
  Package,
} from 'lucide-react';
import { Tour, TourInstance } from '@/types/tours';
import { MOCK_TOURS } from '@/lib/seeds/toursSeed';

export default function TourDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tourId = params.tourId as string;

  const [tour, setTour] = useState<(Tour & { instances: TourInstance[] }) | null>(null);
  const [selectedInstance, setSelectedInstance] = useState<TourInstance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    const foundTour = MOCK_TOURS.find((t) => t.id === tourId);
    if (foundTour) {
      setTour(foundTour);
      // Pre-select first available instance
      if (foundTour.instances.length > 0) {
        setSelectedInstance(foundTour.instances[0]);
      }
    }
    setLoading(false);
  }, [tourId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tour...</p>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tour no encontrado</h1>
          <p className="text-gray-600 mb-4">El tour que buscas no existe o fue eliminado.</p>
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

  const getHoursUntilTour = (date: { toDate?: () => Date } | Date): number => {
    const now = new Date();
    const tourDate = (date as { toDate?: () => Date }).toDate
      ? (date as { toDate: () => Date }).toDate()
      : new Date(date as Date);
    const diff = tourDate.getTime() - now.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
  };

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

  const getStatusBadge = (instance: TourInstance) => {
    switch (instance.status) {
      case 'at_risk':
        return (
          <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-bold">
            <Zap className="w-4 h-4" />
            ¡ÚLTIMOS CUPOS!
          </div>
        );
      case 'almost_full':
        return (
          <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-bold">
            <AlertCircle className="w-4 h-4" />
            Casi lleno
          </div>
        );
      case 'confirmed':
        return (
          <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-bold">
            <CheckCircle className="w-4 h-4" />
            Confirmado
          </div>
        );
      case 'full':
        return (
          <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-bold">
            <Users className="w-4 h-4" />
            Lleno
          </div>
        );
      default:
        return null;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facil':
        return 'text-green-600 bg-green-50';
      case 'moderado':
        return 'text-yellow-600 bg-yellow-50';
      case 'dificil':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getDurationLabel = (duration: string) => {
    switch (duration) {
      case 'horas':
        return 'Algunas horas';
      case 'medio_dia':
        return 'Medio día';
      case 'dia_completo':
        return 'Día completo';
      case 'multi_dia':
        return 'Varios días';
      default:
        return duration;
    }
  };

  const hasDiscount = selectedInstance?.dynamicPricing?.isActive;
  const discountPercentage = selectedInstance?.dynamicPricing?.discountPercentage || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con imagen */}
      <div className="relative h-96 bg-gray-900">
        <Image
          src={tour.images[0]}
          alt={tour.title}
          fill
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Botón volver */}
        <button
          onClick={() => router.push('/tours')}
          className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-lg hover:bg-white transition-all flex items-center gap-2 shadow-lg"
        >
          <ChevronLeft className="w-5 h-5" />
          Volver
        </button>

        {/* Título y rating */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{tour.title}</h1>
                <p className="text-white/90 text-lg mb-3">{tour.providerName}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-bold">{tour.rating}</span>
                    <span className="text-sm">({tour.reviewCount} reseñas)</span>
                  </div>
                  <div className="text-white/80 text-sm">
                    {tour.totalBookings} personas han tomado este tour
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Descripción */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Acerca de este tour</h2>
              <p className="text-gray-700 leading-relaxed">{tour.description}</p>
            </div>

            {/* Tags e información rápida */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Detalles</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mountain className={`w-5 h-5 ${getDifficultyColor(tour.difficulty).split(' ')[0]}`} />
                  <div>
                    <div className="text-sm text-gray-600">Dificultad</div>
                    <div className="font-semibold capitalize">{tour.difficulty}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-600" />
                  <div>
                    <div className="text-sm text-gray-600">Duración</div>
                    <div className="font-semibold">{getDurationLabel(tour.duration)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-600" />
                  <div>
                    <div className="text-sm text-gray-600">Tamaño del grupo</div>
                    <div className="font-semibold">
                      {tour.groupSize.min} - {tour.groupSize.max} personas
                    </div>
                  </div>
                </div>
                {tour.altitude && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-teal-600" />
                    <div>
                      <div className="text-sm text-gray-600">Altitud máxima</div>
                      <div className="font-semibold">{tour.altitude}m</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Qué incluye */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Qué incluye</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tour.includes.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>

              {tour.equipmentIncluded && tour.equipmentIncluded.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Package className="w-5 h-5 text-teal-600" />
                    Equipo incluido
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {tour.equipmentIncluded.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-teal-600 rounded-full" />
                        <span className="text-gray-700 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Requisitos */}
            {(tour.physicalRequirements || tour.requirements || tour.ageRestrictions) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  Requisitos y recomendaciones
                </h3>
                <div className="space-y-3">
                  {tour.physicalRequirements && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Condición física</h4>
                      <p className="text-gray-700">{tour.physicalRequirements}</p>
                    </div>
                  )}
                  {tour.ageRestrictions && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Restricciones de edad</h4>
                      <p className="text-gray-700">
                        {tour.ageRestrictions.min && `Mínimo ${tour.ageRestrictions.min} años`}
                        {tour.ageRestrictions.min && tour.ageRestrictions.max && ' - '}
                        {tour.ageRestrictions.max && `Máximo ${tour.ageRestrictions.max} años`}
                      </p>
                    </div>
                  )}
                  {tour.requirements && tour.requirements.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Qué traer</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {tour.requirements.map((req, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                            <span className="text-gray-700">{req}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Política de cancelación */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-600" />
                Política de cancelación: {tour.cancellationPolicy.name}
              </h3>
              <div className="space-y-2">
                {tour.cancellationPolicy.rules.map((rule, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{rule.description}</span>
                  </div>
                ))}
                {tour.cancellationPolicy.autoRefundIfCancelled && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600 flex items-start gap-2">
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>
                        Si el tour se cancela por falta de cupos mínimos, se realizará un reembolso
                        automático del 100%.
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Columna lateral - Calendario y reserva */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              {/* Card de precio */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                {hasDiscount && selectedInstance ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-red-600 text-white px-3 py-1 rounded-full font-bold text-sm flex items-center gap-1">
                        <TrendingDown className="w-4 h-4" />
                        -{discountPercentage}% OFF
                      </div>
                      {getStatusBadge(selectedInstance)}
                    </div>
                    <div className="text-2xl text-gray-500 line-through mb-1">
                      ${selectedInstance.originalPrice?.toLocaleString('es-CL')}
                    </div>
                    <div className="text-4xl font-bold text-red-600 mb-1">
                      ${selectedInstance.pricePerPerson.toLocaleString('es-CL')}
                    </div>
                    <div className="text-gray-600 mb-4">por persona</div>

                    {/* Bonus incentives */}
                    {selectedInstance.dynamicPricing?.bonusIncentives &&
                      selectedInstance.dynamicPricing.bonusIncentives.length > 0 && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center gap-2 text-yellow-800 font-semibold mb-2">
                            <Gift className="w-5 h-5" />
                            Bonos incluidos:
                          </div>
                          {selectedInstance.dynamicPricing.bonusIncentives.map((bonus, index) => (
                            <div key={index} className="flex items-center gap-2 text-yellow-700">
                              <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full" />
                              <span className="text-sm">{bonus}</span>
                            </div>
                          ))}
                        </div>
                      )}

                    {/* Urgencia */}
                    {selectedInstance.dynamicPricing && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-red-700 text-sm">
                          <Zap className="w-4 h-4" />
                          <span className="font-semibold">
                            ¡Sale en {getHoursUntilTour(selectedInstance.date)}h!
                          </span>
                        </div>
                        <p className="text-xs text-red-600 mt-1">
                          Este tour necesita {selectedInstance.minParticipants - selectedInstance.bookedSpots} personas más
                          para confirmarse
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Desde</div>
                    <div className="text-4xl font-bold text-gray-900 mb-1">
                      ${tour.basePrice.toLocaleString('es-CL')}
                    </div>
                    <div className="text-gray-600 mb-4">por persona</div>
                    {selectedInstance && getStatusBadge(selectedInstance)}
                  </div>
                )}
              </div>

              {/* Calendario de instancias */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-600" />
                  Próximas salidas
                </h3>

                <div className="space-y-3">
                  {tour.instances.map((instance) => {
                    const isSelected = selectedInstance?.id === instance.id;
                    const instanceHasDiscount = instance.dynamicPricing?.isActive;
                    const hoursUntil = getHoursUntilTour(instance.date);

                    return (
                      <button
                        key={instance.id}
                        onClick={() => setSelectedInstance(instance)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50'
                            : 'border-gray-200 hover:border-teal-300 bg-white'
                        } ${instance.status === 'full' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={instance.status === 'full'}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">
                              {formatDate(instance.date)}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                              <Clock className="w-4 h-4" />
                              {instance.startTime} - {instance.endTime}
                            </div>
                          </div>
                          {instanceHasDiscount && (
                            <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                              -{instance.dynamicPricing?.discountPercentage}%
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>
                              {instance.availableSpots} de {instance.capacity} disponibles
                            </span>
                          </div>
                          {instance.status === 'at_risk' && (
                            <div className="text-xs text-red-600 font-semibold">
                              ¡{hoursUntil}h!
                            </div>
                          )}
                        </div>

                        {instanceHasDiscount && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className="text-sm">
                              <span className="text-gray-500 line-through">
                                ${instance.originalPrice?.toLocaleString('es-CL')}
                              </span>
                              <span className="ml-2 text-red-600 font-bold">
                                ${instance.pricePerPerson.toLocaleString('es-CL')}
                              </span>
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botón de reserva */}
              {selectedInstance && (
                <button
                  onClick={() => {
                    router.push(`/tours/${tourId}/book?instance=${selectedInstance.id}`);
                  }}
                  disabled={selectedInstance.status === 'full'}
                  className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
                    selectedInstance.status === 'full'
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : hasDiscount
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl animate-pulse'
                      : 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {selectedInstance.status === 'full' ? 'Tour Lleno' : '¡Reservar ahora!'}
                </button>
              )}

              {/* Punto de encuentro */}
              {selectedInstance?.meetingPoint && (
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-teal-600" />
                    Punto de encuentro
                  </h4>
                  <p className="text-gray-700 text-sm">{selectedInstance.meetingPoint.address}</p>
                  {selectedInstance.meetingPoint.instructions && (
                    <p className="text-gray-600 text-sm mt-1">
                      {selectedInstance.meetingPoint.instructions}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
