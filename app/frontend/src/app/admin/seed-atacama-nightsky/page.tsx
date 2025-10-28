'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, Loader, CheckCircle, Stars } from 'lucide-react';
import Link from 'next/link';

export default function SeedAtacamaNightSkyPage() {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [result, setResult] = useState<{
    leadId: string;
    invitationCode: string;
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
    if (!confirm('¿Estás seguro de que deseas crear el onboarding de Atacama NightSky?')) {
      return;
    }

    setLoading(true);
    setMessage(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/seed-atacama-nightsky', {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to seed Atacama Dark Sky');
      }

      const seedResult = await response.json();
      setResult(seedResult);
      setMessage({
        type: 'success',
        text: '✅ Atacama NightSky onboarding creado exitosamente!'
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
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-2">
          <Stars className="w-8 h-8 text-indigo-600" />
          <h1 className="text-4xl font-bold text-gray-900">Onboarding: Atacama NightSky</h1>
        </div>
        <p className="text-gray-600 mb-8">Crear lead e invitación para Atacama NightSky - Tours Astronómicos</p>

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
            <h2 className="text-2xl font-bold text-gray-900">🌌 Atacama NightSky</h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-600">Tipo</p>
                <p className="text-gray-900">Tour Operator - Tours Astronómicos</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600">Ubicación</p>
                <p className="text-gray-900">10km south of San Pedro de Atacama</p>
                <p className="text-sm text-gray-600">Calle Caracoles 123</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600">Contacto</p>
                <p className="text-gray-900">👤 Vicente Litvak (Guía astronómico)</p>
                <p className="text-gray-900">📧 vicente.litvak@gmail.com</p>
                <p className="text-gray-900">📱 +56 9 3513 4669</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600">Experiencia</p>
                <p className="text-gray-900">6 años guiando tours en el desierto de Atacama</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600">Tecnología</p>
                <p className="text-gray-900">🔭 Unistellar eVscope 2</p>
                <p className="text-sm text-gray-600">Telescopio revolucionario con captura en tiempo real</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Tours Disponibles</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>⭐ Tour Astronómico Regular (2.5h, $30.000 CLP)</li>
                <li>📷 Tour de Astrofotografía Especializado (5h, $120.000 CLP)</li>
                <li>👑 Tour Privado VIP (3h, $200.000 CLP)</li>
                <li>🎓 Viajes de Estudio (grupos 15-30, $15.000 CLP/persona)</li>
                <li>💼 Eventos Corporativos (4-5h, 10-50 personas)</li>
              </ul>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <p className="text-sm text-indigo-800">
                <strong>🌟 Descripción:</strong> Tours astronómicos guiados por experto con tecnología Unistellar eVscope para observación de espacio profundo en tiempo real. Especializado en cielo oscuro del desierto de Atacama.
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-800">
                <strong>⏰ Horarios:</strong> Tours inician a las 20:00 hrs. Disponible todo el año excepto 3 días antes/después de luna llena.
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
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-colors"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Stars className="w-5 h-5" />
                    Crear Onboarding Atacama NightSky
                  </>
                )}
              </button>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Nota:</strong> Este script creará:
                </p>
                <ul className="text-sm text-yellow-800 space-y-1 mt-2 ml-4">
                  <li>1. ProviderLead con información real de Vicente Litvak</li>
                  <li>2. Invitación pendiente para enviar a Atacama NightSky</li>
                </ul>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="text-sm text-indigo-800">
                  <strong>📦 Imágenes incluidas:</strong>
                </p>
                <ul className="text-xs text-indigo-700 space-y-1 mt-2 ml-4">
                  <li>✓ Logo (webp)</li>
                  <li>✓ Foto guía Vicente (webp)</li>
                  <li>✓ Telescopio Unistellar (webp)</li>
                  <li>✓ 5 fotos de tours (webp)</li>
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
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      Ver en dashboard de leads →
                    </Link>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-200 p-4 rounded">
                    <p className="text-sm font-semibold text-indigo-900">Código de Invitación</p>
                    <p className="text-lg font-mono font-bold text-indigo-900 mt-1">
                      {result.invitationCode}
                    </p>
                    <Link
                      href={`/invite/${result.invitationCode}`}
                      className="text-sm text-indigo-600 hover:underline block mt-2"
                    >
                      Abrir página de invitación →
                    </Link>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>📧 Siguiente paso:</strong> Puedes contactar a Vicente Litvak en vicente.litvak@gmail.com o WhatsApp +56 9 3513 4669 para compartir la invitación.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Información del Modelo */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Modelo de Datos</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">1️⃣ Provider Lead</h3>
              <p className="text-sm text-gray-600 mb-3">
                Base de datos de prospección con información real de contacto.
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>✓ Tipo: tour-operator</li>
                <li>✓ Categoría: astronomy, stargazing</li>
                <li>✓ Estado: new</li>
                <li>✓ Prioridad: high (experiencia comprobada)</li>
                <li>✓ Contacto: Vicente Litvak verificado</li>
                <li>✓ 5 servicios documentados</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">2️⃣ Invitación</h3>
              <p className="text-sm text-gray-600 mb-3">
                Link único para que Vicente reclame su perfil de Atacama NightSky.
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>✓ Código: ATK-2025-NIGHTSKY-001</li>
                <li>✓ Email: vicente.litvak@gmail.com</li>
                <li>✓ Estado: pending</li>
                <li>✓ Expira en: 90 días</li>
                <li>✓ Mensaje personalizado incluido</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">🖼️ Imágenes Disponibles</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="bg-gray-100 rounded-lg p-4 mb-2 h-24 flex items-center justify-center">
                  <p className="text-2xl">🏷️</p>
                </div>
                <p className="text-xs text-gray-600">Logo</p>
              </div>
              <div className="text-center">
                <div className="bg-gray-100 rounded-lg p-4 mb-2 h-24 flex items-center justify-center">
                  <p className="text-2xl">👨‍🚀</p>
                </div>
                <p className="text-xs text-gray-600">Vicente (Guía)</p>
              </div>
              <div className="text-center">
                <div className="bg-gray-100 rounded-lg p-4 mb-2 h-24 flex items-center justify-center">
                  <p className="text-2xl">🔭</p>
                </div>
                <p className="text-xs text-gray-600">Telescopio</p>
              </div>
              <div className="text-center">
                <div className="bg-gray-100 rounded-lg p-4 mb-2 h-24 flex items-center justify-center">
                  <p className="text-2xl">⭐</p>
                </div>
                <p className="text-xs text-gray-600">5 Tours</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Todas las imágenes convertidas a webp y almacenadas en /images/providers/atacama-nightsky/
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
