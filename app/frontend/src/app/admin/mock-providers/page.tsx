'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MockProviderService } from '@/lib/services/mockProviderService';
import { InvitationService } from '@/lib/services/invitationService';
import { Provider, ProviderType } from '@/types/provider';
import {
  Plus,
  Edit,
  Trash2,
  Mail,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  Package,
} from 'lucide-react';

const PROVIDER_TYPES: { value: ProviderType; label: string }[] = [
  { value: 'cook', label: 'Cocinero' },
  { value: 'driver', label: 'Repartidor/Chofer' },
  { value: 'tour_guide', label: 'Guía Turístico' },
  { value: 'artisan', label: 'Artesano' },
  { value: 'transport', label: 'Taxi/Transfer' },
  { value: 'service', label: 'Servicio' },
  { value: 'other', label: 'Otro' },
];

interface MockFormData {
  type: ProviderType;
  businessName: string;
  description: string;
  category: string;
  displayName: string;
  phone?: string;
  email: string;
  bio?: string;
  featured?: boolean;
}

export default function AdminMockProvidersPage() {
  const { user, role } = useAuth();
  const [mocks, setMocks] = useState<Provider[]>([]);
  const [stats, setStats] = useState({ total: 0, withInvitation: 0, claimed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingMock, setEditingMock] = useState<Provider | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user && role === 'admin') {
      loadMocks();
    }
  }, [user, role]);

  const loadMocks = async () => {
    try {
      setLoading(true);
      const [mocksList, mockStats] = await Promise.all([
        MockProviderService.getAllMocks(),
        MockProviderService.getMockStats(),
      ]);
      setMocks(mocksList);
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading mocks:', error);
      setMessage({ type: 'error', text: 'Error al cargar los mocks' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMock = () => {
    setEditingMock(null);
    setShowCreateForm(true);
  };

  const handleEditMock = (mock: Provider) => {
    setEditingMock(mock);
    setShowCreateForm(true);
  };

  const handleDeleteMock = async (mockId: string) => {
    if (!confirm('¿Estás seguro de eliminar este mock? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await MockProviderService.deleteMock(mockId);
      setMessage({ type: 'success', text: 'Mock eliminado exitosamente' });
      loadMocks();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar mock';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  const handleGenerateInvitation = async (mock: Provider) => {
    if (!mock.id) return;

    // Verificar si ya tiene invitación
    if (mock.linkedInvitationId) {
      setMessage({ type: 'error', text: 'Este mock ya tiene una invitación vinculada' });
      return;
    }

    const email = prompt('Email del proveedor que recibirá la invitación:');
    if (!email) return;

    try {
      const invitation = await InvitationService.createInvitation(
        mock.personalInfo.displayName,
        mock.businessInfo.name,
        mock.businessInfo.category,
        email,
        mock.type,
        user!.uid,
        mock.id
      );

      setMessage({
        type: 'success',
        text: `Invitación creada: ${invitation.code}`,
      });
      loadMocks();
    } catch (error) {
      console.error('Error creating invitation:', error);
      setMessage({ type: 'error', text: 'Error al crear invitación' });
    }
  };

  const getStatusBadge = (mock: Provider) => {
    if (mock.claimedAt) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Reclamado
        </span>
      );
    }
    if (mock.linkedInvitationId) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <Mail className="w-3 h-3" />
          Invitación Pendiente
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 flex items-center gap-1">
        <Package className="w-3 h-3" />
        Sin Invitación
      </span>
    );
  };

  if (showCreateForm) {
    return (
      <MockProviderForm
        mock={editingMock}
        onSave={async (data) => {
          try {
            if (editingMock?.id) {
              await MockProviderService.updateMock(editingMock.id, data);
              setMessage({ type: 'success', text: 'Mock actualizado exitosamente' });
            } else {
              await MockProviderService.createMock(data, user!.uid);
              setMessage({ type: 'success', text: 'Mock creado exitosamente' });
            }
            setShowCreateForm(false);
            loadMocks();
          } catch (error) {
            console.error('Error saving mock:', error);
            setMessage({ type: 'error', text: 'Error al guardar mock' });
          }
        }}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Mock Providers</h1>
            <p className="text-gray-600">
              Gestiona proveedores pre-configurados para el sistema de onboarding
            </p>
          </div>
          <button
            onClick={handleCreateMock}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Crear Mock
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <p className="text-sm text-gray-600 mb-1">Total Mocks</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
            <p className="text-sm text-gray-600 mb-1">Con Invitación</p>
            <p className="text-3xl font-bold text-gray-900">{stats.withInvitation}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <p className="text-sm text-gray-600 mb-1">Reclamados</p>
            <p className="text-3xl font-bold text-gray-900">{stats.claimed}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
            <p className="text-sm text-gray-600 mb-1">Pendientes</p>
            <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
          </div>
        </div>

        {/* Message */}
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
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <span className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </span>
            <button
              onClick={() => setMessage(null)}
              className="ml-auto text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Mocks List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Cargando mocks...</p>
          </div>
        ) : mocks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay mocks creados</h3>
            <p className="text-gray-600 mb-6">
              Crea tu primer mock provider para comenzar a enviar invitaciones
            </p>
            <button
              onClick={handleCreateMock}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Crear Primer Mock
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {mocks.map((mock) => (
              <div
                key={mock.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {mock.businessInfo.name}
                      </h3>
                      {getStatusBadge(mock)}
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {PROVIDER_TYPES.find((t) => t.value === mock.type)?.label}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{mock.businessInfo.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-semibold text-gray-700">Contacto:</span>{' '}
                        {mock.personalInfo.displayName}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Email:</span>{' '}
                        {mock.personalInfo.email}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Categoría:</span>{' '}
                        {mock.businessInfo.category}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Servicios:</span>{' '}
                        {mock.services.length} configurados
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 ml-4">
                    {!mock.linkedInvitationId && !mock.claimedAt && (
                      <button
                        onClick={() => handleGenerateInvitation(mock)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Generar Invitación"
                      >
                        <Mail className="w-5 h-5" />
                      </button>
                    )}
                    {!mock.claimedAt && (
                      <>
                        <button
                          onClick={() => handleEditMock(mock)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMock(mock.id!)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente de formulario para crear/editar mock
function MockProviderForm({
  mock,
  onSave,
  onCancel,
}: {
  mock: Provider | null;
  onSave: (data: MockFormData) => Promise<void>;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    type: mock?.type || ('cook' as ProviderType),
    businessName: mock?.businessInfo.name || '',
    description: mock?.businessInfo.description || '',
    category: mock?.businessInfo.category || '',
    displayName: mock?.personalInfo.displayName || '',
    phone: mock?.personalInfo.phone || '',
    email: mock?.personalInfo.email || '',
    bio: mock?.personalInfo.bio || '',
    featured: mock?.featured || false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {mock ? 'Editar Mock Provider' : 'Crear Mock Provider'}
            </h1>
            <p className="text-gray-600">
              Configura un proveedor pre-establecido para el sistema de onboarding
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
            {/* Tipo de Proveedor */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Tipo de Proveedor *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ProviderType })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {PROVIDER_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Nombre del Negocio */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Nombre del Negocio *
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="ej: Atacama Balloon Adventures"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Descripción del Negocio *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe el negocio y los servicios que ofrece..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
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
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="ej: Vuelos en globo, Guía astronómico"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Nombre del Contacto */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Nombre del Contacto *
              </label>
              <input
                type="text"
                required
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="ej: Roberto González"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ej: roberto@atacamaballoon.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Teléfono (opcional)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="ej: +56912345678"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Biografía (opcional)
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Breve biografía del proveedor..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Featured */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
              />
              <label htmlFor="featured" className="text-sm font-semibold text-gray-900">
                Destacar este proveedor
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Guardando...' : mock ? 'Actualizar Mock' : 'Crear Mock'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
