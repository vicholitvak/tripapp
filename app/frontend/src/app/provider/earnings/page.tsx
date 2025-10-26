'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { TrendingUp, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import ProviderLayout from '@/components/provider/ProviderLayout';
import { ModernCard as Card } from '@/components/ui/modern-card';

interface EarningsData {
  month: string;
  gross: number;
  commission: number;
  net: number;
  orders: number;
}

const MOCK_EARNINGS: EarningsData[] = [
  { month: 'Agosto', gross: 850000, commission: 127500, net: 722500, orders: 5 },
  { month: 'Septiembre', gross: 1200000, commission: 180000, net: 1020000, orders: 8 },
  { month: 'Octubre (actual)', gross: 680000, commission: 102000, net: 578000, orders: 4 },
];

export default function ProviderEarnings() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [earnings, setEarnings] = useState<EarningsData[]>(MOCK_EARNINGS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin');
    }
  }, [user, authLoading, router]);

  const totalEarnings = earnings.reduce((sum, e) => sum + e.net, 0);
  const totalOrders = earnings.reduce((sum, e) => sum + e.orders, 0);
  const avgOrderValue = totalEarnings / totalOrders;
  const lastMonthEarnings = earnings.length > 0 ? earnings[earnings.length - 1].net : 0;

  const commissionRate = 15; // 15% commission

  if (authLoading || loading) {
    return (
      <ProviderLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando ganancias...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Mis Ganancias</h1>
          <p className="text-gray-600 mt-2">
            Seguimiento detallado de tus ingresos y comisiones
          </p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Ganancias Totales</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ${totalEarnings.toLocaleString()}
                </p>
                <p className="text-gray-500 text-xs mt-2">CLP</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Este Mes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ${lastMonthEarnings.toLocaleString()}
                </p>
                <p className="text-gray-500 text-xs mt-2">CLP</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Promedio por Orden</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ${avgOrderValue.toLocaleString()}
                </p>
                <p className="text-gray-500 text-xs mt-2">CLP</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total de Órdenes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalOrders}</p>
                <p className="text-gray-500 text-xs mt-2">órdenes completadas</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Commission Info */}
        <Card className="p-6 bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-1">
                Información de Comisiones
              </h3>
              <p className="text-blue-800 text-sm mb-2">
                Santurist retiene una comisión del <strong>{commissionRate}%</strong> de cada
                transacción para mantener y mejorar la plataforma.
              </p>
              <p className="text-blue-700 text-xs">
                Las ganancias mostradas ya cuentan la comisión descontada.
              </p>
            </div>
          </div>
        </Card>

        {/* Earnings by Month */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Historial de Ganancias</h2>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Mes</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Ingresos Brutos</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Comisión ({commissionRate}%)</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Ganancias Netas</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Órdenes</th>
                </tr>
              </thead>
              <tbody>
                {earnings.map((data, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900 font-medium">{data.month}</td>
                    <td className="py-3 px-4 text-right text-gray-900">
                      ${data.gross.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-red-600">
                      -${data.commission.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-green-600">
                      ${data.net.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700">{data.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Withdrawal Section */}
        <Card className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Retiros de Ganancias</h3>
              <p className="text-gray-700 text-sm mb-4">
                Puedes retirar tus ganancias en cualquier momento. Los retiros se procesan en 3-5
                días hábiles hacia tu cuenta bancaria registrada.
              </p>
              <div className="bg-white p-4 rounded-lg inline-block mb-4">
                <p className="text-sm text-gray-600">Disponible para Retirar</p>
                <p className="text-2xl font-bold text-orange-600">${lastMonthEarnings.toLocaleString()} CLP</p>
              </div>
            </div>
            <button className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium">
              Solicitar Retiro
            </button>
          </div>
        </Card>

        {/* Payment Methods */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Método de Pago</h3>
          <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-600 text-sm mb-3">
              Cuenta Bancaria Registrada:
            </p>
            <p className="text-lg font-semibold text-gray-900 mb-4">
              Banco Chile • Cuenta Corriente • ****1234
            </p>
            <button className="text-orange-600 hover:text-orange-700 font-medium text-sm">
              Cambiar método de pago
            </button>
          </div>
        </Card>
      </div>
    </ProviderLayout>
  );
}
