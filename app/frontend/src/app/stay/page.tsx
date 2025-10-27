'use client';

import { useState, useEffect } from 'react';
import { StayService } from '@/lib/services/stayService';
import { Stay, StaySearchFilters, StayType } from '@/types/stay';
import { Header } from '@/components/header';
import Link from 'next/link';
import {
  Search,
  Users,
  MapPin,
  Star,
  Wifi,
  Car,
  UtensilsCrossed,
  Home,
  Tent,
  Building,
  AlertCircle,
} from 'lucide-react';

export default function StayPage() {
  const [stays, setStays] = useState<Stay[]>([]);
  const [filteredStays, setFilteredStays] = useState<Stay[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filters, setFilters] = useState<StaySearchFilters>({
    guests: 2,
    sortBy: 'popular',
  });

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadStays();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [stays, filters, searchTerm]);

  const loadStays = async () => {
    setLoading(true);
    try {
      const allStays = await StayService.getAll();
      setStays(allStays);
    } catch (error) {
      console.error('Error loading stays:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    let filtered = [...stays];

    // Aplicar filtros
    if (searchTerm) {
      filtered = filtered.filter(
        stay =>
          stay.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stay.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stay.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Aplicar filtros del servicio
    const resultsFromService = await StayService.search(filters);
    const serviceIds = new Set(resultsFromService.map(s => s.id));
    filtered = filtered.filter(stay => serviceIds.has(stay.id));

    setFilteredStays(filtered);
  };

  const getTypeIcon = (type: StayType) => {
    switch (type) {
      case 'camping':
        return <Tent className="w-5 h-5" />;
      case 'glamping':
        return <Home className="w-5 h-5" />;
      case 'hotel':
      case 'hostel':
        return <Building className="w-5 h-5" />;
      default:
        return <Home className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: StayType): string => {
    const labels: Record<StayType, string> = {
      camping: 'Camping',
      glamping: 'Glamping',
      lodge: 'Lodge',
      cabin: 'Cabaña',
      dome: 'Domo',
      hostel: 'Hostal',
      hotel: 'Hotel',
      hybrid: 'Camping + Lodge',
      unique: 'Único',
    };
    return labels[type];
  };

  const getMinPrice = (stay: Stay): number => {
    if (stay.isHybrid && stay.spaceTypes) {
      return Math.min(...stay.spaceTypes.map(space => space.pricing.basePrice));
    }
    return stay.pricing?.basePrice || 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-16 mt-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            🏕️ ¿Dónde Quedarse?
          </h1>
          <p className="text-xl text-teal-100">
            Descubre glampings, campings y lugares únicos para vivir el desierto de Atacama
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white shadow-md sticky top-16 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar alojamiento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Guests */}
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filters.guests || 2}
                onChange={(e) =>
                  setFilters(prev => ({ ...prev, guests: Number(e.target.value) }))
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none"
              >
                <option value={1}>1 huésped</option>
                <option value={2}>2 huéspedes</option>
                <option value={3}>3 huéspedes</option>
                <option value={4}>4 huéspedes</option>
                <option value={5}>5+ huéspedes</option>
              </select>
            </div>

            {/* Type */}
            <div>
              <select
                value={filters.types?.[0] || 'all'}
                onChange={(e) =>
                  setFilters(prev => ({
                    ...prev,
                    types: e.target.value === 'all' ? undefined : [e.target.value as StayType],
                  }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none"
              >
                <option value="all">Todos los tipos</option>
                <option value="camping">Camping</option>
                <option value="glamping">Glamping</option>
                <option value="lodge">Lodge</option>
                <option value="cabin">Cabaña</option>
                <option value="dome">Domo</option>
                <option value="hybrid">Híbrido</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={filters.sortBy || 'popular'}
                onChange={(e) =>
                  setFilters(prev => ({
                    ...prev,
                    sortBy: e.target.value as StaySearchFilters['sortBy'],
                  }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none"
              >
                <option value="popular">Más populares</option>
                <option value="price_asc">Precio: Menor a mayor</option>
                <option value="price_desc">Precio: Mayor a menor</option>
                <option value="rating">Mejor valorados</option>
                <option value="distance">Más cercanos</option>
              </select>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() =>
                setFilters(prev => ({
                  ...prev,
                  petFriendly: !prev.petFriendly,
                }))
              }
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filters.petFriendly
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🐕 Pet friendly
            </button>
            <button
              onClick={() =>
                setFilters(prev => ({
                  ...prev,
                  instantBooking: !prev.instantBooking,
                }))
              }
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filters.instantBooking
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ⚡ Reserva instantánea
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <p className="mt-4 text-gray-600">Cargando alojamientos...</p>
          </div>
        ) : filteredStays.length === 0 ? (
          <div className="text-center py-12">
            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">
              No se encontraron alojamientos con los filtros seleccionados
            </p>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              {filteredStays.length} alojamiento{filteredStays.length !== 1 ? 's' : ''}{' '}
              disponible{filteredStays.length !== 1 ? 's' : ''}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStays.map(stay => (
                <Link
                  key={stay.id}
                  href={`/stay/${stay.id}`}
                  className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={stay.photos[0] || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop'}
                      alt={stay.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {stay.featured && (
                      <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        ⭐ Destacado
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Type & Location */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        {getTypeIcon(stay.type)}
                        <span>{getTypeLabel(stay.type)}</span>
                      </div>
                      {stay.rating > 0 && (
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{stay.rating.toFixed(1)}</span>
                          <span className="text-gray-500">({stay.reviewCount})</span>
                        </div>
                      )}
                    </div>

                    {/* Name */}
                    <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                      {stay.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {stay.shortDescription || stay.description}
                    </p>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {stay.neighborhood || 'San Pedro de Atacama'} • {stay.distanceToCenter} km del centro
                      </span>
                    </div>

                    {/* Important Info Alert */}
                    {(stay.importantInfo.transportationNeeded || stay.importantInfo.bringYourFood) && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                          <div className="text-xs text-orange-800">
                            {stay.importantInfo.transportationNeeded && (
                              <div className="flex items-center gap-1 mb-1">
                                <Car className="w-3 h-3" />
                                <span>Se recomienda vehículo propio</span>
                              </div>
                            )}
                            {stay.importantInfo.bringYourFood && (
                              <div className="flex items-center gap-1">
                                <UtensilsCrossed className="w-3 h-3" />
                                <span>Traer tu propia comida (cocina disponible)</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Amenities Preview */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {stay.amenities.includes('WiFi') && (
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <Wifi className="w-3 h-3" />
                          WiFi
                        </span>
                      )}
                      {stay.amenities.includes('Estacionamiento') && (
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <Car className="w-3 h-3" />
                          Parking
                        </span>
                      )}
                      {stay.amenities.slice(0, 2).length < stay.amenities.length && (
                        <span className="text-xs text-gray-500">
                          +{stay.amenities.length - 2} más
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-end justify-between pt-3 border-t">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">
                          ${getMinPrice(stay).toLocaleString('es-CL')}
                        </span>
                        <span className="text-sm text-gray-600 ml-1">/ noche</span>
                      </div>
                      <div className="text-sm text-teal-600 font-medium group-hover:underline">
                        Ver detalles →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
