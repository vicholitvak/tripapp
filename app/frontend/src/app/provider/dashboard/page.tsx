'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { BarChart3, TrendingUp, Calendar, Star, DollarSign, AlertCircle } from 'lucide-react';
import ProviderLayout from '@/components/provider/ProviderLayout';
import { ModernCard as Card } from '@/components/ui/modern-card';
import { Provider } from '@/types/provider';
import { ProviderService } from '@/lib/services/providerService';
import { OrderService } from '@/lib/services/orderService';
import { EarningsService } from '@/lib/services/earningsService';

interface DashboardStats {
  totalListings: number;
  activeOrders: number;
  totalEarnings: number;
  averageRating: number;
  totalReviews: number;
  completedOrders: number;
}

export default function ProviderDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // Try to get provider info from Firestore
        let providerData: Provider | null = null;
        try {
          providerData = await ProviderService.getByUserId(user.uid);
        } catch (firebaseErr) {
          console.warn('Firebase error loading provider (likely permissions):', firebaseErr);
          // Use mock data for demo purposes
          providerData = {
            userId: user.uid,
            accountType: 'real',
            type: 'cook',
            status: 'active',
            personalInfo: {
              displayName: user.displayName || 'Chef',
              phone: '+56912345678',
              email: user.email || '',
              bio: 'Experienced chef specializing in Chilean cuisine',
            },
            businessInfo: {
              name: 'Mi Restaurante',
              description: 'Delicious homemade meals',
              category: 'Cocina',
              address: 'Santiago, Chile',
              photos: [],
            },
            services: [
              {
                id: '1',
                name: 'Clases de Cocina',
                description: 'Clases personalizadas de cocina chilena',
                price: 45000,
                currency: 'CLP',
                duration: '2 horas',
                active: true,
              },
            ],
            rating: 4.8,
            reviewCount: 12,
            completedOrders: 8,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }

        if (!providerData) {
          setError('No provider profile found. Please complete your onboarding first.');
          return;
        }
        setProvider(providerData);

        // Load stats
        const services = providerData.services || [];
        const completedOrders = providerData.completedOrders || 0;
        const rating = providerData.rating || 0;
        const reviewCount = providerData.reviewCount || 0;

        const dashboardStats: DashboardStats = {
          totalListings: services.length,
          activeOrders: 0, // TODO: Load from OrderService
          totalEarnings: 0, // TODO: Load from EarningsService
          averageRating: rating,
          totalReviews: reviewCount,
          completedOrders: completedOrders,
        };

        setStats(dashboardStats);
      } catch (err) {
        console.error('Error loading dashboard:', err);
        setError('Error loading dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (!user) {
        router.push('/signin');
        return;
      }
      loadDashboardData();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <ProviderLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
      </ProviderLayout>
    );
  }

  if (error) {
    return (
      <ProviderLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-600 font-semibold">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Ir al inicio
            </button>
          </div>
        </div>
      </ProviderLayout>
    );
  }

  return (
    <ProviderLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Bienvenido, {provider?.personalInfo?.displayName || 'Provider'}
            </h1>
            <p className="text-gray-600 mt-2">
              {provider?.businessInfo?.name || 'Tu negocio'}
            </p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
              <span className="capitalize">{provider?.status || 'unknown'}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Listings */}
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total de Servicios</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalListings}</p>
                  <p className="text-gray-500 text-xs mt-2">
                    {stats.totalListings === 0
                      ? 'Crea tu primer servicio'
                      : `${stats.totalListings} activos`}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            {/* Active Orders */}
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Órdenes Activas</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeOrders}</p>
                  <p className="text-gray-500 text-xs mt-2">
                    {stats.activeOrders === 0
                      ? 'No hay órdenes pendientes'
                      : `${stats.activeOrders} en progreso`}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </Card>

            {/* Total Earnings */}
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Ganancias Totales</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    ${stats.totalEarnings?.toLocaleString() || '0'}
                  </p>
                  <p className="text-gray-500 text-xs mt-2">CLP</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            {/* Completed Orders */}
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Órdenes Completadas</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.completedOrders}
                  </p>
                  <p className="text-gray-500 text-xs mt-2">históricas</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </Card>

            {/* Average Rating */}
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Calificación Promedio</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.averageRating.toFixed(1)}
                  </p>
                  <p className="text-gray-500 text-xs mt-2">de 5.0 estrellas</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </Card>

            {/* Total Reviews */}
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Reseñas</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalReviews}</p>
                  <p className="text-gray-500 text-xs mt-2">comentarios de clientes</p>
                </div>
                <div className="p-3 bg-pink-100 rounded-lg">
                  <Star className="w-6 h-6 text-pink-600" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Action Buttons */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/provider/listings')}
                className="w-full px-4 py-3 text-left bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 text-orange-900 rounded-lg font-medium transition-all"
              >
                ➕ Crear nuevo servicio
              </button>
              <button
                onClick={() => router.push('/provider/orders')}
                className="w-full px-4 py-3 text-left bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-900 rounded-lg font-medium transition-all"
              >
                📋 Ver órdenes
              </button>
              <button
                onClick={() => router.push('/provider/profile')}
                className="w-full px-4 py-3 text-left bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-900 rounded-lg font-medium transition-all"
              >
                ⚙️ Editar perfil
              </button>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Perfil completado</p>
                  <p className="text-xs text-gray-500">Hace 2 días</p>
                </div>
              </div>
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Primer servicio creado</p>
                  <p className="text-xs text-gray-500">Hace 1 día</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Primera orden recibida</p>
                  <p className="text-xs text-gray-500">Hace 6 horas</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Info Banner */}
        {provider?.status === 'pending' && (
          <Card className="p-6 border-l-4 border-yellow-500 bg-yellow-50">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-900 mb-1">
                  Pendiente de Aprobación
                </h3>
                <p className="text-yellow-800 text-sm mb-3">
                  Tu perfil está siendo revisado por nuestro equipo. Te notificaremos cuando sea aprobado.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </ProviderLayout>
  );
}
