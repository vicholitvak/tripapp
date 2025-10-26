'use client';

import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/context/OnboardingContext';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function OnboardingPendingPage() {
  const router = useRouter();
  const { provider } = useOnboarding();

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <CheckCircle className="w-24 h-24 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Solicitud Enviada!</h1>
        <p className="text-gray-600 mb-8">
          Tu perfil ha sido enviado para revisión. Nuestro equipo lo analizará en las próximas
          24-48 horas.
        </p>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Clock className="w-5 h-5 text-yellow-600" />
            <span className="font-semibold text-yellow-800">Pendiente de Aprobación</span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="text-left">
              <p className="text-gray-500 mb-1">Nombre del Negocio</p>
              <p className="font-semibold text-gray-900">{provider.businessInfo.name}</p>
            </div>
            <div className="text-left">
              <p className="text-gray-500 mb-1">Tipo de Servicio</p>
              <p className="font-semibold text-gray-900 capitalize">
                {provider.type.replace('_', ' ')}
              </p>
            </div>
            <div className="text-left">
              <p className="text-gray-500 mb-1">Estado</p>
              <div className="inline-block mt-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                Bajo Revisión
              </div>
            </div>
          </div>
        </div>

        {/* Qué pasa ahora */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Qué pasa ahora</h3>
          <div className="space-y-3 text-sm text-left text-gray-700">
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                1
              </span>
              <span>Nuestro equipo revisa tu información</span>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                2
              </span>
              <span>Verificamos fotos y documentación</span>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                3
              </span>
              <span>Te notificamos por email cuando esté aprobado</span>
            </div>
          </div>
        </div>

        {/* Mensaje de espera */}
        <p className="text-gray-600 text-sm mb-8">
          Recibirás un email en <strong>{provider.personalInfo.email}</strong> con la notificación
          de aprobación.
        </p>

        {/* Botones */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-semibold"
          >
            Volver al Inicio
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            Ir a Dashboard
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-8">
          ¿Preguntas? Contáctanos en{' '}
          <a href="mailto:support@santurist.com" className="text-orange-600 hover:underline">
            support@santurist.com
          </a>
        </p>
      </div>
    </div>
  );
}
