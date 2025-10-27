'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ProviderService } from '@/lib/services/providerService';
import { Provider } from '@/types/provider';
import { CheckCircle, Edit, AlertCircle, MapPin, Mail, Phone, Globe, Instagram } from 'lucide-react';

export default function MockReviewPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [mockProvider, setMockProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMockProvider = async () => {
      if (!user) {
        router.push('/');
        return;
      }

      try {
        // Try to get the provider that was just claimed
        const claimedProvider = await ProviderService.getByUserId(user.uid);

        if (claimedProvider && claimedProvider.accountType === 'real' && claimedProvider.status === 'draft') {
          setMockProvider(claimedProvider);
        } else {
          // No claimed provider, redirect to normal onboarding
          router.push('/onboarding/welcome');
        }
      } catch (err) {
        console.error('Error loading provider:', err);
        setError('Error al cargar la información');
      } finally {
        setLoading(false);
      }
    };

    loadMockProvider();
  }, [user, router]);

  const handleConfirm = async () => {
    if (!mockProvider || !user) return;

    setSubmitting(true);
    setError(null);

    try {
      // Update status to pending (ready for admin approval)
      await ProviderService.updateStatus(mockProvider.id!, 'pending');

      // Redirect to pending approval page
      router.push('/onboarding/pending');
    } catch (err) {
      console.error('Error submitting for approval:', err);
      setError('Error al enviar para aprobación');
      setSubmitting(false);
    }
  };

  const handleEdit = (section: string) => {
    // Redirect to specific onboarding page to edit
    router.push(`/onboarding/${section}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (!mockProvider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">No se encontró información del perfil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Ya casi terminamos!
          </h1>
          <p className="text-lg text-gray-600">
            Hemos pre-cargado tu información. Por favor verifica que todo esté correcto.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Personal Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Información Personal</h2>
              <button
                onClick={() => handleEdit('profile')}
                className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
              >
                <Edit className="w-4 h-4" />
                Editar
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-600">Nombre</p>
                <p className="text-gray-900">{mockProvider.personalInfo.displayName}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Email</p>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {mockProvider.personalInfo.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Teléfono</p>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {mockProvider.personalInfo.phone}
                  </p>
                </div>
              </div>
              {mockProvider.personalInfo.bio && (
                <div>
                  <p className="text-sm font-semibold text-gray-600">Bio</p>
                  <p className="text-gray-900">{mockProvider.personalInfo.bio}</p>
                </div>
              )}
            </div>
          </div>

          {/* Business Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Información del Negocio</h2>
              <button
                onClick={() => handleEdit('business')}
                className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
              >
                <Edit className="w-4 h-4" />
                Editar
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-600">Nombre del Negocio</p>
                <p className="text-gray-900 text-lg font-semibold">{mockProvider.businessInfo.name}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Categoría</p>
                <p className="text-gray-900">{mockProvider.businessInfo.category}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Descripción</p>
                <p className="text-gray-900">{mockProvider.businessInfo.description}</p>
              </div>
              {mockProvider.businessInfo.address && (
                <div>
                  <p className="text-sm font-semibold text-gray-600">Dirección</p>
                  <p className="text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {mockProvider.businessInfo.address}
                  </p>
                </div>
              )}
              {(mockProvider.businessInfo.website || mockProvider.businessInfo.socialMedia?.instagram) && (
                <div className="flex flex-wrap gap-4 pt-2">
                  {mockProvider.businessInfo.website && (
                    <a
                      href={mockProvider.businessInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:underline"
                    >
                      <Globe className="w-4 h-4" />
                      Sitio web
                    </a>
                  )}
                  {mockProvider.businessInfo.socialMedia?.instagram && (
                    <a
                      href={`https://instagram.com/${mockProvider.businessInfo.socialMedia.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-pink-600 hover:underline"
                    >
                      <Instagram className="w-4 h-4" />
                      {mockProvider.businessInfo.socialMedia.instagram}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Photos */}
          {mockProvider.businessInfo.photos && mockProvider.businessInfo.photos.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Fotos</h2>
                <button
                  onClick={() => handleEdit('photos')}
                  className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {mockProvider.businessInfo.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Services */}
          {mockProvider.services && mockProvider.services.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Servicios</h2>
                <button
                  onClick={() => handleEdit('services')}
                  className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
              </div>

              <div className="space-y-4">
                {mockProvider.services.map((service, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{service.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                    <p className="text-orange-600 font-bold">
                      ${service.price.toLocaleString('es-CL')} {service.currency}
                      {service.duration && <span className="text-gray-600 font-normal"> / {service.duration}</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Al confirmar, tu perfil será enviado para aprobación.
              Un administrador lo revisará y te notificaremos cuando esté aprobado.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => router.push('/onboarding/welcome')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Volver
            </button>
            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Confirmar y Enviar para Aprobación
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
