'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, Loader, CheckCircle, Trash2, RefreshCw } from 'lucide-react';
import { seedMarketplace, clearMarketplace, getSeedStats } from '@/lib/seeds/seedMarketplace';

export default function SeedMarketplacePage() {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [stats, setStats] = useState(getSeedStats());

  if (!user || role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Acceso Denegado</h1>
          <p className="text-gray-600 mt-2">Solo administradores pueden acceder a esta página</p>
        </div>
      </div>
    );
  }

  const handleSeed = async () => {
    if (!confirm('¿Estás seguro de que deseas cargar los datos mock del marketplace?')) {
      return;
    }

    setLoading(true);
    try {
      const result = await seedMarketplace();
      setMessage({
        type: 'success',
        text: `✅ Marketplace poblado exitosamente! Se agregaron ${result.addedCount} listings.`
      });
      setStats(getSeedStats());
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ Error: ${error instanceof Error ? error.message : 'No se pudo cargar los datos'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('⚠️ ADVERTENCIA: Esta acción eliminará TODOS los listings del marketplace. ¿Deseas continuar?')) {
      return;
    }

    setLoading(true);
    try {
      const count = await clearMarketplace();
      setMessage({
        type: 'info',
        text: `🗑️ Se eliminaron ${count} listings del marketplace`
      });
      setStats({ ...stats, totalListings: 0 });
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ Error: ${error instanceof Error ? error.message : 'No se pudo limpiar los datos'}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Seed Marketplace</h1>
        <p className="text-gray-600 mb-8">Herramienta de desarrollo para cargar datos mock</p>

        {/* Mensaje */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-50 border border-green-200' :
            message.type === 'error' ? 'bg-red-50 border border-red-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : message.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
            )}
            <span className={
              message.type === 'success' ? 'text-green-800' :
              message.type === 'error' ? 'text-red-800' :
              'text-blue-800'
            }>
              {message.text}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Stats */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Estadísticas</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Productos</p>
                <p className="text-3xl font-bold text-orange-600">{stats.totalListings}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Proveedores</p>
                <p className="text-3xl font-bold text-purple-600">{stats.providers.length}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Proveedores</h3>
              <div className="space-y-2">
                {stats.providers.map(provider => (
                  <div key={provider.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-gray-900">{provider.name}</p>
                      <p className="text-xs text-gray-600">{provider.category}</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded">
                      {provider.products} productos
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-600">Valor total aproximado</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats.totalRevenue.toLocaleString('es-CL')} CLP
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Acciones</h2>

            <div className="space-y-4">
              <button
                onClick={handleSeed}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-colors"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Cargando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Cargar Datos Mock
                  </>
                )}
              </button>

              <button
                onClick={handleClear}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-colors"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Limpiando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Limpiar Todo
                  </>
                )}
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Nota:</strong> Estos datos son solo para desarrollo local. Los cambios se reflejarán en tiempo real en Firestore.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-blue-900">Contenido del Seed</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ 6 productos de cerámica gress artesanal</li>
                <li>✓ 7 productos de orfebrería local (plata 925)</li>
                <li>✓ Imágenes stock de Unsplash</li>
                <li>✓ Precios realistas en CLP</li>
                <li>✓ Ratings y reviews simulados</li>
                <li>✓ Información de envío configurada</li>
              </ul>
            </div>

            <div className="text-sm text-gray-600">
              <p><strong>URL de prueba:</strong> /marketplace</p>
              <p className="mt-2">Después de cargar los datos, puedes ver los productos en el marketplace.</p>
            </div>
          </div>
        </div>

        {/* Detalles de productos */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Detalles de Productos Mock</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cerámica */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">🏺 Cerámica Gress Atacama</h3>
              <ul className="space-y-2 text-sm">
                <li>✓ Macetero Diseño Tribal - $45,000</li>
                <li>✓ Plato Decorativo Motivos Andinos - $32,000</li>
                <li>✓ Jarra de Cerámica Artesanal - $38,000</li>
                <li>✓ Taza Personalizada - $18,000</li>
                <li>✓ Set de 3 Cuencos - $55,000</li>
                <li>✓ Espejo con Marco Artesanal - $72,000</li>
              </ul>
            </div>

            {/* Joyería */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">💎 Orfebrería Atacama Auténtica</h3>
              <ul className="space-y-2 text-sm">
                <li>✓ Collar Plata - Piedra de Luna - $95,000</li>
                <li>✓ Anillo Diseño Étnico - $55,000</li>
                <li>✓ Pulsera Plata - Turquesa Natural - $120,000</li>
                <li>✓ Aretes Forma Gota - $42,000</li>
                <li>✓ Diadema Coronita Artesanal - $185,000</li>
                <li>✓ Conjunto Collar + Aretes - $160,000</li>
                <li>✓ Broche Diseño Cactus - $38,000</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
