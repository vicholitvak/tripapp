'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/context/OnboardingContext';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { Provider } from '@/types/provider';

export default function OnboardingProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { draftData, updateDraft, nextStep, previousStep, loading, error } = useOnboarding();
  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
    bio: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (draftData.personalInfo) {
      setFormData({
        displayName: draftData.personalInfo.displayName || '',
        phone: draftData.personalInfo.phone || '',
        bio: draftData.personalInfo.bio || '',
      });
    } else if (user?.displayName || user?.email) {
      setFormData((prev) => ({
        ...prev,
        displayName: user.displayName || user.email?.split('@')[0] || '',
      }));
    }
  }, [draftData.personalInfo, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateDraft('profile', {
        personalInfo: {
          displayName: formData.displayName,
          phone: formData.phone,
          email: user?.email || '',
          bio: formData.bio,
        } as Partial<Provider['personalInfo']>,
      });

      nextStep();
      router.push('/onboarding/business');
    } catch (err) {
      console.error('Error saving profile:', err);
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
              <h1 className="text-2xl font-bold text-gray-900">Información Personal</h1>
              <span className="text-sm font-semibold text-gray-600">Paso 1 de 6</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-600 to-red-600 h-2 rounded-full"
                style={{ width: '16.67%' }}
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
              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData({ ...formData, displayName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Tu nombre completo"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Teléfono de Contacto *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="+56 9 1234 5678"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Biografía/Presentación *
                </label>
                <textarea
                  required
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Cuéntanos un poco sobre ti y tu experiencia..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  {formData.bio.length}/500 caracteres
                </p>
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
