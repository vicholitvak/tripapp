'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { InvitationService } from '@/lib/services/invitationService';
import { ProviderType } from '@/types/provider';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

const PROVIDER_TYPES: { value: ProviderType; label: string; description: string }[] = [
  { value: 'cook', label: 'Cocinero', description: 'Ofrece platillos tradicionales' },
  {
    value: 'driver',
    label: 'Repartidor',
    description: 'Realiza entregas de alimentos',
  },
  {
    value: 'tour_guide',
    label: 'Guía Turístico',
    description: 'Ofrece tours y experiencias',
  },
  {
    value: 'artisan',
    label: 'Artesano',
    description: 'Vende artesanías y obras de arte',
  },
  {
    value: 'transport',
    label: 'Transporte',
    description: 'Taxi, transfer, transporte turístico',
  },
  {
    value: 'service',
    label: 'Servicio',
    description: 'Taller, reparación, mantenimiento',
  },
];

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;
  const { user, loading: authLoading } = useAuth();
  const {
    invitation,
    validateInvitation,
    startOnboarding,
    loading: onboardingLoading,
    error,
  } = useOnboarding();
  const [selectedType, setSelectedType] = useState<ProviderType | null>(null);
  const [validating, setValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Validar invitación al cargar
  useEffect(() => {
    const validate = async () => {
      setValidating(true);
      const isValid = await validateInvitation(code);
      if (!isValid) {
        setValidationError(error || 'Código de invitación inválido');
      }
      setValidating(false);
    };

    validate();
  }, [code, validateInvitation, error]);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  const handleStartOnboarding = async () => {
    if (!selectedType) return;

    try {
      await startOnboarding(selectedType);
      router.push('/onboarding/welcome');
    } catch (err) {
      console.error('Error starting onboarding:', err);
      setValidationError('Error al iniciar el proceso');
    }
  };

  if (authLoading || validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Verificando tu invitación...</p>
        </div>
      </div>
    );
  }

  if (validationError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white px-4">
        <div className="max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitación Inválida</h1>
          <p className="text-gray-600 mb-6">{validationError}</p>
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

  if (!invitation) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Mensaje de Bienvenida */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Bienvenido!</h1>
            </div>

            <div className="space-y-4 text-center mb-8">
              <p className="text-lg text-gray-700">
                Hola <strong>{invitation.recipientName}</strong>,
              </p>
              <p className="text-lg text-gray-700">
                Queremos que <strong>{invitation.businessName}</strong> sea parte de nuestra
                comunidad.
              </p>
              <p className="text-lg text-gray-700">
                Reconocemos el valor que aportas a San Pedro de Atacama como{' '}
                <strong>{invitation.category}</strong>.
              </p>
              {invitation.customMessage && (
                <p className="text-lg text-orange-600 font-semibold italic">
                  &quot;{invitation.customMessage}&quot;
                </p>
              )}
            </div>

            <p className="text-gray-600 text-center">
              Completa el siguiente formulario para empezar a ofrecer tus productos y servicios a
              nuestros clientes.
            </p>
          </div>

          {/* Selector de Tipo */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              ¿Qué tipo de servicio ofreces?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {PROVIDER_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    selectedType === type.value
                      ? 'border-orange-600 bg-orange-50'
                      : 'border-gray-200 bg-white hover:border-orange-300'
                  }`}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.label}</h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span className="text-red-800">{error}</span>
              </div>
            )}

            <button
              onClick={handleStartOnboarding}
              disabled={!selectedType || onboardingLoading}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-semibold disabled:opacity-50"
            >
              {onboardingLoading ? 'Iniciando...' : 'Continuar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
