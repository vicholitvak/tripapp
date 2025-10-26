'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/context/OnboardingContext';
import { ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { Provider } from '@/types/provider';

export default function OnboardingBusinessPage() {
  const router = useRouter();
  const { draftData, updateDraft, nextStep, previousStep, loading, error } = useOnboarding();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    address: '',
    website: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (draftData.businessInfo) {
      setFormData({
        name: draftData.businessInfo.name || '',
        description: draftData.businessInfo.description || '',
        category: draftData.businessInfo.category || '',
        address: draftData.businessInfo.address || '',
        website: draftData.businessInfo.website || '',
      });
    }
  }, [draftData.businessInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateDraft('business', {
        businessInfo: {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          address: formData.address,
          website: formData.website,
          photos: draftData.businessInfo?.photos || [],
        } as Partial<Provider['businessInfo']>,
      });

      nextStep();
      router.push('/onboarding/services');
    } catch (err) {
      console.error('Error saving business info:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Información del Negocio</h1>
              <span className="text-sm font-semibold text-gray-600">Paso 2 de 6</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-600 to-red-600 h-2 rounded-full"
                style={{ width: '33.33%' }}
              ></div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="text-red-800">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
            <div className="space-y-6">
              {/* Nombre del Negocio */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Nombre del Negocio/Empresa *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="ej: Cocina de Doña Carmen"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Descripción del Negocio *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Describe tu negocio, especialidades, años de experiencia, etc..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  {formData.description.length}/1000 caracteres
                </p>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="ej: Cocina tradicional atacameña"
                />
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Dirección/Ubicación
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="ej: Calle Caracoles 542, San Pedro de Atacama"
                />
              </div>

              {/* Sitio Web */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Sitio Web / Instagram
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="ej: https://instagram.com/cocinadedona"
                />
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-gray-700"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={saving || loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-semibold disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Siguiente'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
