'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '../../components/header';
import {
  Star,
  Clock,
  Calendar,
  MapPin,
  Users,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Zap,
  Gift,
  Filter,
  Search,
} from 'lucide-react';
import { MOCK_TOURS } from '@/lib/seeds/toursSeed';
import { Tour, TourInstance } from '@/types/tours';
import { TourCategory } from '@/types/marketplace';

// Categorías de tours
const TOUR_CATEGORIES = [
  { value: 'all', label: 'Todos', icon: '🌟' },
  { value: 'astronomico', label: 'Astronómico', icon: '🌌' },
  { value: 'geisers_tatio', label: 'Géisers del Tatio', icon: '🌋' },
  { value: 'lagunas_altiplanicas', label: 'Lagunas', icon: '🏔️' },
  { value: 'valle_luna_muerte', label: 'Valle de la Luna', icon: '🌙' },
  { value: 'salar_atacama', label: 'Salar de Atacama', icon: '🧂' },
  { value: 'sandboarding', label: 'Sandboarding', icon: '🏂' },
  { value: 'trekking_aventura', label: 'Trekking', icon: '🥾' },
];

const DIFFICULTY_FILTERS = [
  { value: 'all', label: 'Todas' },
  { value: 'facil', label: 'Fácil' },
  { value: 'moderado', label: 'Moderado' },
  { value: 'dificil', label: 'Difícil' },
];

