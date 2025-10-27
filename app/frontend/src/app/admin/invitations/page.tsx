'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { InvitationService } from '@/lib/services/invitationService';
import { MockProviderService } from '@/lib/services/mockProviderService';
import { Provider, ProviderType, Invitation } from '@/types/provider';
import { Plus, Copy, CheckCircle, AlertCircle, Link as LinkIcon, FileText, Clock, Mail } from 'lucide-react';

const PROVIDER_TYPES: { value: ProviderType; label: string }[] = [
  { value: 'cook', label: 'Cocinero' },
  { value: 'driver', label: 'Repartidor/Chofer' },
  { value: 'tour_guide', label: 'Guía Turístico' },
  { value: 'artisan', label: 'Artesano' },
  { value: 'transport', label: 'Taxi/Transfer' },
  { value: 'lodging', label: 'Alojamiento' },
  { value: 'service', label: 'Servicio' },
  { value: 'other', label: 'Otro' },
];

export default function AdminInvitationsPage() {
  const { user, role } = useAuth();
  const [invitationMode, setInvitationMode] = useState<'new' | 'link-mock'>('new');
  const [availableMocks, setAvailableMocks] = useState<Provider[]>([]);
  const [selectedMockId, setSelectedMockId] = useState<string | null>(null);
  const [existingInvitations, setExistingInvitations] = useState<Invitation[]>([]);
  const [formData, setFormData] = useState({
    recipientName: '',
    businessName: '',
    category: '',
    email: '',
    type: 'cook' as ProviderType,
    customMessage: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Load mocks and invitations
  useEffect(() => {
    if (user && role === 'Admin') {
      loadData();
    }
  }, [user, role]);

  const loadData = async () => {
    try {
      const [mocks, invitations] = await Promise.all([
        MockProviderService.getAllMocks(),
        InvitationService.listAll(),
      ]);

      // Filter mocks without invitations
      const mocksWithoutInvitation = mocks.filter(m => !m.linkedInvitationId && !m.claimedAt);
      setAvailableMocks(mocksWithoutInvitation);
      setExistingInvitations(invitations);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleMockSelect = (mockId: string) => {
    const mock = availableMocks.find(m => m.id === mockId);
    if (!mock) return;

    setSelectedMockId(mockId);
    setFormData({
      recipientName: mock.personalInfo.displayName,
      businessName: mock.businessInfo.name,
      category: mock.businessInfo.category,
      email: mock.personalInfo.email,
      type: mock.type,
      customMessage: '',
    });
  };

  const handleModeChange = (mode: 'new' | 'link-mock') => {
    setInvitationMode(mode);
    if (mode === 'new') {
      setSelectedMockId(null);
      setFormData({
        recipientName: '',
        businessName: '',
        category: '',
        email: '',
        type: 'cook',
        customMessage: '',
      });
    }
  };

  // Verificar si es admin
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const mockProviderId = invitationMode === 'link-mock' ? selectedMockId || undefined : undefined;

      const invitation = await InvitationService.createInvitation(
        formData.recipientName,
        formData.businessName,
        formData.category,
        formData.email,
        formData.type,
        user.uid,
        mockProviderId,
        formData.customMessage || undefined
      );

      setCreatedCode(invitation.code);
      setMessage({
        type: 'success',
        text: mockProviderId
          ? 'Invitación creada y vinculada al mock exitosamente'
          : 'Invitación creada exitosamente',
      });

      // Resetear formulario
      setFormData({
        recipientName: '',
        businessName: '',
        category: '',
        email: '',
        type: 'cook',
        customMessage: '',
      });
      setSelectedMockId(null);

      // Reload data
      loadData();
    } catch (error) {
      console.error('Error creating invitation:', error);
      setMessage({
        type: 'error',
        text: 'Error al crear la invitación',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (createdCode) {
      navigator.clipboard.writeText(createdCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Crear Invitación</h1>
          <p className="text-gray-600 mb-8">Genera una invitación personalizada para un nuevo proveedor</p>

          {/* Mode Toggle */}
          <div className="mb-8 flex gap-4">
            <button
              onClick={() => handleModeChange('new')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                invitationMode === 'new'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-5 h-5 inline-block mr-2" />
              Nueva Invitación
            </button>
            <button
              onClick={() => handleModeChange('link-mock')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                invitationMode === 'link-mock'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <LinkIcon className="w-5 h-5 inline-block mr-2" />
              Vincular Mock ({availableMocks.length})
            </button>
          </div>

          {/* Mock Selection (only in link-mock mode) */}
          {invitationMode === 'link-mock' && (
            <div className="mb-8 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Seleccionar Mock Provider
              </h3>
              {availableMocks.length === 0 ? (
                <p className="text-gray-600">
                  No hay mocks disponibles sin invitación.
                  <a href="/admin/mock-providers" className="text-orange-600 hover:underline ml-1">
                    Crear nuevo mock
                  </a>
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableMocks.map((mock) => (
                    <button
                      key={mock.id}
                      onClick={() => handleMockSelect(mock.id!)}
                      className={`text-left p-4 rounded-lg border-2 transition-colors ${
                        selectedMockId === mock.id
                          ? 'border-orange-600 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <h4 className="font-semibold text-gray-900">{mock.businessInfo.name}</h4>
                      <p className="text-sm text-gray-600">{mock.personalInfo.displayName}</p>
                      <p className="text-xs text-gray-500 mt-1">{mock.businessInfo.category}</p>
                      {mock.featured && (
                        <span className="inline-block mt-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                          Destacado
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <span
                className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}
              >
                {message.text}
              </span>
            </div>
          )}

          {createdCode && (
            <div className="mb-8 p-6 bg-white rounded-lg border-2 border-green-500 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Código Generado</h3>
              <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
                <code className="text-2xl font-bold text-green-600">{createdCode}</code>
                <button
                  onClick={handleCopyCode}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    copiedCode
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {copiedCode ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Usa este código en la tarjeta de invitación o comparte el enlace:
              </p>
              <code className="block mt-2 text-sm bg-gray-100 p-3 rounded break-all">
                https://santurist.vercel.app/invite/{createdCode}
              </code>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
            <div className="space-y-6">
              {/* Nombre del Proveedor */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Nombre del Proveedor *
                </label>
                <input
                  type="text"
                  required
                  value={formData.recipientName}
                  onChange={(e) =>
                    setFormData({ ...formData, recipientName: e.target.value })
                  }
                  placeholder="ej: Carmen, Roberto, María"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Nombre del Negocio */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Nombre del Negocio/Empresa *
                </label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) =>
                    setFormData({ ...formData, businessName: e.target.value })
                  }
                  placeholder="ej: Cocina de Doña Carmen"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Tipo de Servicio */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Tipo de Servicio *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as ProviderType })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {PROVIDER_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Categoría Específica *
                </label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="ej: cocinera tradicional, guía astronómico, artesana en cerámica"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email del Proveedor *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="ej: carmen@ejemplo.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Mensaje Personalizado */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Mensaje Personalizado (Opcional)
                </label>
                <textarea
                  value={formData.customMessage}
                  onChange={(e) =>
                    setFormData({ ...formData, customMessage: e.target.value })
                  }
                  placeholder="ej: Tu sazón atacameña es única"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Botón Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {loading ? 'Creando...' : 'Crear Invitación'}
              </button>
            </div>
          </form>

          {/* Preview */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Previsualización</h2>
            <div className="bg-white rounded-lg shadow-md p-8 max-w-sm">
              <div className="text-center space-y-4 text-sm">
                <p className="text-gray-700">
                  Hola {formData.recipientName || '[Nombre]'},
                </p>
                <p className="text-gray-700">
                  Queremos que <strong>{formData.businessName || '[Negocio]'}</strong> sea parte
                  de nuestra comunidad.
                </p>
                <p className="text-gray-700">
                  Reconocemos el valor que aportas a San Pedro de Atacama como{' '}
                  <strong>{formData.category || '[categoría]'}</strong>.
                </p>
                <div className="pt-4">
                  <div className="bg-gray-200 w-24 h-24 mx-auto rounded">
                    [QR]
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Existing Invitations */}
          {existingInvitations.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Invitaciones Recientes ({existingInvitations.length})
              </h2>
              <div className="space-y-4">
                {existingInvitations.slice(0, 5).map((invitation) => (
                  <div
                    key={invitation.id}
                    className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {invitation.businessName}
                        </h3>
                        <p className="text-sm text-gray-600">{invitation.recipientName}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {invitation.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {invitation.createdAt instanceof Date
                              ? invitation.createdAt.toLocaleDateString()
                              : new Date(invitation.createdAt.toDate()).toLocaleDateString()}
                          </span>
                        </div>
                        {invitation.mockProviderId && (
                          <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            Vinculado a Mock
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <code className="px-3 py-1 bg-gray-100 rounded text-sm font-mono">
                          {invitation.code}
                        </code>
                        <p className="text-xs text-gray-500 mt-2 capitalize">
                          {invitation.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
