'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  AlertCircle,
  Loader,
  CheckCircle,
  Sparkles,
  Play,
  Database,
  Globe,
  Package,
  Calendar,
  TrendingUp,
  Trash2,
  XCircle,
} from 'lucide-react';
import { SeedStatusService } from '@/lib/services/seedStatusService';

interface SeedInfo {
  id: string;
  name: string;
  description: string;
  category: 'stay' | 'tour' | 'marketplace';
  icon: string;
  isSeeded: boolean;
}

interface SeedTemplate {
  id: string;
  name: string;
  url: string;
  description: string;
  icon: string;
}

interface ScrapedData {
  businessName: string;
  website: string;
  description: string;
  category: string;
  contact: {
    email?: string;
    phone?: string;
    whatsapp?: string;
    address?: string;
  };
  social: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  offerings: Array<{
    name: string;
    description: string;
    price?: number;
    currency?: string;
    duration?: string;
    capacity?: string;
  }>;
  images: {
    all: string[];
  };
}

export default function SeedsPage() {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState<'existing' | 'generate'>('existing');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Estado para seeds existentes
  const [seeds, setSeeds] = useState<SeedInfo[]>([
    {
      id: 'casa-voyage',
      name: 'Casa Voyage Hostel',
      description: 'Hostel con 3 tipos de espacios (compartido, privado, domos)',
      category: 'stay',
      icon: '🏠',
      isSeeded: false,
    },
    {
      id: 'tierra-gres',
      name: 'Tierra Gres',
      description: 'Cerámica gres artesanal (10 productos)',
      category: 'marketplace',
      icon: '🏺',
      isSeeded: false,
    },
    {
      id: 'joyas-relmu',
      name: 'Joyas Relmu',
      description: 'Joyería artesanal en plata (8 productos)',
      category: 'marketplace',
      icon: '💎',
      isSeeded: false,
    },
    {
      id: 'atacama-dark-sky',
      name: 'Atacama Dark Sky',
      description: 'Tours astronómicos (5 tours)',
      category: 'tour',
      icon: '🌟',
      isSeeded: false,
    },
  ]);

  // Estado para generar nuevo seed
  const [url, setUrl] = useState('');
  const [seedName, setSeedName] = useState('');
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [generatedFile, setGeneratedFile] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // Templates predefinidos de seeds
  const seedTemplates: SeedTemplate[] = [
    {
      id: 'casa-voyage',
      name: 'Casa Voyage Hostel',
      url: 'https://www.casavoyage.cl',
      description: 'Hostel con espacios compartidos, privados y domos',
      icon: '🏠',
    },
    {
      id: 'tierra-gres',
      name: 'Tierra Gres',
      url: 'https://www.tierragres.cl',
      description: 'Cerámica gres artesanal de San Pedro de Atacama',
      icon: '🏺',
    },
    {
      id: 'joyas-relmu',
      name: 'Joyas Relmu',
      url: 'https://www.instagram.com/joyas_relmu',
      description: 'Joyería artesanal en plata con piedras del desierto',
      icon: '💎',
    },
    {
      id: 'atacama-dark-sky',
      name: 'Atacama Dark Sky',
      url: 'https://www.atacamadarksky.cl',
      description: 'Tours astronómicos guiados con telescopios',
      icon: '🌟',
    },
  ];

  useEffect(() => {
    loadSeedStatus();
  }, []);

  const loadSeedStatus = async () => {
    try {
      const status = await SeedStatusService.getAllSeedStatus();
      setSeeds(prevSeeds => prevSeeds.map(seed => ({
        ...seed,
        isSeeded: status[seed.id.replace(/-/g, '') as keyof typeof status] || false,
      })));
    } catch (error) {
      console.error('Error loading seed status:', error);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);

    if (templateId === '') {
      // Limpiar si selecciona "Personalizado"
      setUrl('');
      setSeedName('');
      return;
    }

    const template = seedTemplates.find(t => t.id === templateId);
    if (template) {
      setUrl(template.url);
      setSeedName(template.id);
      setScrapedData(null);
      setGeneratedFile(null);
    }
  };

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

  const handleExecuteSeed = async (seedId: string) => {
    if (!confirm(`¿Estás seguro de ejecutar el seed para ${seeds.find(s => s.id === seedId)?.name}?`)) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/execute-seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seedName: seedId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to execute seed');
      }

      setMessage({
        type: 'success',
        text: `✅ Seed ejecutado exitosamente!`
      });

      // Recargar estado de seeds
      await loadSeedStatus();
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ Error: ${error instanceof Error ? error.message : 'Failed to execute seed'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSeed = async (seedId: string, seedName: string) => {
    if (!confirm(`⚠️ ADVERTENCIA: Esto eliminará TODOS los datos de "${seedName}".\n\n¿Estás seguro de continuar?`)) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Map seed IDs to business names
      const businessNameMap: { [key: string]: string } = {
        'casa-voyage': 'Casa Voyage Hostel',
        'tierra-gres': 'Tierra Gres',
        'joyas-relmu': 'Joyas Relmu',
        'atacama-dark-sky': 'Atacama NightSky',
      };

      const businessName = businessNameMap[seedId];

      if (!businessName) {
        throw new Error(`Unknown seed: ${seedId}`);
      }

      const response = await fetch('/api/admin/cleanup-seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete seed');
      }

      setMessage({
        type: 'success',
        text: `✅ Seed "${seedName}" eliminado exitosamente!`
      });

      // Recargar estado de seeds
      await loadSeedStatus();
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ Error: ${error instanceof Error ? error.message : 'Failed to delete seed'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllSeeds = async () => {
    if (!confirm('⚠️ PELIGRO: Esto eliminará TODOS los datos de TODOS los seeds.\n\n¿Estás absolutamente seguro?')) {
      return;
    }

    if (!confirm('Esta acción NO se puede deshacer. ¿Continuar?')) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/cleanup-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete all seeds');
      }

      setMessage({
        type: 'success',
        text: `✅ Todos los seeds eliminados exitosamente!`
      });

      // Recargar estado de seeds
      await loadSeedStatus();
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ Error: ${error instanceof Error ? error.message : 'Failed to delete all seeds'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScrape = async () => {
    if (!url || !seedName) {
      setMessage({ type: 'error', text: 'Por favor ingresa URL y nombre del seed' });
      return;
    }

    setLoading(true);
    setMessage(null);
    setScrapedData(null);
    setGeneratedFile(null);

    try {
      const response = await fetch('/api/scrape-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to scrape website');
      }

      const data = await response.json();
      setScrapedData(data);
      setMessage({
        type: 'success',
        text: `✅ Información extraída de ${data.businessName}`
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ Error: ${error instanceof Error ? error.message : 'Failed to scrape'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFile = async () => {
    if (!scrapedData) {
      setMessage({ type: 'error', text: 'Primero debes extraer la información' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/generate-seed-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          seedName,
          data: scrapedData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate seed file');
      }

      const result = await response.json();
      setGeneratedFile(result.filePath);
      setMessage({
        type: 'success',
        text: `✅ Archivo seed generado: ${result.fileName}`
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ Error: ${error instanceof Error ? error.message : 'Failed to generate file'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteGeneratedSeed = async () => {
    if (!generatedFile) {
      setMessage({ type: 'error', text: 'Primero debes generar el archivo seed' });
      return;
    }

    if (!confirm(`¿Estás seguro de ejecutar el seed para ${scrapedData?.businessName}?`)) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/execute-seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seedName }),
      });

      if (!response.ok) {
        throw new Error('Failed to execute seed');
      }

      setMessage({
        type: 'success',
        text: '✅ Seed ejecutado exitosamente!'
      });

      // Limpiar formulario
      setUrl('');
      setSeedName('');
      setScrapedData(null);
      setGeneratedFile(null);

      // Cambiar a tab de seeds existentes
      setActiveTab('existing');
      await loadSeedStatus();
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ Error: ${error instanceof Error ? error.message : 'Failed to execute seed'}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Database className="w-8 h-8 text-purple-600" />
          <h1 className="text-4xl font-bold text-gray-900">Gestión de Seeds</h1>
        </div>
        <p className="text-gray-600 mb-8">Ejecuta seeds existentes o genera nuevos desde URLs</p>

        {/* Mensaje Global */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-50 border border-green-200' :
            message.type === 'error' ? 'bg-red-50 border border-red-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className={
              message.type === 'success' ? 'text-green-800' :
              message.type === 'error' ? 'text-red-800' :
              'text-blue-800'
            }>
              {message.text}
            </span>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('existing')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'existing'
                  ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Package className="w-5 h-5" />
              Seeds Existentes
            </button>
            <button
              onClick={() => setActiveTab('generate')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'generate'
                  ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              Generar Nuevo
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'existing' ? (
              /* Tab de Seeds Existentes */
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Seeds Ejecutados</h2>
                    <p className="text-gray-600 mt-1">
                      Seeds que están actualmente en la base de datos
                    </p>
                  </div>
                  {seeds.filter(seed => seed.isSeeded).length > 0 && (
                    <button
                      onClick={handleDeleteAllSeeds}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar Todos
                    </button>
                  )}
                </div>

                {seeds.filter(seed => seed.isSeeded).length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      No hay seeds ejecutados
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Usa el tab "Generar Nuevo" para crear y ejecutar seeds
                    </p>
                    <button
                      onClick={() => setActiveTab('generate')}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      <Sparkles className="w-5 h-5" />
                      Ir a Generar Nuevo
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {seeds.filter(seed => seed.isSeeded).map(seed => (
                    <div
                      key={seed.id}
                      className="border border-gray-200 rounded-lg p-6 hover:border-purple-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">{seed.icon}</span>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{seed.name}</h3>
                            <p className="text-sm text-gray-600">{seed.description}</p>
                          </div>
                        </div>
                        {seed.isSeeded && (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          seed.category === 'stay' ? 'bg-blue-100 text-blue-700' :
                          seed.category === 'tour' ? 'bg-purple-100 text-purple-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {seed.category === 'stay' ? '🏨 Alojamiento' :
                           seed.category === 'tour' ? '🎯 Tours' :
                           '🛒 Marketplace'}
                        </span>
                        {seed.isSeeded && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            ✓ Ejecutado
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleExecuteSeed(seed.id)}
                          disabled={loading}
                          className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin" />
                              Ejecutando...
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4" />
                              {seed.isSeeded ? 'Ejecutar de nuevo' : 'Ejecutar'}
                            </>
                          )}
                        </button>

                        {seed.isSeeded && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSeed(seed.id, seed.name);
                            }}
                            disabled={loading}
                            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium flex items-center justify-center disabled:bg-gray-200 disabled:cursor-not-allowed"
                            title="Eliminar seed"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Tab de Generar Nuevo */
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Generar Seed desde URL</h2>
                <p className="text-gray-600 mb-6">
                  Extrae información de un sitio web y genera un seed automáticamente
                </p>

                {/* Paso 1: Extraer */}
                <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                    Extraer Información
                  </h3>

                  <div className="space-y-4">
                    {/* Template Selector */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Seleccionar Template
                      </label>
                      <select
                        value={selectedTemplate}
                        onChange={(e) => handleTemplateSelect(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      >
                        <option value="">Personalizado (ingresar manualmente)</option>
                        {seedTemplates.map(template => (
                          <option key={template.id} value={template.id}>
                            {template.icon} {template.name} - {template.url}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Selecciona un template predefinido o ingresa manualmente
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        URL del Proveedor
                      </label>
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://ejemplo.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nombre del Seed (kebab-case)
                      </label>
                      <input
                        type="text"
                        value={seedName}
                        onChange={(e) => setSeedName(e.target.value)}
                        placeholder="mi-proveedor"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Ejemplo: tierra-gres, joyas-relmu, casa-voyage
                      </p>
                    </div>

                    <button
                      onClick={handleScrape}
                      disabled={loading || !url || !seedName}
                      className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Extrayendo...
                        </>
                      ) : (
                        <>
                          <Globe className="w-5 h-5" />
                          Extraer Información
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Paso 2: Generar */}
                {scrapedData && (
                  <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                      Información Extraída
                    </h3>

                    <div className="bg-white rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-semibold text-gray-700">Nombre:</span>
                          <p className="text-gray-900">{scrapedData.businessName}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Categoría:</span>
                          <p className="text-gray-900">{scrapedData.category}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Email:</span>
                          <p className="text-gray-900">{scrapedData.contact.email || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Teléfono:</span>
                          <p className="text-gray-900">{scrapedData.contact.phone || 'N/A'}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="font-semibold text-gray-700">Descripción:</span>
                          <p className="text-gray-900">{scrapedData.description}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="font-semibold text-gray-700">Imágenes:</span>
                          <p className="text-gray-900">{scrapedData.images.all.length} encontradas</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleGenerateFile}
                      disabled={loading}
                      className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Generar Archivo Seed
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Paso 3: Ejecutar */}
                {generatedFile && (
                  <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
                      Ejecutar Seed
                    </h3>

                    <p className="text-sm text-gray-700 mb-2">
                      Archivo generado: <code className="bg-white px-2 py-1 rounded font-mono text-xs">{generatedFile}</code>
                    </p>

                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-800">
                        ℹ️ El seed ha sido registrado automáticamente. Espera unos segundos para que Next.js recompile antes de ejecutar.
                      </p>
                    </div>

                    <button
                      onClick={handleExecuteGeneratedSeed}
                      disabled={loading}
                      className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Ejecutando...
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5" />
                          Ejecutar Seed
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
