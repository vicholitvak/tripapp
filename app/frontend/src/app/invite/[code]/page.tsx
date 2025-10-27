'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { InvitationService } from '@/lib/services/invitationService';
import { MockProviderService } from '@/lib/services/mockProviderService';
import { Provider, Invitation, ProviderType } from '@/types/provider';
import { CheckCircle, AlertCircle, Loader, Package, Star, MapPin, Mail } from 'lucide-react';

const PROVIDER_TYPES: { value: ProviderType; label: string; description: string }[] = [
  { value: 'cook', label: 'Cocinero', description: 'Ofrece platillos tradicionales' },
  { value: 'driver', label: 'Repartidor', description: 'Realiza entregas de alimentos' },
  { value: 'tour_guide', label: 'Guía Turístico', description: 'Ofrece tours y experiencias' },
  { value: 'artisan', label: 'Artesano', description: 'Vende artesanías y obras de arte' },
  { value: 'transport', label: 'Transporte', description: 'Taxi, transfer, transporte turístico' },
  { value: 'service', label: 'Servicio', description: 'Taller, reparación, mantenimiento' },
  { value: 'other', label: 'Otro', description: 'Otro tipo de servicio' },
];

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;
  const { user, loading: authLoading, signUp } = useAuth();

  // Validation state
  const [validating, setValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [mockProvider, setMockProvider] = useState<Provider | null>(null);

  // Form state
  const [selectedType, setSelectedType] = useState<ProviderType | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Signup form (if not authenticated)
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Validar invitación al cargar
  useEffect(() => {
    const validate = async () => {
      setValidating(true);
      setValidationError(null);

      try {
        const result = await InvitationService.validateCode(code);

        if (!result.valid) {
          setValidationError(result.error || 'Código de invitación inválido');
          setValidating(false);
          return;
        }

        setInvitation(result.invitation!);

        // Si hay mock provider vinculado
        if (result.mockProvider) {
          const mock = result.mockProvider as Provider;
          setMockProvider(mock);
          setSelectedType(mock.type);
          setSignupData(prev => ({
            ...prev,
            email: mock.personalInfo.email,
          }));
        } else {
          // Si no hay mock, usar datos de la invitación
          setSignupData(prev => ({
            ...prev,
            email: result.invitation!.email,
          }));
        }

        setValidating(false);
      } catch (err) {
        console.error('Error validating invitation:', err);
        setValidationError('Error al validar el código');
        setValidating(false);
      }
    };

    if (code) {
      validate();
    }
  }, [code]);

  // Check if user needs to sign up
  useEffect(() => {
    if (!authLoading && !user && invitation) {
      setShowSignupForm(true);
    }
  }, [authLoading, user, invitation]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (signupData.password !== signupData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (signupData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Verify email matches invitation/mock
    const expectedEmail = mockProvider?.personalInfo.email || invitation?.email || '';
    if (signupData.email !== expectedEmail) {
      setError(`Debes usar el email de la invitación: ${expectedEmail}`);
      return;
    }

    setProcessing(true);

    try {
      // Create account
      await signUp(signupData.email, signupData.password);
      // Will continue to handleContinue after auth state updates
    } catch (err) {
      console.error('Error signing up:', err);
      setError('Error al crear la cuenta. Este email podría estar en uso.');
      setProcessing(false);
    }
  };

  const handleContinue = async () => {
    if (!user || !invitation) return;
    if (!mockProvider && !selectedType) {
      setError('Selecciona el tipo de servicio que ofreces');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Claim invitation
      await InvitationService.claimInvitation(invitation.id!, user.uid);

      // If there's a mock, claim it
      if (mockProvider && mockProvider.id) {
        await MockProviderService.claimMock(
          mockProvider.id,
          user.uid,
          invitation.code
        );

        // Redirect to onboarding with pre-filled data
        router.push('/onboarding/welcome?from=mock');
      } else {
        // No mock, start fresh onboarding
        router.push('/onboarding/welcome?from=invitation');
      }
    } catch (err) {
      console.error('Error claiming invitation:', err);
      setError('Error al procesar la invitación. Intenta nuevamente.');
      setProcessing(false);
    }
  };

  // Auto-continue after signup
  useEffect(() => {
    if (user && invitation && !processing && showSignupForm) {
      setShowSignupForm(false);
      // Small delay to ensure user is fully authenticated
      setTimeout(() => {
        handleContinue();
      }, 500);
    }
  }, [user, invitation, processing, showSignupForm]);

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

  // If user needs to sign up first
  if (showSignupForm) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto">
            {/* Welcome Message */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <div className="text-center mb-6">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Invitación Válida!</h1>
                <p className="text-gray-600">
                  Hola <strong>{invitation.recipientName}</strong>
                </p>
              </div>

              {mockProvider && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Tu perfil pre-configurado:</h3>
                  <p className="text-sm text-gray-700">
                    <strong>{mockProvider.businessInfo.name}</strong>
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{mockProvider.businessInfo.category}</p>
                </div>
              )}
            </div>

            {/* Signup Form */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Crear tu Cuenta</h2>

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={signupData.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email de la invitación (no se puede cambiar)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    required
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Contraseña *
                  </label>
                  <input
                    type="password"
                    required
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    placeholder="Repite tu contraseña"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <span className="text-sm text-red-800">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-semibold disabled:opacity-50"
                >
                  {processing ? 'Creando cuenta...' : 'Crear Cuenta y Continuar'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user is authenticated, show continue screen
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Welcome Message */}
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
          </div>

          {/* Mock Provider Preview */}
          {mockProvider && (
            <div className="bg-white rounded-lg shadow-md p-8 mb-8 border-2 border-orange-500">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Tu Perfil Pre-configurado</h2>
                  <p className="text-gray-600 mt-1">
                    Hemos preparado tu perfil con esta información
                  </p>
                </div>
                {mockProvider.featured && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                    <Star className="w-4 h-4" />
                    Destacado
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                      Información del Negocio
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500">Nombre</p>
                        <p className="font-semibold text-gray-900">{mockProvider.businessInfo.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Categoría</p>
                        <p className="text-sm text-gray-700">{mockProvider.businessInfo.category}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Descripción</p>
                        <p className="text-sm text-gray-700">{mockProvider.businessInfo.description}</p>
                      </div>
                    </div>
                  </div>

                  {mockProvider.services && mockProvider.services.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Servicios ({mockProvider.services.length})</p>
                      <div className="flex gap-2 flex-wrap">
                        {mockProvider.services.slice(0, 3).map((service, idx) => (
                          <span key={idx} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                            <Package className="w-3 h-3" />
                            {service.name}
                          </span>
                        ))}
                        {mockProvider.services.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                            +{mockProvider.services.length - 3} más
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Personal Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                      Información Personal
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500">Nombre</p>
                        <p className="font-semibold text-gray-900">{mockProvider.personalInfo.displayName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm text-gray-700 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {mockProvider.personalInfo.email}
                        </p>
                      </div>
                      {mockProvider.personalInfo.phone && (
                        <div>
                          <p className="text-xs text-gray-500">Teléfono</p>
                          <p className="text-sm text-gray-700">{mockProvider.personalInfo.phone}</p>
                        </div>
                      )}
                      {mockProvider.personalInfo.bio && (
                        <div>
                          <p className="text-xs text-gray-500">Biografía</p>
                          <p className="text-sm text-gray-700">{mockProvider.personalInfo.bio}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  ℹ️ Esta información ya está guardada. Podrás editarla durante el proceso de registro.
                </p>
              </div>
            </div>
          )}

          {/* Type Selection (only if no mock) */}
          {!mockProvider && (
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                ¿Qué tipo de servicio ofreces?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="text-red-800">{error}</span>
            </div>
          )}

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={(!mockProvider && !selectedType) || processing}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-semibold text-lg disabled:opacity-50"
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <Loader className="w-5 h-5 animate-spin" />
                Procesando...
              </span>
            ) : mockProvider ? (
              'Reclamar mi Perfil y Continuar'
            ) : (
              'Continuar al Registro'
            )}
          </button>

          {mockProvider && (
            <p className="text-center text-sm text-gray-500 mt-4">
              Al continuar, tu perfil se activará y podrás completar tu información
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
