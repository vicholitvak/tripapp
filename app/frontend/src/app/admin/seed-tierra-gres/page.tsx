'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, Loader, CheckCircle, ShoppingBag } from 'lucide-react';
import { seedTierraGres } from '@/lib/seeds/seedTierraGres';
import Link from 'next/link';

export default function SeedTierraGresPage() {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [result, setResult] = useState<{
    leadId: string;
    mockProviderId: string;
    listingIds: string[];
    invitationId: string;
    invitationCode: string;
    stats: {
      productos: number;
      stockTotal: number;
      valorBase: number;
      valorVenta: number;
      margen: number;
    };
  } | null>(null);

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
    if (!confirm('¿Estás seguro de que deseas crear el onboarding de Tierra Gres (Antonia)?')) {
      return;
    }

    setLoading(true);
    setMessage(null);
    setResult(null);

    try {
      const seedResult = await seedTierraGres();
      setResult(seedResult);
      setMessage({
        type: 'success',
        text: '✅ Tierra Gres onboarding creado exitosamente!'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ Error: ${error instanceof Error ? error.message : 'No se pudo crear el onboarding'}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-2">
          <ShoppingBag className="w-8 h-8 text-orange-600" />
          <h1 className="text-4xl font-bold text-gray-900">Onboarding: Tierra Gres</h1>
        </div>
        <p className="text-gray-600 mb-8">Crear lead, productos marketplace e invitación para Antonia</p>

        {/* Mensaje */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-50 border border-green-200' :
            message.type === 'error' ? 'bg-red-50 border border-red-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
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
          {/* Información del Negocio */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">🏺 Tierra Gres</h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-600">Artista</p>
                <p className="text-gray-900">Antonia del Pedregal</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600">Categoría</p>
                <p className="text-gray-900">Cerámica Gres Artesanal</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600">Ubicación</p>
                <p className="text-gray-900">Showroom en San Pedro de Atacama</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600">Contacto</p>
                <p className="text-gray-900">📧 contacto@tierragres.cl</p>
                <p className="text-gray-900">📱 +56985934514</p>
                <p className="text-gray-900">📷 @tierra_gres</p>
                <p className="text-gray-900">🌐 tierragres.cl</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600">Historia</p>
                <p className="text-sm text-gray-700">
                  Aprendió cerámica gres en Santiago (2018) y empezó su taller en San Pedro de Atacama (2020).
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Productos (10 items)</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Pocillo Desierto - $21.000</li>
                <li>✓ Fuente Volcán - $42.000</li>
                <li>✓ Set Pisco Sour (4 piezas) - $75.000</li>
                <li>✓ Cuchara Decorativa San Pedro - $14.000</li>
                <li>✓ Jarra Atacama - $33.000</li>
                <li>✓ Collar Cerámica Tierra - $18.000</li>
                <li>✓ Vaso Gres Natural - $19.000</li>
                <li>✓ Fuente Ovalada Valles - $49.000</li>
                <li>✓ Set de 2 Pocillos Pareja - $38.000</li>
                <li>✓ Pieza Escultural Licancabur - $210.000</li>
              </ul>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                <strong>📝 Inspiración:</strong> Cerámica gres modelada a mano con formas y colores del desierto de Atacama. Diseños con volcanes y valles del altiplano.
              </p>
            </div>
          </div>

          {/* Acciones y Resultado */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Acciones</h2>

              <button
                onClick={handleSeed}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-colors"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    Crear Onboarding Tierra Gres
                  </>
                )}
              </button>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Nota:</strong> Este script creará:
                </p>
                <ul className="text-sm text-yellow-800 space-y-1 mt-2 ml-4">
                  <li>1. ProviderLead con información de Antonia</li>
                  <li>2. 10 productos marketplace con precios reales</li>
                  <li>3. Invitación pendiente para Antonia</li>
                  <li>4. Márgenes configurados (15-20% plataforma)</li>
                </ul>
              </div>
            </div>

            {/* Resultado */}
            {result && (
              <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">✅ Resultado</h2>

                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm font-semibold text-gray-600">Provider Lead ID</p>
                    <p className="text-sm font-mono text-gray-900">{result.leadId}</p>
                    <Link
                      href="/admin/provider-leads"
                      className="text-xs text-orange-600 hover:underline"
                    >
                      Ver en dashboard de leads →
                    </Link>
                  </div>

                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm font-semibold text-gray-600">Mock Provider ID</p>
                    <p className="text-sm font-mono text-gray-900">{result.mockProviderId}</p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm font-semibold text-gray-600">Productos Marketplace</p>
                    <p className="text-sm text-gray-900">{result.stats.productos} productos creados</p>
                    <Link
                      href="/marketplace"
                      className="text-xs text-orange-600 hover:underline"
                    >
                      Ver en marketplace →
                    </Link>
                  </div>

                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm font-semibold text-gray-600">Invitation ID</p>
                    <p className="text-sm font-mono text-gray-900">{result.invitationId}</p>
                    <Link
                      href="/admin/invitations"
                      className="text-xs text-orange-600 hover:underline"
                    >
                      Ver en dashboard de invitaciones →
                    </Link>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 p-4 rounded">
                    <p className="text-sm font-semibold text-orange-900">Código de Invitación</p>
                    <p className="text-lg font-mono font-bold text-orange-900 mt-1">
                      {result.invitationCode}
                    </p>
                    <Link
                      href={`/invite/${result.invitationCode}`}
                      className="text-sm text-orange-600 hover:underline block mt-2"
                    >
                      Abrir página de invitación →
                    </Link>
                  </div>

                  {/* Estadísticas de Inventario */}
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-semibold text-gray-900 mb-3">💰 Estadísticas de Inventario</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600">Stock Total</p>
                        <p className="text-lg font-bold text-gray-900">{result.stats.stockTotal} piezas</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600">Productos</p>
                        <p className="text-lg font-bold text-gray-900">{result.stats.productos} items</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-xs text-blue-800">Valor Base</p>
                        <p className="text-lg font-bold text-blue-900">
                          ${result.stats.valorBase.toLocaleString('es-CL')}
                        </p>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <p className="text-xs text-green-800">Valor Venta</p>
                        <p className="text-lg font-bold text-green-900">
                          ${result.stats.valorVenta.toLocaleString('es-CL')}
                        </p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded col-span-2">
                        <p className="text-xs text-orange-800">Margen Plataforma</p>
                        <p className="text-xl font-bold text-orange-900">
                          ${result.stats.margen.toLocaleString('es-CL')}
                          <span className="text-sm ml-2">
                            ({((result.stats.margen / result.stats.valorBase) * 100).toFixed(1)}%)
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>📧 Siguiente paso:</strong> Contacta a Antonia en contacto@tierragres.cl o WhatsApp +56985934514 para compartir la invitación.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Información del Modelo */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Modelo de Datos</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">1️⃣ Provider Lead</h3>
              <p className="text-sm text-gray-600 mb-3">
                Base de datos con información de contacto de Antonia.
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>✓ Tipo: artisan (ceramista)</li>
                <li>✓ Estado: new</li>
                <li>✓ Prioridad: high (amiga del fundador)</li>
                <li>✓ Source: referral</li>
                <li>✓ Contacto verificado</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">2️⃣ Marketplace Listings</h3>
              <p className="text-sm text-gray-600 mb-3">
                10 productos reales de cerámica gres visibles en marketplace.
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>✓ Precios: $14.000 - $210.000</li>
                <li>✓ Márgenes: 15-20%</li>
                <li>✓ Stock total: 71 piezas</li>
                <li>✓ Envío disponible</li>
                <li>✓ Status: active (visible)</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">3️⃣ Invitación</h3>
              <p className="text-sm text-gray-600 mb-3">
                Link único para que Antonia reclame su perfil.
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>✓ Código: ATK-2025-TIERRAGRES-001</li>
                <li>✓ Email: contacto@tierragres.cl</li>
                <li>✓ Estado: pending</li>
                <li>✓ Expira en: 90 días</li>
                <li>✓ Link a mock provider</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
