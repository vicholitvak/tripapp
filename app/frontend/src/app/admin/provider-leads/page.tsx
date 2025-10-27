'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProviderLeadService } from '@/lib/services/providerLeadService';
import { ProviderLead, LeadStatus, ProviderType, LeadSource } from '@/types/provider';
import AdminNav from '@/components/admin/AdminNav';
import NotificationBell from '@/components/notifications/NotificationBell';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Phone,
  Mail,
  MessageCircle,
  Edit,
  Trash2,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Plus,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProviderLeadsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [leads, setLeads] = useState<ProviderLead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<ProviderLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ProviderType | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    invited: 0,
    claimed: 0,
    needsFollowUp: 0,
  });

  // Form state
  const [formData, setFormData] = useState<Omit<ProviderLead, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>>({
    contactInfo: {
      name: '',
      businessName: '',
      email: '',
      phone: '',
      whatsapp: '',
      address: '',
    },
    type: 'cook',
    category: '',
    servicesOffered: [],
    status: 'new',
    priority: 'medium',
    source: 'direct_contact',
    notes: '',
    isActive: true,
  });

  const [serviceInput, setServiceInput] = useState('');

  useEffect(() => {
    if (user) {
      loadLeads();
      loadStats();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, typeFilter, leads]);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const allLeads = await ProviderLeadService.getAll();
      setLeads(allLeads);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await ProviderLeadService.getStats();
      setStats({
        total: statsData.total,
        active: statsData.active,
        invited: statsData.byStatus.invited,
        claimed: statsData.byStatus.claimed,
        needsFollowUp: statsData.needsFollowUp,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...leads];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(lead =>
        lead.contactInfo.name.toLowerCase().includes(term) ||
        lead.contactInfo.businessName.toLowerCase().includes(term) ||
        lead.contactInfo.email.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(lead => lead.type === typeFilter);
    }

    setFilteredLeads(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await ProviderLeadService.create(formData, user.uid);
      setShowAddForm(false);
      resetForm();
      loadLeads();
      loadStats();
    } catch (error) {
      console.error('Error creating lead:', error);
      alert('Error al crear el lead');
    }
  };

  const resetForm = () => {
    setFormData({
      contactInfo: {
        name: '',
        businessName: '',
        email: '',
        phone: '',
        whatsapp: '',
        address: '',
      },
      type: 'cook',
      category: '',
      servicesOffered: [],
      status: 'new',
      priority: 'medium',
      source: 'direct_contact',
      notes: '',
      isActive: true,
    });
    setServiceInput('');
  };

  const handleAddService = () => {
    if (serviceInput.trim()) {
      setFormData(prev => ({
        ...prev,
        servicesOffered: [...prev.servicesOffered, serviceInput.trim()],
      }));
      setServiceInput('');
    }
  };

  const handleRemoveService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      servicesOffered: prev.servicesOffered.filter((_, i) => i !== index),
    }));
  };

  const getStatusColor = (status: LeadStatus): string => {
    const colors: Record<LeadStatus, string> = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-purple-100 text-purple-800',
      interested: 'bg-green-100 text-green-800',
      invited: 'bg-yellow-100 text-yellow-800',
      claimed: 'bg-teal-100 text-teal-800',
      rejected: 'bg-red-100 text-red-800',
      inactive: 'bg-gray-100 text-gray-800',
    };
    return colors[status];
  };

  const getStatusLabel = (status: LeadStatus): string => {
    const labels: Record<LeadStatus, string> = {
      new: 'Nuevo',
      contacted: 'Contactado',
      interested: 'Interesado',
      invited: 'Invitado',
      claimed: 'Reclamado',
      rejected: 'Rechazado',
      inactive: 'Inactivo',
    };
    return labels[status];
  };

  const getTypeLabel = (type: ProviderType): string => {
    const labels: Record<ProviderType, string> = {
      cook: 'Cocinero',
      driver: 'Chofer',
      tour_guide: 'Guía Turístico',
      artisan: 'Artesano',
      transport: 'Transporte',
      lodging: 'Alojamiento',
      service: 'Servicio',
      other: 'Otro',
    };
    return labels[type];
  };

  const getPriorityColor = (priority: string): string => {
    const colors: Record<string, string> = {
      low: 'text-gray-600',
      medium: 'text-blue-600',
      high: 'text-orange-600',
      urgent: 'text-red-600',
    };
    return colors[priority] || 'text-gray-600';
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Debes iniciar sesión como administrador</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Base de Datos de Proveedores
              </h1>
              <p className="text-gray-600">
                Gestiona tus contactos y leads de proveedores potenciales
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="w-5 h-5" />
                Agregar Lead
              </button>
              <NotificationBell />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">Total Leads</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">Activos</p>
              <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <Send className="w-8 h-8 text-yellow-600" />
              </div>
              <p className="text-sm text-gray-600">Invitados</p>
              <p className="text-3xl font-bold text-gray-900">{stats.invited}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-teal-600" />
              </div>
              <p className="text-sm text-gray-600">Reclamados</p>
              <p className="text-3xl font-bold text-gray-900">{stats.claimed}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              <p className="text-sm text-gray-600">Pendiente</p>
              <p className="text-3xl font-bold text-gray-900">{stats.needsFollowUp}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, negocio o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as LeadStatus | 'all')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="all">Todos los estados</option>
                  <option value="new">Nuevo</option>
                  <option value="contacted">Contactado</option>
                  <option value="interested">Interesado</option>
                  <option value="invited">Invitado</option>
                  <option value="claimed">Reclamado</option>
                  <option value="rejected">Rechazado</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as ProviderType | 'all')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="cook">Cocinero</option>
                  <option value="driver">Chofer</option>
                  <option value="tour_guide">Guía Turístico</option>
                  <option value="artisan">Artesano</option>
                  <option value="transport">Transporte</option>
                  <option value="service">Servicio</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            </div>
          </div>

          {/* Leads Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Cargando leads...</p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'No se encontraron leads con los filtros aplicados'
                    : 'Aún no hay leads registrados'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contacto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Servicios
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prioridad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {lead.contactInfo.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {lead.contactInfo.businessName}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              {lead.contactInfo.email && (
                                <a
                                  href={`mailto:${lead.contactInfo.email}`}
                                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                  title={lead.contactInfo.email}
                                >
                                  <Mail className="w-3 h-3" />
                                </a>
                              )}
                              {lead.contactInfo.phone && (
                                <a
                                  href={`tel:${lead.contactInfo.phone}`}
                                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                  title={lead.contactInfo.phone}
                                >
                                  <Phone className="w-3 h-3" />
                                </a>
                              )}
                              {lead.contactInfo.whatsapp && (
                                <a
                                  href={`https://wa.me/${lead.contactInfo.whatsapp.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                                  title={lead.contactInfo.whatsapp}
                                >
                                  <MessageCircle className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">
                            {getTypeLabel(lead.type)}
                          </span>
                          {lead.category && (
                            <p className="text-xs text-gray-600">{lead.category}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {lead.servicesOffered.slice(0, 2).map((service, idx) => (
                              <span
                                key={idx}
                                className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                              >
                                {service}
                              </span>
                            ))}
                            {lead.servicesOffered.length > 2 && (
                              <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                +{lead.servicesOffered.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              lead.status
                            )}`}
                          >
                            {getStatusLabel(lead.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-sm font-medium ${getPriorityColor(
                              lead.priority
                            )}`}
                          >
                            {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {lead.status === 'new' || lead.status === 'contacted' || lead.status === 'interested' ? (
                              <button
                                onClick={() => router.push(`/admin/invitations?leadId=${lead.id}`)}
                                className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                title="Crear invitación"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            ) : null}
                            <button
                              className="text-gray-600 hover:text-gray-700"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {lead.status === 'inactive' && (
                              <button
                                onClick={async () => {
                                  if (confirm('¿Eliminar este lead?')) {
                                    await ProviderLeadService.delete(lead.id!);
                                    loadLeads();
                                    loadStats();
                                  }
                                }}
                                className="text-red-600 hover:text-red-700"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Lead Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Agregar Nuevo Lead</h2>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Contacto *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.contactInfo.name}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, name: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Negocio *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.contactInfo.businessName}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, businessName: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.contactInfo.email}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, email: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={formData.contactInfo.phone}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, phone: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={formData.contactInfo.whatsapp}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, whatsapp: e.target.value }
                        }))}
                        placeholder="+56912345678"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dirección
                      </label>
                      <input
                        type="text"
                        value={formData.contactInfo.address}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, address: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Provider Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Proveedor</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Proveedor *
                      </label>
                      <select
                        required
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          type: e.target.value as ProviderType
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="cook">Cocinero</option>
                        <option value="driver">Chofer</option>
                        <option value="tour_guide">Guía Turístico</option>
                        <option value="artisan">Artesano</option>
                        <option value="transport">Transporte</option>
                        <option value="service">Servicio</option>
                        <option value="other">Otro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Categoría
                      </label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          category: e.target.value
                        }))}
                        placeholder="ej: Cocina tradicional, Tours astronómicos"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Servicios que Ofrece
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={serviceInput}
                      onChange={(e) => setServiceInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddService();
                        }
                      }}
                      placeholder="Tour Valle de la Luna, etc."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleAddService}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.servicesOffered.map((service, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {service}
                        <button
                          type="button"
                          onClick={() => handleRemoveService(index)}
                          className="hover:text-blue-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Meta Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Adicional</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prioridad
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent'
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="low">Baja</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta</option>
                        <option value="urgent">Urgente</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fuente
                      </label>
                      <select
                        value={formData.source}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          source: e.target.value as LeadSource
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="referral">Referido</option>
                        <option value="direct_contact">Contacto Directo</option>
                        <option value="social_media">Redes Sociales</option>
                        <option value="marketplace">Marketplace</option>
                        <option value="event">Evento/Feria</option>
                        <option value="other">Otro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado Inicial
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          status: e.target.value as LeadStatus
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="new">Nuevo</option>
                        <option value="contacted">Contactado</option>
                        <option value="interested">Interesado</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      notes: e.target.value
                    }))}
                    rows={3}
                    placeholder="Notas adicionales sobre el contacto..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Crear Lead
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
