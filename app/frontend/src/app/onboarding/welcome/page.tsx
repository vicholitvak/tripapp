'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useOnboarding } from '@/context/OnboardingContext';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle } from 'lucide-react';
import { useEffect, useState, Suspense } from 'react';

function OnboardingWelcomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { provider, invitation } = useOnboarding();
  const fromMock = searchParams.get('from') === 'mock';
  const [checkingProvider, setCheckingProvider] = useState(true);

  // Check if user has a claimed mock provider
  useEffect(() => {
    const checkForClaimedMock = async () => {
      if (!user) {
        setCheckingProvider(false);
        return;
      }

      try {
        // Check if there's a provider that was just claimed from a mock
        const { ProviderService } = await import('@/lib/services/providerService');
        const userProvider = await ProviderService.getByUserId(user.uid);

        if (userProvider &&
            userProvider.accountType === 'real' &&
            userProvider.status === 'draft' &&
            userProvider.claimedAt) {
          // This is a claimed mock, redirect to simplified review
          router.push('/onboarding/mock-review');
          return;
        }
      } catch (error) {
        console.error('Error checking for claimed mock:', error);
      } finally {
        setCheckingProvider(false);
      }
    };

    // If explicitly from mock, redirect immediately
    if (fromMock && user) {
      router.push('/onboarding/mock-review');
      return;
    }

    // Otherwise check if there's a claimed mock
    checkForClaimedMock();
  }, [fromMock, user, router]);

  // Show loading while checking provider
  if (checkingProvider && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando información...</p>
        </div>
      </div>
    );
  }

  // Si ya completó onboarding
  if (provider) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white px-4">
        <div className="max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ya completaste el onboarding</h1>
          <p className="text-gray-600 mb-6">
            Tu perfil está pendiente de aprobación. Te notificaremos cuando sea aprobado.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-lg hover:from-orange-700 hover:to-red-700 font-semibold"
          >
            Ir a Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Si no está autenticado
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white px-4">
        <div className="max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso denegado</h1>
          <p className="text-gray-600 mb-6">Necesitas estar autenticado para continuar.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-lg hover:from-orange-700 hover:to-red-700 font-semibold"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">¡Bienvenido al onboarding!</h1>

            {invitation && (
              <div className="mb-8 p-6 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-gray-700">
                  Hola <strong>{invitation.recipientName}</strong>, vamos a configurar tu perfil
                  como <strong>{invitation.businessName}</strong> para poder ofrecer tus servicios
                  en nuestra plataforma.
                </p>
              </div>
            )}

            <div className="space-y-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900">El proceso incluye:</h2>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Información Personal</h3>
                    <p className="text-gray-600">Tu nombre, teléfono y foto de perfil</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Información del Negocio</h3>
                    <p className="text-gray-600">Detalles sobre tu empresa o servicio</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Servicios y Precios</h3>
                    <p className="text-gray-600">Los productos o servicios que ofreces</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Fotos</h3>
                    <p className="text-gray-600">Imágenes de tu trabajo, productos o lugar</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                    5
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Verificación</h3>
                    <p className="text-gray-600">Documentos o certificaciones (opcional)</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                    6
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Revisión</h3>
                    <p className="text-gray-600">Verifica que todo esté correcto</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> Puedes guardar tu progreso y continuar después. Tienes 7
                  días para completar el proceso.
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push('/onboarding/profile')}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-semibold"
            >
              Comenzar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingWelcomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    }>
      <OnboardingWelcomeContent />
    </Suspense>
  );
}
