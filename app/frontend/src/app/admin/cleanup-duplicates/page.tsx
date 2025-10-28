'use client';

import { useState } from 'react';
import { Trash2, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

interface CleanupResult {
  success: boolean;
  deletedCount: number;
  message: string;
}

export default function CleanupDuplicatesPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CleanupResult | null>(null);
  const [selectedProvider, setSelectedProvider] = useState('');

  const providers = [
    { value: 'Casa Voyage Hostel', label: 'Casa Voyage Hostel' },
    { value: 'Tierra Gres', label: 'Tierra Gres' },
    { value: 'Joyas Relmu', label: 'Joyas Relmu' },
    { value: 'Atacama NightSky', label: 'Atacama NightSky' },
  ];

  const cleanupProvider = async (businessName: string) => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/cleanup-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          deletedCount: data.deletedCount,
          message: `✅ Se eliminaron ${data.deletedCount} registros duplicados de ${businessName}`,
        });
      } else {
        setResult({
          success: false,
          deletedCount: 0,
          message: `❌ Error: ${data.error}`,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        deletedCount: 0,
        message: `❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const cleanupAll = async () => {
    if (!confirm('⚠️ ADVERTENCIA: Esto eliminará TODOS los datos mock/seed. ¿Estás seguro?')) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/cleanup-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          deletedCount: data.deletedCount,
          message: `✅ Se eliminaron ${data.deletedCount} registros en total`,
        });
      } else {
        setResult({
          success: false,
          deletedCount: 0,
          message: `❌ Error: ${data.error}`,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        deletedCount: 0,
        message: `❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <Trash2 className="w-6 h-6 text-red-600" />
            <h1 className="text-2xl font-bold text-gray-900">Limpiar Datos Duplicados</h1>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">Advertencia</h3>
                <p className="text-sm text-yellow-800">
                  Esta utilidad elimina registros duplicados creados por seeds anteriores.
                  Los seeds ahora limpian automáticamente antes de ejecutarse, pero puedes
                  usar esta página para limpiar duplicados existentes.
                </p>
              </div>
            </div>
          </div>

          {/* Cleanup por Proveedor */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Limpiar Proveedor Específico
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Proveedor
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="">-- Seleccionar --</option>
                  {providers.map((provider) => (
                    <option key={provider.value} value={provider.value}>
                      {provider.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => selectedProvider && cleanupProvider(selectedProvider)}
                disabled={loading || !selectedProvider}
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Limpiando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Limpiar Proveedor
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Cleanup Todo */}
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Limpiar TODOS los Datos Mock
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Esto eliminará TODOS los proveedores mock, listings, invitaciones y leads
              creados por seeds. Úsalo con precaución.
            </p>
            <button
              onClick={cleanupAll}
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Limpiando...
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  Limpiar TODO
                </>
              )}
            </button>
          </div>

          {/* Resultado */}
          {result && (
            <div
              className={`mt-6 p-4 rounded-lg ${
                result.success
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <div>
                  <p
                    className={`font-semibold ${
                      result.success ? 'text-green-900' : 'text-red-900'
                    }`}
                  >
                    {result.message}
                  </p>
                  {result.success && result.deletedCount > 0 && (
                    <p className="text-sm text-green-800 mt-1">
                      Se eliminaron {result.deletedCount} registros de la base de datos
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Información</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Los seeds ahora limpian automáticamente antes de crear nuevos registros</li>
              <li>• Usa esta página solo si tienes duplicados de seeds anteriores</li>
              <li>• La limpieza elimina: stays, marketplace listings, invitaciones y provider leads</li>
              <li>• Los datos de proveedores reales NO se verán afectados</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
