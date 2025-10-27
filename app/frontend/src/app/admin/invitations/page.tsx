'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { InvitationService } from '@/lib/services/invitationService';
import { ProviderType } from '@/types/provider';
import { Plus, Copy, CheckCircle, AlertCircle } from 'lucide-react';

const PROVIDER_TYPES: { value: ProviderType; label: string }[] = [
  { value: 'cook', label: 'Cocinero' },
  { value: 'driver', label: 'Repartidor/Chofer' },
  { value: 'tour_guide', label: 'Guía Turístico' },
  { value: 'artisan', label: 'Artesano' },
  { value: 'transport', label: 'Taxi/Transfer' },
  { value: 'service', label: 'Servicio' },
  { value: 'other', label: 'Otro' },
];

export default function AdminInvitationsPage() {
  const { user, role } = useAuth();
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

  // Verificar si es admin
  if (!user || role !== 'admin') {
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
      const invitation = await InvitationService.createInvitation(
        formData.recipientName,
        formData.businessName,
        formData.category,
        formData.email,
        formData.type,
        user.uid,
        undefined, // mockProviderId
        formData.customMessage || undefined
      );

      setCreatedCode(invitation.code);
      setMessage({
        type: 'success',
        text: 'Invitación creada exitosamente',
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
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Crear Invitación</h1>
          <p className="text-gray-600 mb-8">Genera una invitación personalizada para un nuevo proveedor</p>

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
        </div>
      </div>
    </div>
  );
}
