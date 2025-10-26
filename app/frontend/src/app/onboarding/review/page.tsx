'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/context/OnboardingContext';
import { ArrowLeft, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function OnboardingReviewPage() {
  const router = useRouter();
  const { draftData, submitForApproval, loading, error } = useOnboarding();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      await submitForApproval();
      router.push('/onboarding/pending');
    } catch (err) {
      console.error('Error submitting:', err);
      setSubmitError('Error al enviar tu solicitud');
      setSubmitting(false);
    }
  };

  if (!draftData.personalInfo || !draftData.businessInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando información...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Revisión Final</h1>
              <span className="text-sm font-semibold text-gray-600">Paso 6 de 6</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-600 to-red-600 h-2 rounded-full"
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>

          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="text-red-800">{submitError}</span>
            </div>
          )}

          {/* Información Personal */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Información Personal</h2>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Nombre</p>
                <p className="font-semibold text-gray-900">
                  {draftData.personalInfo.displayName}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Teléfono</p>
                <p className="font-semibold text-gray-900">{draftData.personalInfo.phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 mb-1">Biografía</p>
                <p className="font-semibold text-gray-900">{draftData.personalInfo.bio}</p>
              </div>
            </div>
          </div>

          {/* Información del Negocio */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Información del Negocio</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Nombre</p>
                <p className="font-semibold text-gray-900">{draftData.businessInfo.name}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Categoría</p>
                <p className="font-semibold text-gray-900">{draftData.businessInfo.category}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Descripción</p>
                <p className="font-semibold text-gray-900">{draftData.businessInfo.description}</p>
              </div>
              {draftData.businessInfo.address && (
                <div>
                  <p className="text-gray-500 mb-1">Dirección</p>
                  <p className="font-semibold text-gray-900">{draftData.businessInfo.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Servicios */}
          {draftData.services && draftData.services.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Servicios ({draftData.services.length})
              </h2>
              <div className="space-y-4">
                {draftData.services.map((service, idx) => (
                  <div key={idx} className="border-l-4 border-orange-600 pl-4">
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-600">{service.description}</p>
                    <p className="font-bold text-orange-600 mt-2">
                      ${service.price.toLocaleString('es-CL')} CLP
                      {service.duration && <span className="text-gray-600"> • {service.duration}</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fotos */}
          {draftData.businessInfo?.photos && draftData.businessInfo.photos.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Fotos ({draftData.businessInfo.photos.length})
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {draftData.businessInfo.photos.map((photo, idx) => (
                  <img
                    key={idx}
                    src={photo}
                    alt={`Foto ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3C/svg%3E';
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Mensaje Final */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <p className="text-sm text-blue-800">
              <strong>Último paso:</strong> Revisa toda la información anteriormente. Una vez que
              envíes tu solicitud, será revisada por nuestro equipo de administración. Te
              notificaremos cuando sea aprobada.
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
              Atrás
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || loading}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 font-semibold disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Enviar para Aprobación
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
