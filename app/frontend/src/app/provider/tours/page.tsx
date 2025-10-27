'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Plus,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  Zap,
  Filter,
  Search,
} from 'lucide-react';
import { Tour, TourInstance } from '@/types/tours';
import { MOCK_TOURS } from '@/lib/seeds/toursSeed';

export default function ProviderToursPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Mock provider ID - in real app, get from user profile
  const providerId = 'provider-astro-1';

  const [tours, setTours] = useState<(Tour & { instances: TourInstance[] })[]>([]);
  const [filteredInstances, setFilteredInstances] = useState<
    (TourInstance & { tourTitle: string })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProviderTours();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tours, filterStatus, searchQuery]);

  const loadProviderTours = async () => {
    try {
      // TODO: Replace with actual API call
      const providerTours = MOCK_TOURS.filter((t) => t.providerId === providerId);
      setTours(providerTours);
    } catch (error) {
      console.error('Error loading tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let instances: (TourInstance & { tourTitle: string })[] = [];

    // Flatten all instances from all tours
    tours.forEach((tour) => {
      tour.instances.forEach((instance) => {
        instances.push({
          ...instance,
          tourTitle: tour.title,
        });
      });
    });

    // Filter by status
    if (filterStatus !== 'all') {
      instances = instances.filter((i) => i.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      instances = instances.filter((i) => i.tourTitle.toLowerCase().includes(query));
    }

    // Sort by date (upcoming first)
    instances.sort((a, b) => {
      const dateA = (a.date as { toDate?: () => Date }).toDate
        ? (a.date as { toDate: () => Date }).toDate()
        : new Date(a.date as Date);
      const dateB = (b.date as { toDate?: () => Date }).toDate
        ? (b.date as { toDate: () => Date }).toDate()
        : new Date(b.date as Date);
      return dateA.getTime() - dateB.getTime();
    });

    setFilteredInstances(instances);
  };

  const formatDate = (date: { toDate?: () => Date } | Date): string => {
    const d = (date as { toDate?: () => Date }).toDate
      ? (date as { toDate: () => Date }).toDate()
      : new Date(date as Date);
    return d.toLocaleDateString('es-CL', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'at_risk':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
            <Zap className="w-3 h-3" />
            En riesgo
          </span>
        );
      case 'almost_full':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
            <AlertCircle className="w-3 h-3" />
            Casi lleno
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
            <CheckCircle className="w-3 h-3" />
            Confirmado
          </span>
        );
      case 'full':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
            <Users className="w-3 h-3" />
            Lleno
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
            <CheckCircle className="w-3 h-3" />
            Completado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
            Programado
          </span>
        );
    }
  };

  const calculateStats = () => {
    let totalRevenue = 0;
    let totalBookings = 0;
    let upcomingInstances = 0;
    let atRiskInstances = 0;

    tours.forEach((tour) => {
      tour.instances.forEach((instance) => {
        const instanceDate = (instance.date as { toDate?: () => Date }).toDate
          ? (instance.date as { toDate: () => Date }).toDate()
          : new Date(instance.date as Date);

        if (instanceDate > new Date()) {
          upcomingInstances++;
          if (instance.status === 'at_risk') {
            atRiskInstances++;
          }
        }

        totalBookings += instance.bookedSpots;
        totalRevenue += instance.bookedSpots * instance.pricePerPerson;
      });
    });

    return { totalRevenue, totalBookings, upcomingInstances, atRiskInstances };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Tours</h1>
              <p className="text-gray-600">Administra tus tours, instancias y reservas</p>
            </div>
            <button
              onClick={() => router.push('/provider/tours/create')}
              className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Crear instancia
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Ingresos totales</span>
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                ${stats.totalRevenue.toLocaleString('es-CL')}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Reservas totales</span>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalBookings}</div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Tours próximos</span>
                <Calendar className="w-5 h-5 text-teal-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.upcomingInstances}</div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Tours en riesgo</span>
                <Zap className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600">{stats.atRiskInstances}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar tour..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="at_risk">En riesgo</option>
                <option value="almost_full">Casi lleno</option>
                <option value="confirmed">Confirmado</option>
                <option value="full">Lleno</option>
                <option value="completed">Completado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tours list */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tour
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Fecha y hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Cupos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ingresos
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInstances.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Calendar className="w-12 h-12 text-gray-400 mb-3" />
                        <p className="text-gray-600 mb-2">No se encontraron instancias</p>
                        <button
                          onClick={() => router.push('/provider/tours/create')}
                          className="text-teal-600 hover:text-teal-700 font-semibold"
                        >
                          Crear primera instancia
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInstances.map((instance) => {
                    const revenue = instance.bookedSpots * instance.pricePerPerson;
                    const fillPercentage = (instance.bookedSpots / instance.capacity) * 100;

                    return (
                      <tr key={instance.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{instance.tourTitle}</div>
                          {instance.dynamicPricing?.isActive && (
                            <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                              <TrendingUp className="w-3 h-3" />
                              Descuento activo -{instance.dynamicPricing.discountPercentage}%
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{formatDate(instance.date)}</div>
                          <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                            <Clock className="w-3 h-3" />
                            {instance.startTime} - {instance.endTime}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 font-semibold">
                            {instance.bookedSpots} / {instance.capacity}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                fillPercentage >= 80
                                  ? 'bg-green-600'
                                  : fillPercentage >= 50
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${fillPercentage}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">
                            ${instance.pricePerPerson.toLocaleString('es-CL')}
                          </div>
                          {instance.originalPrice && (
                            <div className="text-xs text-gray-500 line-through">
                              ${instance.originalPrice.toLocaleString('es-CL')}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(instance.status)}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-green-600">
                            ${revenue.toLocaleString('es-CL')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                router.push(`/provider/tours/instance/${instance.id}`)
                              }
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ver detalles"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => router.push(`/provider/tours/edit/${instance.id}`)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  confirm('¿Estás seguro de cancelar esta instancia del tour?')
                                ) {
                                  // TODO: Cancel instance
                                  alert('Funcionalidad de cancelación próximamente');
                                }
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Cancelar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        {filteredInstances.length > 0 && (
          <div className="mt-6 text-center text-gray-600">
            Mostrando {filteredInstances.length} instancia
            {filteredInstances.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
