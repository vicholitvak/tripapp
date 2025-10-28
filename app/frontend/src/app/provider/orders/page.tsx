'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, MapPin, Calendar, Users, CheckCircle, Clock, AlertTriangle, Package } from 'lucide-react';
import ProviderLayout from '@/components/provider/ProviderLayout';
import { ModernCard as Card } from '@/components/ui/modern-card';
import { ProviderOrder, OrderStatus } from '@/types/marketplace';
import { OrderService } from '@/lib/services/orderService';
import { ProviderService } from '@/lib/services/providerService';

const statusConfig = {
  pending: {
    label: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  confirmed: {
    label: 'Confirmada',
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle,
  },
  processing: {
    label: 'En Progreso',
    color: 'bg-purple-100 text-purple-800',
    icon: AlertTriangle,
  },
  completed: {
    label: 'Completada',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelada',
    color: 'bg-red-100 text-red-800',
    icon: AlertCircle,
  },
};

export default function ProviderOrders() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<ProviderOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [providerId, setProviderId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin');
    }
  }, [user, authLoading, router]);

  // Fetch provider data and orders
  useEffect(() => {
    async function loadOrders() {
      if (!user) return;

      try {
        setLoading(true);

        // Get provider ID from user
        const provider = await ProviderService.getByUserId(user.uid);
        if (!provider?.id) {
          console.error('Provider not found');
          return;
        }

        setProviderId(provider.id);

        // Get provider orders
        const providerOrders = await OrderService.getProviderOrders(provider.id);
        setOrders(providerOrders);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user && !authLoading) {
      loadOrders();
    }
  }, [user, authLoading]);

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    completed: orders.filter((o) => o.status === 'completed').length,
    revenue: orders
      .filter((o) => o.status === 'completed')
      .reduce((sum, o) => sum + o.providerRevenue, 0),
  };

  // Handle status update
  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    if (!providerId) return;

    try {
      await OrderService.updateProviderOrderStatus(orderId, providerId, newStatus);

      // Update local state
      setOrders(orders.map(order =>
        order.orderId === orderId
          ? { ...order, status: newStatus }
          : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error al actualizar el estado de la orden');
    }
  };

  if (authLoading || loading) {
    return (
      <ProviderLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando órdenes...</p>
          </div>
        </div>
      </ProviderLayout>
    );
  }

  return (
    <ProviderLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Órdenes y Reservas</h1>
          <p className="text-gray-600 mt-2">
            {filteredOrders.length} orden{filteredOrders.length !== 1 ? 'es' : ''} en tu historial
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-gray-600 text-sm">Total de Órdenes</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-600 text-sm">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-600 text-sm">Completadas</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-600 text-sm">Ingresos (Completadas)</p>
            <p className="text-2xl font-bold text-green-700 mt-1">
              ${stats.revenue?.toLocaleString()}
            </p>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'all' as const, label: 'Todas' },
            { id: 'pending' as const, label: 'Pendientes' },
            { id: 'confirmed' as const, label: 'Confirmadas' },
            { id: 'completed' as const, label: 'Completadas' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === tab.id
                  ? 'bg-orange-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600">No hay órdenes en este estado</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusInfo = statusConfig[order.status];
              const StatusIcon = statusInfo.icon;

              // Get first item for display (or combine them)
              const firstItem = order.items[0];
              const hasMultipleItems = order.items.length > 1;

              return (
                <Card key={order.orderId} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          Orden #{order.orderId.slice(0, 8)}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-gray-600">
                        {hasMultipleItems
                          ? `${order.items.length} productos/servicios`
                          : firstItem?.listingName || 'Sin nombre'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        Subtotal: ${order.subtotal.toLocaleString('es-CL')}
                      </p>
                      <p className="text-sm text-gray-500">
                        Comisión: -${order.commission.toLocaleString('es-CL')}
                      </p>
                      <p className="text-2xl font-bold text-green-700 mt-1">
                        ${order.providerRevenue.toLocaleString('es-CL')}
                      </p>
                      <p className="text-xs text-gray-500">Tu ganancia</p>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-gray-600" />
                      <h4 className="font-semibold text-sm text-gray-900">Productos/Servicios:</h4>
                    </div>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start text-sm">
                          <div className="flex-1">
                            <p className="text-gray-900 font-medium">{item.listingName}</p>
                            {item.serviceDate && (
                              <p className="text-gray-600 text-xs flex items-center gap-1 mt-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(item.serviceDate).toLocaleDateString('es-CL')}
                                {item.serviceTime && ` a las ${item.serviceTime}`}
                              </p>
                            )}
                            {item.serviceNotes && (
                              <p className="text-gray-600 text-xs mt-1">{item.serviceNotes}</p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-gray-900">
                              {item.quantity} × ${item.price.toLocaleString('es-CL')}
                            </p>
                            <p className="text-gray-600 font-medium">
                              ${(item.quantity * item.price).toLocaleString('es-CL')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.notes && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <strong>Nota:</strong> {order.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      Creada: {(order.createdAt instanceof Date ? order.createdAt : order.createdAt.toDate()).toLocaleDateString('es-CL')}
                    </p>
                    <div className="flex gap-2">
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(order.orderId, 'confirmed')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(order.orderId, 'cancelled')}
                            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusUpdate(order.orderId, 'processing')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Marcar en Progreso
                        </button>
                      )}
                      {order.status === 'processing' && (
                        <button
                          onClick={() => handleStatusUpdate(order.orderId, 'completed')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          Marcar Completada
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ProviderLayout>
  );
}
