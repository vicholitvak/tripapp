'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/context/OnboardingContext';
import { Service } from '@/types/provider';
import { ArrowLeft, ArrowRight, Plus, Trash2, AlertCircle } from 'lucide-react';

export default function OnboardingServicesPage() {
  const router = useRouter();
  const { draftData, updateDraft, nextStep, loading, error } = useOnboarding();
  const [services, setServices] = useState<Service[]>([]);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (draftData.services) {
      setServices(draftData.services);
    }
  }, [draftData.services]);

  const handleAddService = () => {
    if (!newService.name || !newService.description || !newService.price) {
      alert('Completa todos los campos requeridos');
      return;
    }

    const service: Service = {
      name: newService.name,
      description: newService.description,
      price: parseFloat(newService.price),
      currency: 'CLP',
      duration: newService.duration || undefined,
      active: true,
    };

    setServices([...services, service]);
    setNewService({ name: '', description: '', price: '', duration: '' });
  };

  const handleRemoveService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (services.length === 0) {
      alert('Debes agregar al menos un servicio');
      return;
    }

    setSaving(true);
    try {
      await updateDraft('services', { services });
      nextStep();
      router.push('/onboarding/photos');
    } catch (err) {
      console.error('Error saving services:', err);
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
              <h1 className="text-2xl font-bold text-gray-900">Servicios y Precios</h1>
              <span className="text-sm font-semibold text-gray-600">Paso 3 de 6</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-600 to-red-600 h-2 rounded-full"
                style={{ width: '50%' }}
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
              {/* Servicios Agregados */}
              {services.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Servicios Agregados ({services.length})
                  </h3>
                  <div className="space-y-3">
                    {services.map((service, idx) => (
                      <div key={idx} className="flex items-start justify-between bg-gray-50 p-4 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{service.name}</h4>
                          <p className="text-sm text-gray-600">{service.description}</p>
                          <div className="flex gap-4 mt-2 text-sm text-gray-700">
                            <span className="font-bold text-orange-600">
                              ${service.price.toLocaleString('es-CL')}
                            </span>
                            {service.duration && <span>{service.duration}</span>}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveService(idx)}
                          className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Agregar Nuevo Servicio */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Agregar Servicio</h3>

                <div className="space-y-4">
                  {/* Nombre del Servicio */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Nombre del Servicio *
                    </label>
                    <input
                      type="text"
                      value={newService.name}
                      onChange={(e) =>
                        setNewService({ ...newService, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="ej: Pastel de Choclo"
                    />
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Descripción *
                    </label>
                    <textarea
                      value={newService.description}
                      onChange={(e) =>
                        setNewService({ ...newService, description: e.target.value })
                      }
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Describe tu servicio..."
                    />
                  </div>

                  {/* Precio */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Precio (CLP) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={newService.price}
                      onChange={(e) =>
                        setNewService({ ...newService, price: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="12000"
                    />
                  </div>

                  {/* Duración */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Duración / Cantidad (Opcional)
                    </label>
                    <input
                      type="text"
                      value={newService.duration}
                      onChange={(e) =>
                        setNewService({ ...newService, duration: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="ej: 2 horas, 4 personas, 1kg"
                    />
                  </div>

                  {/* Botón Agregar */}
                  <button
                    type="button"
                    onClick={handleAddService}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-semibold"
                  >
                    <Plus className="w-5 h-5" />
                    Agregar Servicio
                  </button>
                </div>
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
                  disabled={saving || loading || services.length === 0}
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