export default function ToursPage() {
  const router = useRouter();
  const [tours, setTours] = useState(MOCK_TOURS);
  const [filteredTours, setFilteredTours] = useState(MOCK_TOURS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    applyFilters();
  }, [selectedCategory, selectedDifficulty, searchQuery]);

  const applyFilters = () => {
    let filtered = tours;

    // Filtro por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tour => tour.category === selectedCategory);
    }

    // Filtro por dificultad
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(tour => tour.difficulty === selectedDifficulty);
    }

    // Filtro por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        tour =>
          tour.title.toLowerCase().includes(query) ||
          tour.description.toLowerCase().includes(query)
      );
    }

    setFilteredTours(filtered);
  };

  // Obtener el badge de estado
  const getStatusBadge = (instance: TourInstance) => {
    switch (instance.status) {
      case 'at_risk':
        return (
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
            <Zap className="w-3 h-3" />
            ¡ÚLTIMOS CUPOS!
          </div>
        );
      case 'almost_full':
        return (
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
            <AlertCircle className="w-3 h-3" />
            Casi lleno
          </div>
        );
      case 'confirmed':
        return (
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
            <CheckCircle className="w-3 h-3" />
            Confirmado
          </div>
        );
      case 'full':
        return (
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
            Lleno
          </div>
        );
      default:
        return null;
    }
  };

  // Calcular horas hasta el tour
  const getHoursUntilTour = (date: { toDate?: () => Date } | Date): number => {
    const now = new Date();
    const tourDate = (date as { toDate?: () => Date }).toDate ? (date as { toDate: () => Date }).toDate() : new Date(date as Date);
    const diff = tourDate.getTime() - now.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
  };

  // Obtener el badge de dificultad
  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      facil: 'bg-green-100 text-green-700',
      moderado: 'bg-yellow-100 text-yellow-700',
      dificil: 'bg-red-100 text-red-700',
      extremo: 'bg-purple-100 text-purple-700',
    };

    const labels = {
      facil: 'Fácil',
      moderado: 'Moderado',
      dificil: 'Difícil',
      extremo: 'Extremo',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[difficulty as keyof typeof colors]}`}>
        {labels[difficulty as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            ¿Qué Hacer en San Pedro de Atacama?
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Descubre experiencias únicas en el desierto más seco del mundo. Tours con descuentos de último minuto.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          {/* Búsqueda y toggle filtros */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar tours..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filtros
            </button>
          </div>

          {/* Filtros expandidos */}
          {showFilters && (
            <div className="space-y-4 pb-4">
              {/* Categorías */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Categoría</label>
                <div className="flex flex-wrap gap-2">
                  {TOUR_CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === cat.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dificultad */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Dificultad</label>
                <div className="flex gap-2">
                  {DIFFICULTY_FILTERS.map(diff => (
                    <button
                      key={diff.value}
                      onClick={() => setSelectedDifficulty(diff.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedDifficulty === diff.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {diff.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tours Grid */}
      <div className="container mx-auto px-4 py-12">
        {filteredTours.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No se encontraron tours
            </h2>
            <p className="text-gray-600 mb-6">
              Intenta con otros filtros o términos de búsqueda
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedDifficulty('all');
                setSearchQuery('');
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTours.map(tour => {
              // Obtener la próxima instancia disponible
              const nextInstance = tour.instances && tour.instances.length > 0
                ? tour.instances[0]
                : null;

              const hoursUntil = nextInstance ? getHoursUntilTour(nextInstance.date) : 0;
              const hasDiscount = nextInstance?.dynamicPricing?.isActive;
              const discountPercentage = nextInstance?.dynamicPricing?.discountPercentage || 0;

              return (
                <div
                  key={tour.id}
                  onClick={() => router.push(`/tours/${tour.id}`)}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                >
                  {/* Imagen */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={tour.images[0]}
                      alt={tour.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />

                    {/* Badge de descuento */}
                    {hasDiscount && (
                      <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-2 rounded-lg font-bold shadow-lg animate-pulse">
                        <div className="flex items-center gap-1">
                          <TrendingDown className="w-4 h-4" />
                          -{discountPercentage}%
                        </div>
                      </div>
                    )}

                    {/* Badge de estado */}
                    {nextInstance && (
                      <div className="absolute top-3 left-3">
                        {getStatusBadge(nextInstance)}
                      </div>
                    )}

                    {/* Featured badge */}
                    {tour.featured && (
                      <div className="absolute bottom-3 left-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        ⭐ Destacado
                      </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="p-5">
                    {/* Categoría y dificultad */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-blue-600 font-semibold uppercase">
                        {TOUR_CATEGORIES.find(c => c.value === tour.category)?.label || tour.category}
                      </span>
                      {getDifficultyBadge(tour.difficulty)}
                    </div>

                    {/* Título */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {tour.title}
                    </h3>

                    {/* Descripción */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {tour.description}
                    </p>

                    {/* Detalles */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-gray-400" />
                        Duración: {tour.duration === 'horas' ? '2-4h' : tour.duration === 'medio_dia' ? 'Medio día' : tour.duration === 'dia_completo' ? 'Día completo' : 'Varios días'}
                      </div>

                      {nextInstance && (
                        <>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            Próxima salida: {(() => {
                              const date = (nextInstance.date as { toDate?: () => Date }).toDate
                                ? (nextInstance.date as { toDate: () => Date }).toDate()
                                : new Date(nextInstance.date as Date);
                              return date.toLocaleDateString('es-CL', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              });
                            })()} {nextInstance.startTime}
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="w-4 h-4 text-gray-400" />
                            {nextInstance.availableSpots} cupos disponibles de {nextInstance.capacity}
                          </div>

                          {/* Urgencia */}
                          {hoursUntil < 48 && nextInstance.status === 'at_risk' && (
                            <div className="flex items-center gap-2 text-sm text-red-600 font-semibold">
                              <Zap className="w-4 h-4" />
                              ¡Sale en {hoursUntil}h! Reserva ahora
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Bonus incentives */}
                    {hasDiscount && nextInstance?.dynamicPricing?.bonusIncentives && nextInstance.dynamicPricing.bonusIncentives.length > 0 && (
                      <div className="mb-4 p-2 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-2">
                          <Gift className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-blue-700">
                            <span className="font-semibold">Bonus: </span>
                            {nextInstance.dynamicPricing.bonusIncentives.join(', ')}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(tour.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {tour.rating.toFixed(1)} ({tour.reviewCount} reseñas)
                      </span>
                    </div>

                    {/* Precio */}
                    <div className="flex items-center justify-between">
                      <div>
                        {hasDiscount && nextInstance ? (
                          <div>
                            <div className="text-sm text-gray-500 line-through">
                              ${nextInstance.originalPrice?.toLocaleString('es-CL')}
                            </div>
                            <div className="text-2xl font-bold text-red-600">
                              ${nextInstance.pricePerPerson.toLocaleString('es-CL')}
                              <span className="text-sm text-gray-600 font-normal"> /persona</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-2xl font-bold text-gray-900">
                            ${tour.basePrice.toLocaleString('es-CL')}
                            <span className="text-sm text-gray-600 font-normal"> /persona</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/tours/${tour.id}`);
                        }}
                        className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                          hasDiscount
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {hasDiscount ? '¡Reserva ahora!' : 'Ver detalles'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-12 text-center text-gray-600">
          Mostrando {filteredTours.length} de {tours.length} tours
        </div>
      </div>
    </div>
  );
}
