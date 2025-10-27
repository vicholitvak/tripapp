'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, Loader, CheckCircle, Home } from 'lucide-react';
import { seedCasaVoyage } from '@/lib/seeds/seedCasaVoyage';
import Link from 'next/link';

export default function SeedCasaVoyagePage() {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [result, setResult] = useState<{
    leadId: string;
    stayId: string;
    invitationId: string;
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
    if (!confirm('¿Estás seguro de que deseas crear el onboarding de Casa Voyage?')) {
      return;
    }

    setLoading(true);
    setMessage(null);
    setResult(null);

    try {
      const seedResult = await seedCasaVoyage();
      setResult(seedResult);
      setMessage({
        type: 'success',
        text: '✅ Casa Voyage onboarding creado exitosamente!'
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
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-2">
          <Home className="w-8 h-8 text-teal-600" />
          <h1 className="text-4xl font-bold text-gray-900">Onboarding: Casa Voyage</h1>
        </div>
        <p className="text-gray-600 mb-8">Crear lead, mock stay e invitación para Casa Voyage Hostel</p>

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
            <h2 className="text-2xl font-bold text-gray-900">🏠 Casa Voyage Hostel</h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-600">Tipo</p>
                <p className="text-gray-900">Hostel Híbrido con Domos Geodésicos</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600">Ubicación</p>
                <p className="text-gray-900">Lascar 368, San Pedro de Atacama</p>
                <p className="text-sm text-gray-600">0.8 km del centro</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600">Contacto</p>
                <p className="text-gray-900">📧 info@casavoyagehostel.com</p>
                <p className="text-gray-900">📱 +56957636043</p>
                <p className="text-gray-900">📷 @casavoyagehostel</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600">Rating</p>
                <p className="text-gray-900">⭐ 9.0/10 en Booking.com (1,152 reviews)</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Características</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Habitaciones compartidas temáticas (Licancabur, Juriques, Tatio, Lascar)</li>
                <li>✓ Habitaciones privadas (Tumisa, Sairecabur, Kimal)</li>
                <li>✓ Domos geodésicos ecológicos (Cordillera, Quechua)</li>
                <li>✓ Piscina al aire libre, jardín y zona de fogatas</li>
                <li>✓ Arte y murales en todo el lugar</li>
                <li>✓ Biblioteca, mesa de pool, muro de escalada</li>
                <li>✓ Alquiler de bicicletas</li>
                <li>✓ Ambiente internacional de viajeros</li>
              </ul>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <p className="text-sm text-teal-800">
                <strong>📝 Descripción:</strong> Un oasis en medio del desierto de Atacama diseñado por y para viajeros, donde el arte, la ecología, la cultura y la alegría se integran.
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
                className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-colors"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Home className="w-5 h-5" />
                    Crear Onboarding Casa Voyage
                  </>
                )}
              </button>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Nota:</strong> Este script creará:
                </p>
                <ul className="text-sm text-yellow-800 space-y-1 mt-2 ml-4">
                  <li>1. ProviderLead con información real de contacto</li>
                  <li>2. Mock Stay con todos los detalles del hostel</li>
                  <li>3. Invitación pendiente para enviar a Casa Voyage</li>
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
                      className="text-xs text-teal-600 hover:underline"
                    >
                      Ver en dashboard de leads →
                    </Link>
                  </div>

                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm font-semibold text-gray-600">Mock Stay ID</p>
                    <p className="text-sm font-mono text-gray-900">{result.stayId}</p>
                    <Link
                      href="/stay"
                      className="text-xs text-teal-600 hover:underline"
                    >
                      Ver en página de alojamientos →
                    </Link>
                  </div>

                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm font-semibold text-gray-600">Invitation ID</p>
                    <p className="text-sm font-mono text-gray-900">{result.invitationId}</p>
                    <Link
                      href="/admin/invitations"
                      className="text-xs text-teal-600 hover:underline"
                    >
                      Ver en dashboard de invitaciones →
                    </Link>
                  </div>

                  <div className="bg-teal-50 border border-teal-200 p-4 rounded">
                    <p className="text-sm font-semibold text-teal-900">Código de Invitación</p>
                    <p className="text-lg font-mono font-bold text-teal-900 mt-1">
                      {result.invitationCode}
                    </p>
                    <Link
                      href={`/invite/${result.invitationCode}`}
                      className="text-sm text-teal-600 hover:underline block mt-2"
                    >
                      Abrir página de invitación →
                    </Link>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>📧 Siguiente paso:</strong> Puedes contactar a Casa Voyage en info@casavoyagehostel.com o WhatsApp +56957636043 para compartir la invitación.
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
                Base de datos de prospección con información real de contacto.
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>✓ Tipo: lodging</li>
                <li>✓ Estado: new</li>
                <li>✓ Prioridad: 8/10 (excelente rating)</li>
                <li>✓ Contacto real verificado</li>
                <li>✓ Tracking de seguimiento</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">2️⃣ Mock Stay</h3>
              <p className="text-sm text-gray-600 mb-3">
                Alojamiento completo visible en /stay con información real.
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>✓ Tipo: hybrid (hostel + domos)</li>
                <li>✓ 3 tipos de espacios configurados</li>
                <li>✓ Precios desde $12.000/noche</li>
                <li>✓ Rating real: 9.0/10</li>
                <li>✓ Status: active (visible)</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">3️⃣ Invitación</h3>
              <p className="text-sm text-gray-600 mb-3">
                Link único para que Casa Voyage reclame su perfil.
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>✓ Código: ATK-2025-VOYAGE-001</li>
                <li>✓ Email: info@casavoyagehostel.com</li>
                <li>✓ Estado: pending</li>
                <li>✓ Expira en: 90 días</li>
                <li>✓ Link a mock stay</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
