'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProviderService } from '@/lib/services/providerService';
import { ApprovalRequest } from '@/types/provider';
import { CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';

function AdminApprovalsContent() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<{ [key: string]: string }>({});
  const [rejectReason, setRejectReason] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const pendingRequests = await ProviderService.listPendingApprovals();
      setRequests(pendingRequests);
    } catch (error) {
      console.error('Error loading requests:', error);
      setMessage({
        type: 'error',
        text: 'Error al cargar solicitudes de aprobación',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string, providerId: string) => {
    if (!user) return;
    setProcessing(requestId);
    try {
      await ProviderService.approveProvider(
        requestId,
        providerId,
        user.uid,
        reviewNotes[requestId] || ''
      );

      setMessage({
        type: 'success',
        text: 'Proveedor aprobado exitosamente',
      });

      // Recargar solicitudes
      await loadRequests();
      setExpandedId(null);
      setReviewNotes({});
    } catch (error) {
      console.error('Error approving provider:', error);
      setMessage({
        type: 'error',
        text: 'Error al aprobar proveedor',
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId: string, providerId: string) => {
    if (!rejectReason[requestId]) {
      setMessage({
        type: 'error',
        text: 'Debes incluir una razón de rechazo',
      });
      return;
    }

    if (!user) return;
    setProcessing(requestId);
    try {
      await ProviderService.rejectProvider(
        requestId,
        providerId,
        user.uid,
        rejectReason[requestId]
      );

      setMessage({
        type: 'success',
        text: 'Proveedor rechazado',
      });

      // Recargar solicitudes
      await loadRequests();
      setExpandedId(null);
      setRejectReason({});
    } catch (error) {
      console.error('Error rejecting provider:', error);
      setMessage({
        type: 'error',
        text: 'Error al rechazar proveedor',
      });
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Solicitudes de Aprobación</h1>
          <p className="text-gray-600">
            Revisa y aprueba nuevos proveedores que se unen a la plataforma
          </p>
        </div>

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
            <span className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <Loader className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando solicitudes...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sin solicitudes pendientes</h2>
            <p className="text-gray-600">Todas las solicitudes de aprobación han sido procesadas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Header */}
                <button
                  onClick={() =>
                    setExpandedId(expandedId === request.id ? null : (request.id || null))
                  }
                  className="w-full p-6 hover:bg-gray-50 transition-colors text-left flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {request.providerName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Tipo: {request.type} • Solicitud:{' '}
                      {new Date(
                        request.requestedAt instanceof Date
                          ? request.requestedAt
                          : request.requestedAt.toDate()
                      ).toLocaleDateString('es-CL')}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      request.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : request.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {request.status === 'pending'
                      ? 'Pendiente'
                      : request.status === 'approved'
                      ? 'Aprobado'
                      : 'Rechazado'}
                  </div>
                </button>

                {/* Detalles expandidos */}
                {expandedId === request.id && (
                  <div className="border-t border-gray-200 p-6 space-y-6">
                    {/* Info Personal */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Información Personal</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Nombre</p>
                          <p className="text-gray-900">
                            {request.providerSnapshot.personalInfo.displayName}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Teléfono</p>
                          <p className="text-gray-900">
                            {request.providerSnapshot.personalInfo.phone}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-500">Email</p>
                          <p className="text-gray-900">
                            {request.providerSnapshot.personalInfo.email}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-500">Bio</p>
                          <p className="text-gray-900">
                            {request.providerSnapshot.personalInfo.bio}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Info Negocio */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Información del Negocio</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Nombre</p>
                          <p className="text-gray-900">
                            {request.providerSnapshot.businessInfo.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Categoría</p>
                          <p className="text-gray-900">
                            {request.providerSnapshot.businessInfo.category}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-500">Descripción</p>
                          <p className="text-gray-900">
                            {request.providerSnapshot.businessInfo.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Servicios */}
                    {request.providerSnapshot.services.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Servicios</h4>
                        <div className="space-y-2">
                          {request.providerSnapshot.services.map((service, idx) => (
                            <div key={idx} className="text-sm bg-gray-50 p-3 rounded">
                              <p className="font-semibold text-gray-900">{service.name}</p>
                              <p className="text-gray-600">${service.price.toLocaleString('es-CL')}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notas de Revisión */}
                    {request.status !== 'pending' && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Notas de Revisión</h4>
                        <p className="text-gray-700 text-sm">{request.reviewNotes}</p>
                      </div>
                    )}

                    {/* Formulario de Aprobación/Rechazo */}
                    {request.status === 'pending' && (
                      <div className="border-t border-gray-200 pt-6 space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Notas (Opcional)
                          </label>
                          <textarea
                            value={reviewNotes[request.id!] || ''}
                            onChange={(e) =>
                              setReviewNotes({ ...reviewNotes, [request.id!]: e.target.value })
                            }
                            placeholder="Deja tus notas sobre este proveedor..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApprove(request.id!, request.providerId)}
                            disabled={processing === request.id}
                            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-5 h-5" />
                            {processing === request.id ? 'Aprobando...' : 'Aprobar'}
                          </button>
                          <button
                            onClick={() => setExpandedId(request.id ? `reject-${request.id}` : null)}
                            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-5 h-5" />
                            Rechazar
                          </button>
                        </div>

                        {/* Formulario de Rechazo */}
                        {expandedId === `reject-${request.id}` && (
                          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                              Razón del Rechazo *
                            </label>
                            <textarea
                              value={rejectReason[request.id!] || ''}
                              onChange={(e) =>
                                setRejectReason({
                                  ...rejectReason,
                                  [request.id!]: e.target.value,
                                })
                              }
                              placeholder="Explica por qué rechazas a este proveedor..."
                              rows={3}
                              className="w-full px-4 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                            <div className="flex gap-2 mt-4">
                              <button
                                onClick={() =>
                                  handleReject(request.id!, request.providerId)
                                }
                                disabled={processing === request.id}
                                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50"
                              >
                                {processing === request.id ? 'Rechazando...' : 'Confirmar Rechazo'}
                              </button>
                              <button
                                onClick={() =>
                                  setExpandedId(request.id || null)
                                }
                                className="flex-1 bg-gray-300 text-gray-900 py-2 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminApprovalsPage() {
  const { user, role } = useAuth();

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

  return <AdminApprovalsContent />;
}
