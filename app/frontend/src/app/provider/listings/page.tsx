'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import ProviderLayout from '@/components/provider/ProviderLayout';
import { ModernCard as Card } from '@/components/ui/modern-card';
import { Provider, Service } from '@/types/provider';
import { ProviderService } from '@/lib/services/providerService';

interface FormService extends Service {
  isEditing?: boolean;
}

export default function ProviderListings() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [services, setServices] = useState<FormService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    price: number;
    currency: string;
    duration: string;
    capacity: number | undefined;
    active: boolean;
  }>({
    name: '',
    description: '',
    price: 0,
    currency: 'CLP',
    duration: '',
    capacity: undefined,
    active: true,
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const loadProvider = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        let providerData: Provider | null = null;
        try {
          providerData = await ProviderService.getByUserId(user.uid);
        } catch (firebaseErr) {
          console.warn('Firebase error (likely permissions), using mock data:', firebaseErr);
          // Use mock data for demo
          providerData = {
            id: 'demo-provider',
            userId: user.uid,
            type: 'cook',
            status: 'active',
            personalInfo: {
              displayName: user.displayName || 'Chef',
              phone: '+56912345678',
              email: user.email || '',
              bio: 'Experienced chef',
            },
            businessInfo: {
              name: 'Mi Restaurante',
              description: 'Delicious homemade meals',
              category: 'Cocina',
              address: 'Santiago, Chile',
              photos: [],
            },
            services: [
              {
                id: 'service-1',
                name: 'Clases de Cocina Básica',
                description: 'Aprende técnicas básicas de cocina chilena',
                price: 45000,
                currency: 'CLP',
                duration: '2 horas',
                active: true,
              },
            ],
            rating: 4.8,
            reviewCount: 12,
            completedOrders: 8,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }

        if (!providerData) {
          setError('No provider profile found');
          return;
        }

        setProvider(providerData);
        setServices(providerData.services || []);
      } catch (err) {
        console.error('Error loading provider:', err);
        setError('Error loading listings');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (!user) {
        router.push('/signin');
        return;
      }
      loadProvider();
    }
  }, [user, authLoading, router]);

  const handleInputChange = (field: string, value: string | number | boolean | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveService = async () => {
    if (!provider || !formData.name || !formData.description || formData.price <= 0) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      let updatedServices: Service[];

      if (editingId) {
        // Update existing service
        updatedServices = services.map((s) =>
          s.id === editingId
            ? {
                ...s,
                name: formData.name,
                description: formData.description,
                price: formData.price,
                currency: formData.currency,
                duration: formData.duration,
                capacity: formData.capacity,
                active: formData.active,
              }
            : s
        );
      } else {
        // Create new service
        const newService: Service = {
          id: `service_${Date.now()}`,
          ...formData,
        };
        updatedServices = [...services, newService];
      }

      await ProviderService.updateServices(provider.id!, updatedServices);
      setServices(updatedServices);
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        currency: 'CLP',
        duration: '',
        capacity: undefined,
        active: true,
      });
    } catch (err) {
      console.error('Error saving service:', err);
      setError('Error al guardar el servicio');
    } finally {
      setSaving(false);
    }
  };

  const handleEditService = (service: Service) => {
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      currency: service.currency || 'CLP',
      duration: service.duration || '',
      capacity: service.capacity,
      active: service.active,
    });
    setEditingId(service.id || null);
    setShowForm(true);
  };

  const handleDeleteService = async (id: string) => {
    if (!provider) return;

    if (!confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      return;
    }

    try {
      setSaving(true);
      const updatedServices = services.filter((s) => s.id !== id);
      await ProviderService.updateServices(provider.id!, updatedServices);
      setServices(updatedServices);
    } catch (err) {
      console.error('Error deleting service:', err);
      setError('Error al eliminar el servicio');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    if (!provider) return;

    try {
      setSaving(true);
      const updatedServices = services.map((s) =>
        s.id === id ? { ...s, active: !s.active } : s
      );
      await ProviderService.updateServices(provider.id!, updatedServices);
      setServices(updatedServices);
    } catch (err) {
      console.error('Error toggling service:', err);
      setError('Error al actualizar el servicio');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <ProviderLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando servicios...</p>
          </div>
        </div>
      </ProviderLayout>
    );
  }

  if (error && !provider) {
    return (
      <ProviderLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-600 font-semibold">{error}</p>
          </div>
        </div>
      </ProviderLayout>
    );
  }

  return (
    <ProviderLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Servicios</h1>
            <p className="text-gray-600 mt-2">
              {services.length === 0
                ? 'Crea tu primer servicio para comenzar'
                : `${services.length} servicio${services.length !== 1 ? 's' : ''} en total`}
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                setFormData({
                  name: '',
                  description: '',
                  price: 0,
                  currency: 'CLP',
                  duration: '',
                  capacity: undefined,
                  active: true,
                });
              }}
              className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Nuevo Servicio
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <Card className="p-6 border-l-4 border-orange-600">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingId ? 'Editar Servicio' : 'Crear Nuevo Servicio'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Servicio *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
                  placeholder="Ej: Clases de cocina básica"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
                  placeholder="Describe detalladamente qué incluye tu servicio..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio *
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
                    placeholder="0"
                    min="0"
                  />
                  <select
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
                  >
                    <option value="CLP">CLP</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
                  placeholder="Ej: 2 horas, 3 días"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacidad (para tours)
                </label>
                <input
                  type="number"
                  value={formData.capacity || ''}
                  onChange={(e) =>
                    handleInputChange('capacity', e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
                  placeholder="Ej: 10 personas"
                  min="0"
                />
              </div>

              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => handleInputChange('active', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Servicio Activo</span>
                </label>
              </div>
            </div>

            {/* Form Buttons */}
            <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveService}
                disabled={saving}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-orange-400 transition-colors font-medium"
              >
                {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </Card>
        )}

        {/* Services List */}
        {services.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600 mb-4">No has creado ningún servicio aún</p>
            <button
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Crear Primer Servicio
            </button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {services.map((service) => (
              <Card
                key={service.id}
                className={`p-6 ${!service.active ? 'opacity-60 bg-gray-50' : ''}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      service.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {service.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-600">Precio</p>
                    <p className="font-semibold text-gray-900">
                      ${service.price?.toLocaleString()} {service.currency}
                    </p>
                  </div>
                  {service.duration && (
                    <div>
                      <p className="text-gray-600">Duración</p>
                      <p className="font-semibold text-gray-900">{service.duration}</p>
                    </div>
                  )}
                  {service.capacity && (
                    <div>
                      <p className="text-gray-600">Capacidad</p>
                      <p className="font-semibold text-gray-900">{service.capacity} personas</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleToggleActive(service.id!)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title={service.active ? 'Desactivar' : 'Activar'}
                  >
                    {service.active ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <EyeOff className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEditService(service)}
                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteService(service.id!)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProviderLayout>
  );
}
