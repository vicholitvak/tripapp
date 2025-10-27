'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, Loader, CheckCircle, Gem } from 'lucide-react';
import { seedJoyasRelmu } from '@/lib/seeds/seedJoyasRelmu';
import Link from 'next/link';

export default function SeedJoyasRelmuPage() {
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

  if (!user || role !== 'Admin') {
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
    if (!confirm('¿Estás seguro de que deseas crear el onboarding de Joyas Relmu (Javi)?')) {
      return;
    }

    setLoading(true);
    setMessage(null);
    setResult(null);

    try {
      const seedResult = await seedJoyasRelmu();
      setResult(seedResult);
      setMessage({
        type: 'success',
        text: '✅ Joyas Relmu onboarding creado exitosamente!'
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
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-2">
          <Gem className="w-8 h-8 text-purple-600" />
          <h1 className="text-4xl font-bold text-gray-900">Onboarding: Joyas Relmu</h1>
        </div>
        <p className="text-gray-600 mb-8">Crear lead, productos joyería e invitación para la Javi</p>

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
            <h2 className="text-2xl font-bold text-gray-900">💎 Joyas Relmu</h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-600">Artista</p>
                <p className="text-gray-900">Javiera &quot;la Javi&quot;</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600">Significado</p>
                <p className="text-gray-900">&quot;Relmu&quot; = &quot;Arcoíris&quot; en mapuche 🌈</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600">Categoría</p>
                <p className="text-gray-900">Joyería Artesanal en Plata 925</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600">Ubicación</p>
                <p className="text-gray-900">San Pedro de Atacama</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600">Contacto</p>
                <p className="text-gray-900">📷 @joyas_relmu</p>
                <p className="text-sm text-gray-600">(Email y WhatsApp a verificar)</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600">Estilo</p>
                <p className="text-sm text-gray-700">
                  Joyería que combina tradición andina con diseño contemporáneo.
                  Piedras semipreciosas del altiplano: turquesa, lapislázuli, cuarzo rosa.
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Productos (10 items)</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Collar Relmu Turquesa Natural - $52.000</li>
                <li>✓ Aretes Gota Lapislázuli - $33.000</li>
                <li>✓ Pulsera Diseño Andino - $45.000</li>
                <li>✓ Anillo Cuarzo Rosa - $38.000</li>
                <li>✓ Dije Volcán Licancabur - $26.000</li>
                <li>✓ Set Aretes + Collar Atacama - $78.000</li>
                <li>✓ Pulsera Cascada Piedras - $60.000</li>
                <li>✓ Aretes Circulares Filigrana - $28.000</li>
                <li>✓ Anillo Ajustable Flor del Desierto - $31.000</li>
                <li>✓ Collar Statement Altiplano - $110.000</li>
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-800">
                <strong>✨ Inspiración:</strong> Cada pieza captura las tonalidades del arcoíris
                del desierto: azules del cielo, turquesas de las lagunas, rosas del atardecer,
                verdes de los oasis.
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
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-colors"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Gem className="w-5 h-5" />
                    Crear Onboarding Joyas Relmu
                  </>
                )}
              </button>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Nota:</strong> Este script creará:
                </p>
                <ul className="text-sm text-yellow-800 space-y-1 mt-2 ml-4">
                  <li>1. ProviderLead con información de la Javi</li>
                  <li>2. 10 joyas de plata 925 con piedras naturales</li>
                  <li>3. Invitación pendiente</li>
                  <li>4. Márgenes configurados (15-19% plataforma)</li>
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
                      className="text-xs text-purple-600 hover:underline"
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
                    <p className="text-sm text-gray-900">{result.stats.productos} joyas creadas</p>
                    <Link
                      href="/marketplace"
                      className="text-xs text-purple-600 hover:underline"
                    >
                      Ver en marketplace →
                    </Link>
                  </div>

                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm font-semibold text-gray-600">Invitation ID</p>
                    <p className="text-sm font-mono text-gray-900">{result.invitationId}</p>
                    <Link
                      href="/admin/invitations"
                      className="text-xs text-purple-600 hover:underline"
                    >
                      Ver en dashboard de invitaciones →
                    </Link>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 p-4 rounded">
                    <p className="text-sm font-semibold text-purple-900">Código de Invitación</p>
                    <p className="text-lg font-mono font-bold text-purple-900 mt-1">
                      {result.invitationCode}
                    </p>
                    <Link
                      href={`/invite/${result.invitationCode}`}
                      className="text-sm text-purple-600 hover:underline block mt-2"
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
                        <p className="text-lg font-bold text-gray-900">{result.stats.productos} joyas</p>
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
                      <div className="bg-purple-50 p-3 rounded col-span-2">
                        <p className="text-xs text-purple-800">Margen Plataforma</p>
                        <p className="text-xl font-bold text-purple-900">
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
                    <strong>📧 Siguiente paso:</strong> Contacta a la Javi via Instagram @joyas_relmu
                    para compartir la invitación y verificar datos de contacto.
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
                Base de datos con información de contacto de la Javi.
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>✓ Tipo: artisan (joyera)</li>
                <li>✓ Estado: new</li>
                <li>✓ Prioridad: high (amiga del fundador)</li>
                <li>✓ Source: referral</li>
                <li>✓ Instagram: @joyas_relmu</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">2️⃣ Marketplace Listings</h3>
              <p className="text-sm text-gray-600 mb-3">
                10 joyas de plata 925 visibles en marketplace.
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>✓ Precios: $26.000 - $110.000</li>
                <li>✓ Márgenes: 15-19%</li>
                <li>✓ Stock total: 58 piezas</li>
                <li>✓ Plata 925 + piedras naturales</li>
                <li>✓ Status: active (visible)</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">3️⃣ Invitación</h3>
              <p className="text-sm text-gray-600 mb-3">
                Link único para que la Javi reclame su perfil.
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>✓ Código: ATK-2025-RELMU-001</li>
                <li>✓ Email: (a verificar)</li>
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
