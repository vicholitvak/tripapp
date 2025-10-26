'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/context/OnboardingContext';
import { ArrowLeft, ArrowRight, Upload, X, AlertCircle } from 'lucide-react';

export default function OnboardingPhotosPage() {
  const router = useRouter();
  const { draftData, updateDraft, nextStep, loading, error } = useOnboarding();
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoInputs, setPhotoInputs] = useState<string[]>(['', '', '']);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (draftData.businessInfo?.photos) {
      setPhotos(draftData.businessInfo.photos);
    }
  }, [draftData.businessInfo?.photos]);

  const handlePhotoInput = (idx: number, value: string) => {
    const newInputs = [...photoInputs];
    newInputs[idx] = value;
    setPhotoInputs(newInputs);
  };

  const handleAddPhoto = (idx: number) => {
    if (photoInputs[idx] && !photos.includes(photoInputs[idx])) {
      setPhotos([...photos, photoInputs[idx]]);
      handlePhotoInput(idx, '');
    }
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotos(photos.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (photos.length === 0) {
      alert('Debes agregar al menos una foto');
      return;
    }

    setSaving(true);
    try {
      await updateDraft('media', {
        businessInfo: {
          photos,
        },
      });
      nextStep();
      router.push('/onboarding/review');
    } catch (err) {
      console.error('Error saving photos:', err);
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
              <h1 className="text-2xl font-bold text-gray-900">Fotos de Trabajo</h1>
              <span className="text-sm font-semibold text-gray-600">Paso 4 de 6</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-600 to-red-600 h-2 rounded-full"
                style={{ width: '66.67%' }}
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
              <p className="text-gray-600">
                Sube URL de fotos de tu trabajo, productos o lugar de atención. Mínimo 1 foto.
              </p>

              {/* Fotos Agregadas */}
              {photos.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Fotos ({photos.length})
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {photos.map((photo, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={photo}
                          alt={`Foto ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src =
                              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3C/svg%3E';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Agregar Fotos */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Agregar Fotos</h3>
                <div className="space-y-4">
                  {photoInputs.map((input, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="url"
                        value={input}
                        onChange={(e) => handlePhotoInput(idx, e.target.value)}
                        placeholder="https://ejemplo.com/foto.jpg"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddPhoto(idx)}
                        disabled={!input}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Agregar
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Puedes usar URLs de fotos de Unsplash (unsplash.com) o tu propio servidor
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
                  disabled={saving || loading || photos.length === 0}
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
