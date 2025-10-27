'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MockProviderService } from '@/lib/services/mockProviderService';
import { MockConversionLog, ProviderType } from '@/types/provider';
import { Timestamp } from 'firebase/firestore';
import {
  Activity,
  TrendingUp,
  Clock,
  Users,
  Search,
  Eye,
  Filter,
  Calendar,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ConversionsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [conversions, setConversions] = useState<MockConversionLog[]>([]);
  const [filteredConversions, setFilteredConversions] = useState<MockConversionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<ProviderType | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | '7d' | '30d' | '90d'>('all');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({
    totalConversions: 0,
    conversionRate: 0,
    avgTimeToClaimDays: 0,
    recentConversions: 0,
  });

  useEffect(() => {
    if (user) {
      loadConversions();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedType, dateFilter, conversions]);

  const loadConversions = async () => {
    setLoading(true);
    try {
      const logs = await MockProviderService.getConversionLogs();
      setConversions(logs);
      calculateStats(logs);
    } catch (error) {
      console.error('Error loading conversions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = async (logs: MockConversionLog[]) => {
    const totalConversions = logs.length;

    // Get total mocks to calculate conversion rate
    const allMocks = await MockProviderService.getAllMocks();
    const conversionRate = allMocks.length > 0
      ? (totalConversions / allMocks.length) * 100
      : 0;

    // Calculate average time to claim (mock creation to claim)
    let totalDays = 0;
    let validCount = 0;

    logs.forEach(log => {
      const mockCreatedAt = log.mockSnapshot.createdAt instanceof Date
        ? log.mockSnapshot.createdAt
        : log.mockSnapshot.createdAt.toDate();

      const claimedAt = log.convertedAt instanceof Date
        ? log.convertedAt
        : log.convertedAt.toDate();

      const diffDays = Math.ceil(
        (claimedAt.getTime() - mockCreatedAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays >= 0) {
        totalDays += diffDays;
        validCount++;
      }
    });

    const avgTimeToClaimDays = validCount > 0 ? totalDays / validCount : 0;

    // Recent conversions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentConversions = logs.filter(log => {
      const claimedAt = log.convertedAt instanceof Date
        ? log.convertedAt
        : log.convertedAt.toDate();
      return claimedAt >= sevenDaysAgo;
    }).length;

    setStats({
      totalConversions,
      conversionRate,
      avgTimeToClaimDays,
      recentConversions,
    });
  };

  const applyFilters = () => {
    let filtered = [...conversions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.mockSnapshot.businessInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.mockSnapshot.personalInfo.displayName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(log => log.mockSnapshot.type === selectedType);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
      const days = daysMap[dateFilter];
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(log => {
        const claimedAt = log.convertedAt instanceof Date
          ? log.convertedAt
          : log.convertedAt.toDate();
        return claimedAt >= cutoffDate;
      });
    }

    setFilteredConversions(filtered);
  };

  const getProviderTypeLabel = (type: ProviderType): string => {
    const labels: Record<ProviderType, string> = {
      cook: 'Cocinero',
      driver: 'Chofer',
      tour_guide: 'Guía Turístico',
      artisan: 'Artesano',
      transport: 'Transporte',
      service: 'Servicio',
      other: 'Otro',
    };
    return labels[type];
  };

  const getProviderTypeColor = (type: ProviderType): string => {
    const colors: Record<ProviderType, string> = {
      cook: 'bg-orange-100 text-orange-800',
      driver: 'bg-blue-100 text-blue-800',
      tour_guide: 'bg-green-100 text-green-800',
      artisan: 'bg-purple-100 text-purple-800',
      transport: 'bg-indigo-100 text-indigo-800',
      service: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[type];
  };

  const formatDate = (date: Date | Timestamp): string => {
    const d = date instanceof Date ? date : date.toDate();
    return d.toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleExpanded = (logId: string) => {
    setExpandedLog(expandedLog === logId ? null : logId);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Debes iniciar sesión como administrador</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard de Conversiones
          </h1>
          <p className="text-gray-600">
            Monitorea las conversiones de mock providers a proveedores reales
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Conversiones</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalConversions}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Tasa de Conversión</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.conversionRate.toFixed(1)}%
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Tiempo Promedio</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.avgTimeToClaimDays.toFixed(1)}
              <span className="text-base text-gray-600 ml-1">días</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Últimos 7 Días</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.recentConversions}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por negocio o proveedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as ProviderType | 'all')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">Todos los tipos</option>
                <option value="cook">Cocinero</option>
                <option value="driver">Chofer</option>
                <option value="tour_guide">Guía Turístico</option>
                <option value="artisan">Artesano</option>
                <option value="transport">Transporte</option>
                <option value="service">Servicio</option>
                <option value="other">Otro</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as 'all' | '7d' | '30d' | '90d')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">Todo el período</option>
                <option value="7d">Últimos 7 días</option>
                <option value="30d">Últimos 30 días</option>
                <option value="90d">Últimos 90 días</option>
              </select>
            </div>
          </div>
        </div>

        {/* Conversions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Cargando conversiones...</p>
            </div>
          ) : filteredConversions.length === 0 ? (
            <div className="p-12 text-center">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm || selectedType !== 'all' || dateFilter !== 'all'
                  ? 'No se encontraron conversiones con los filtros aplicados'
                  : 'Aún no hay conversiones registradas'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Negocio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reclamado por
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredConversions.map((log) => (
                    <>
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {log.mockSnapshot.businessInfo.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {log.mockSnapshot.personalInfo.displayName}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getProviderTypeColor(
                              log.mockSnapshot.type
                            )}`}
                          >
                            {getProviderTypeLabel(log.mockSnapshot.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">
                            {log.convertedBy.substring(0, 8)}...
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">
                            {formatDate(log.convertedAt)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleExpanded(log.id!)}
                              className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                              {expandedLog === log.id ? (
                                <>
                                  <ChevronUp className="w-4 h-4" />
                                  <span className="text-sm">Ocultar</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4" />
                                  <span className="text-sm">Ver detalles</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() =>
                                router.push(`/admin/approvals?provider=${log.realProviderId}`)
                              }
                              className="text-gray-600 hover:text-gray-700 flex items-center gap-1"
                              title="Ver proveedor"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Details Row */}
                      {expandedLog === log.id && (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 bg-gray-50">
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <Activity className="w-4 h-4" />
                                  Cambios Realizados
                                </h4>
                                {log.changes && log.changes.length > 0 ? (
                                  <div className="space-y-2">
                                    {log.changes.map((change, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center gap-3 text-sm bg-white p-3 rounded-lg"
                                      >
                                        <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <div className="flex-1">
                                          <span className="font-medium text-gray-700">
                                            {change.field}:
                                          </span>
                                          <span className="text-red-600 line-through ml-2">
                                            {String(change.oldValue)}
                                          </span>
                                          <ArrowRight className="w-3 h-3 inline mx-2 text-gray-400" />
                                          <span className="text-green-600 font-medium">
                                            {String(change.newValue)}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-600">
                                    No se registraron cambios específicos
                                  </p>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">
                                    Información del Mock
                                  </h4>
                                  <dl className="space-y-1 text-sm">
                                    <div>
                                      <dt className="text-gray-600 inline">Mock ID:</dt>
                                      <dd className="text-gray-900 inline ml-2">
                                        {log.mockProviderId}
                                      </dd>
                                    </div>
                                    <div>
                                      <dt className="text-gray-600 inline">Email:</dt>
                                      <dd className="text-gray-900 inline ml-2">
                                        {log.mockSnapshot.personalInfo.email}
                                      </dd>
                                    </div>
                                    <div>
                                      <dt className="text-gray-600 inline">Teléfono:</dt>
                                      <dd className="text-gray-900 inline ml-2">
                                        {log.mockSnapshot.personalInfo.phone || 'N/A'}
                                      </dd>
                                    </div>
                                  </dl>
                                </div>

                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">
                                    Información de Conversión
                                  </h4>
                                  <dl className="space-y-1 text-sm">
                                    <div>
                                      <dt className="text-gray-600 inline">Provider ID:</dt>
                                      <dd className="text-gray-900 inline ml-2">
                                        {log.realProviderId}
                                      </dd>
                                    </div>
                                    <div>
                                      <dt className="text-gray-600 inline">Invitación:</dt>
                                      <dd className="text-gray-900 inline ml-2">
                                        {log.invitationId}
                                      </dd>
                                    </div>
                                    <div>
                                      <dt className="text-gray-600 inline">Usuario:</dt>
                                      <dd className="text-gray-900 inline ml-2">
                                        {log.convertedBy}
                                      </dd>
                                    </div>
                                  </dl>
                                </div>
                              </div>

                              {log.mockSnapshot.services.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">
                                    Servicios Pre-configurados ({log.mockSnapshot.services.length})
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {log.mockSnapshot.services.map((service, idx) => (
                                      <div
                                        key={idx}
                                        className="bg-white p-3 rounded-lg border border-gray-200"
                                      >
                                        <p className="font-medium text-gray-900 text-sm">
                                          {service.name}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">
                                          ${service.price.toLocaleString('es-CL')} {service.currency}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Footer */}
        {filteredConversions.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>
                  Mostrando <strong>{filteredConversions.length}</strong> de{' '}
                  <strong>{conversions.length}</strong> conversiones
                </span>
              </div>
              {(searchTerm || selectedType !== 'all' || dateFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedType('all');
                    setDateFilter('all');
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
