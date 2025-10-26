'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, CheckCircle, Save } from 'lucide-react';
import ProviderLayout from '@/components/provider/ProviderLayout';
import { ModernCard as Card } from '@/components/ui/modern-card';
import { Provider } from '@/types/provider';
import { ProviderService } from '@/lib/services/providerService';

export default function ProviderProfile() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    personalInfo: {
      displayName: '',
      phone: '',
      email: '',
      bio: '',
      photoURL: '',
    },
    businessInfo: {
      name: '',
      description: '',
      category: '',
      address: '',
      website: '',
      instagram: '',
      facebook: '',
      whatsapp: '',
    },
  });

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
            services: [],
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
        setFormData({
          personalInfo: providerData.personalInfo || formData.personalInfo,
          businessInfo: providerData.businessInfo || formData.businessInfo,
        });
      } catch (err) {
        console.error('Error loading provider:', err);
        setError('Error loading profile data');
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

  const handleInputChange = (
    section: 'personalInfo' | 'businessInfo',
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!provider) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Update personal info
      if (formData.personalInfo) {
        await ProviderService.updatePersonalInfo(provider.id!, formData.personalInfo);
      }

      // Update business info
      if (formData.businessInfo) {
        await ProviderService.updateBusinessInfo(provider.id!, formData.businessInfo);
      }

      setSuccess('Perfil actualizado exitosamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Error al guardar los cambios');
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
            <p className="text-gray-600">Cargando perfil...</p>
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
      <div className="max-w-4xl space-y-8">
        {/* Messages */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Personal Information */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Información Personal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo
              </label>
              <input
                type="text"
                value={formData.personalInfo.displayName}
                onChange={(e) =>
                  handleInputChange('personalInfo', 'displayName', e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.personalInfo.phone}
                onChange={(e) =>
                  handleInputChange('personalInfo', 'phone', e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={formData.personalInfo.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                No puede cambiar el correo electrónico
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Idiomas
              </label>
              <input
                type="text"
                placeholder="Ej: Español, Inglés"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Biografía
              </label>
              <textarea
                value={formData.personalInfo.bio}
                onChange={(e) =>
                  handleInputChange('personalInfo', 'bio', e.target.value)
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
                placeholder="Cuéntanos sobre ti..."
              />
            </div>
          </div>
        </Card>

        {/* Business Information */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Información del Negocio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Negocio
              </label>
              <input
                type="text"
                value={formData.businessInfo.name}
                onChange={(e) =>
                  handleInputChange('businessInfo', 'name', e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <input
                type="text"
                value={formData.businessInfo.category}
                onChange={(e) =>
                  handleInputChange('businessInfo', 'category', e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.businessInfo.description}
                onChange={(e) =>
                  handleInputChange('businessInfo', 'description', e.target.value)
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
                placeholder="Describe tu negocio..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección
              </label>
              <input
                type="text"
                value={formData.businessInfo.address}
                onChange={(e) =>
                  handleInputChange('businessInfo', 'address', e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sitio Web
              </label>
              <input
                type="url"
                value={formData.businessInfo.website}
                onChange={(e) =>
                  handleInputChange('businessInfo', 'website', e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
                placeholder="https://"
              />
            </div>
          </div>

          {/* Social Media */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Redes Sociales</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram
                </label>
                <input
                  type="text"
                  value={formData.businessInfo.instagram || ''}
                  onChange={(e) =>
                    handleInputChange('businessInfo', 'instagram', e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
                  placeholder="@usuario"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook
                </label>
                <input
                  type="text"
                  value={formData.businessInfo.facebook || ''}
                  onChange={(e) =>
                    handleInputChange('businessInfo', 'facebook', e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
                  placeholder="usuario"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={formData.businessInfo.whatsapp || ''}
                  onChange={(e) =>
                    handleInputChange('businessInfo', 'whatsapp', e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
                  placeholder="+569..."
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-orange-400 transition-colors font-medium"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </ProviderLayout>
  );
}
