'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, MapPin, Calendar, Users, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import ProviderLayout from '@/components/provider/ProviderLayout';
import { ModernCard as Card } from '@/components/ui/modern-card';

interface Order {
  id: string;
  customerId: string;
  customerName: string;
  serviceName: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  date: Date | string;
  price: number;
  currency: string;
  location?: string;
  notes?: string;
  createdAt: Date | string;
}

const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    customerId: 'cust-123',
    customerName: 'Juan Pérez',
    serviceName: 'Clases de Cocina',
    status: 'confirmed',
    date: '2024-10-28',
    price: 45000,
    currency: 'CLP',
    location: 'San Isidro, Santiago',
    notes: 'Clase para 4 personas',
    createdAt: '2024-10-26',
  },
  {
    id: 'ORD-002',
    customerId: 'cust-456',
    customerName: 'María García',
    serviceName: 'Tour Gastronómico',
    status: 'pending',
    date: '2024-10-30',
    price: 120000,
    currency: 'CLP',
    location: 'Centro, Santiago',
    notes: 'Grupo de 6 personas',
    createdAt: '2024-10-26',
  },
  {
    id: 'ORD-003',
    customerId: 'cust-789',
    customerName: 'Carlos López',
    serviceName: 'Catering Corporativo',
    status: 'completed',
    date: '2024-10-25',
    price: 250000,
    currency: 'CLP',
    location: 'Providencia, Santiago',
    notes: 'Evento corporativo 30 personas',
    createdAt: '2024-10-20',
  },
];

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
  in_progress: {
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
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin');
    }
  }, [user, authLoading, router]);

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
      .reduce((sum, o) => sum + o.price, 0),
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

              return (
                <Card key={order.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{order.serviceName}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-gray-600">Cliente: {order.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        ${order.price.toLocaleString()}
                      </p>
                      <p className="text-gray-500 text-sm">{order.currency}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-gray-600 py-4 border-y border-gray-200">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>{new Date(order.date).toLocaleDateString('es-CL')}</span>
                    </div>
                    {order.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span>{order.location}</span>
                      </div>
                    )}
                    {order.notes && (
                      <div className="flex items-start gap-2">
                        <Users className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{order.notes}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      Creada: {new Date(order.createdAt).toLocaleDateString('es-CL')}
                    </p>
                    <div className="flex gap-2">
                      {order.status === 'pending' && (
                        <>
                          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                            Confirmar
                          </button>
                          <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium">
                            Rechazar
                          </button>
                        </>
                      )}
                      {order.status === 'confirmed' && (
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                          Marcar en Progreso
                        </button>
                      )}
                      {order.status === 'in_progress' && (
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                          Marcar Completada
                        </button>
                      )}
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                        Detalles
                      </button>
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
