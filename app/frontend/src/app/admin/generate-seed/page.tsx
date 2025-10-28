'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  AlertCircle,
  Loader,
  CheckCircle,
  Sparkles,
  Download,
  Play,
  FileText,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

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

export default function GenerateSeedPage() {
  const { user, role } = useAuth();
  const [url, setUrl] = useState('');
  const [seedName, setSeedName] = useState('');
  const [loading, setLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [generatedFile, setGeneratedFile] = useState<string | null>(null);
  const [executionResult, setExecutionResult] = useState<{ leadId: string; invitationCode: string } | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

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

  const handleScrape = async () => {
    if (!url || !seedName) {
      setMessage({ type: 'error', text: 'Por favor ingresa URL y nombre del seed' });
      return;
    }

    setLoading(true);
    setMessage(null);
    setScrapedData(null);
    setGeneratedFile(null);
    setExecutionResult(null);

    try {
      const response = await fetch('/api/scrape-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to scrape website');
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

  const handleExecuteSeed = async () => {
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

      const result = await response.json();
      setExecutionResult(result.result);
      setMessage({
        type: 'success',
        text: '✅ Seed ejecutado exitosamente!'
      });
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
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-purple-600" />
          <h1 className="text-4xl font-bold text-gray-900">Generador Automático de Seeds</h1>
        </div>
        <p className="text-gray-600 mb-8">Extrae información de sitios web y crea seeds automáticamente</p>

        {/* Mensaje */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-50 border border-green-200' :
            message.type === 'error' ? 'bg-red-50 border border-red-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">1. Información del Proveedor</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                URL del Sitio Web
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.ejemplo.cl"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre del Seed (kebab-case)
              </label>
              <input
                type="text"
                value={seedName}
                onChange={(e) => setSeedName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="ejemplo-seed-name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ej: atacama-dark-sky, casa-voyage, etc.
              </p>
            </div>

            <button
              onClick={handleScrape}
              disabled={loading || !url || !seedName}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              {loading && !scrapedData ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Extrayendo...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  1. Extraer Información
                </>
              )}
            </button>

            {scrapedData && (
              <>
                <button
                  onClick={handleGenerateFile}
                  disabled={loading || !!generatedFile}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                >
                  {loading && !generatedFile ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Generando...
                    </>
                  ) : generatedFile ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Archivo Generado ✓
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      2. Generar Archivo Seed
                    </>
                  )}
                </button>

                {generatedFile && (
                  <button
                    onClick={handleExecuteSeed}
                    disabled={loading || !!executionResult}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                  >
                    {loading && !executionResult ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Ejecutando...
                      </>
                    ) : executionResult ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Seed Ejecutado ✓
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        3. Ejecutar Seed
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Preview de Datos */}
          {scrapedData && (
            <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">📊 Información Extraída</h2>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Negocio</p>
                  <p className="text-gray-900">{scrapedData.businessName}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-600">Categoría</p>
                  <p className="text-gray-900">{scrapedData.category}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-600">Descripción</p>
                  <p className="text-sm text-gray-700">{scrapedData.description}</p>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <p className="text-sm font-semibold text-gray-600 mb-2">Contacto</p>
                  {scrapedData.contact.email && (
                    <p className="text-sm text-gray-700">📧 {scrapedData.contact.email}</p>
                  )}
                  {scrapedData.contact.phone && (
                    <p className="text-sm text-gray-700">📱 {scrapedData.contact.phone}</p>
                  )}
                  {scrapedData.contact.whatsapp && (
                    <p className="text-sm text-gray-700">💬 {scrapedData.contact.whatsapp}</p>
                  )}
                </div>

                {scrapedData.social.instagram && (
                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-sm font-semibold text-gray-600 mb-2">Redes Sociales</p>
                    <p className="text-sm text-gray-700">📷 {scrapedData.social.instagram}</p>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3">
                  <p className="text-sm font-semibold text-gray-600 mb-2">
                    Servicios ({scrapedData.offerings.length})
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {scrapedData.offerings.slice(0, 5).map((offering, i) => (
                      <li key={i}>• {offering.name}</li>
                    ))}
                    {scrapedData.offerings.length > 5 && (
                      <li className="text-gray-500">... y {scrapedData.offerings.length - 5} más</li>
                    )}
                  </ul>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <p className="text-sm font-semibold text-gray-600 mb-2">
                    <ImageIcon className="w-4 h-4 inline mr-1" />
                    Imágenes ({scrapedData.images.all.length})
                  </p>
                  {scrapedData.images.all.length > 0 ? (
                    <div className="flex gap-2 flex-wrap">
                      {scrapedData.images.all.slice(0, 4).map((img, i) => (
                        <a
                          key={i}
                          href={img}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Img {i + 1}
                        </a>
                      ))}
                      {scrapedData.images.all.length > 4 && (
                        <span className="text-xs text-gray-500">
                          +{scrapedData.images.all.length - 4} más
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No se encontraron imágenes</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resultado de Ejecución */}
        {executionResult && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">✅ Seed Ejecutado Exitosamente</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm font-semibold text-gray-600">Provider Lead ID</p>
                <p className="text-sm font-mono text-gray-900 mt-1">{executionResult.leadId}</p>
                <Link
                  href="/admin/provider-leads"
                  className="text-xs text-purple-600 hover:underline"
                >
                  Ver en dashboard →
                </Link>
              </div>

              <div className="bg-purple-50 border border-purple-200 p-4 rounded">
                <p className="text-sm font-semibold text-purple-900">Código de Invitación</p>
                <p className="text-lg font-mono font-bold text-purple-900 mt-1">
                  {executionResult.invitationCode}
                </p>
                <Link
                  href={`/invite/${executionResult.invitationCode}`}
                  className="text-xs text-purple-600 hover:underline"
                >
                  Abrir invitación →
                </Link>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>📧 Siguiente paso:</strong> Contacta al proveedor para compartir la invitación.
              </p>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">ℹ️ Cómo funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                  1
                </div>
                <h3 className="font-semibold text-gray-900">Extracción</h3>
              </div>
              <p className="text-sm text-gray-600">
                Ingresa la URL del proveedor y un nombre para el seed. El sistema extraerá automáticamente:
                contacto, servicios, imágenes, redes sociales, etc.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  2
                </div>
                <h3 className="font-semibold text-gray-900">Generación</h3>
              </div>
              <p className="text-sm text-gray-600">
                Revisa los datos extraídos y genera el archivo seed. Se creará automáticamente en
                src/lib/seeds/ listo para usar.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                  3
                </div>
                <h3 className="font-semibold text-gray-900">Ejecución</h3>
              </div>
              <p className="text-sm text-gray-600">
                Ejecuta el seed para crear el ProviderLead e Invitación en Firebase.
                El proveedor recibirá un código único para reclamar su perfil.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
