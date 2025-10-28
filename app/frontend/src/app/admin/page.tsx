'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Users,
  Mail,
  CheckCircle,
  Store,
  PackagePlus,
  Home,
  TrendingUp,
  List,
  Gem,
  Database,
  Check,
  AlertCircle,
} from 'lucide-react';
import { SeedStatusService } from '@/lib/services/seedStatusService';

interface AdminCard {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  seeded?: boolean;
  seedKey?: keyof SeedStatus;
}

interface SeedStatus {
  casaVoyage: boolean;
  tierraGres: boolean;
  joyasRelmu: boolean;
  marketplace: boolean;
}

export default function AdminDashboard() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [seedStatus, setSeedStatus] = useState<SeedStatus | null>(null);
  const [loadingSeeds, setLoadingSeeds] = useState(true);

  useEffect(() => {
    if (!loading && (!user || role !== 'Admin')) {
      router.push('/');
    }
  }, [user, role, loading, router]);

  // Load seed status
  useEffect(() => {
    const loadSeedStatus = async () => {
      if (user && role === 'Admin') {
        try {
          const status = await SeedStatusService.getAllSeedStatus();
          setSeedStatus(status);
        } catch (error) {
          console.error('Error loading seed status:', error);
        } finally {
          setLoadingSeeds(false);
        }
      }
    };

    loadSeedStatus();
  }, [user, role]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || role !== 'Admin') {
    return null;
  }

  // Management section
  const managementCards: AdminCard[] = [
    {
      title: 'Proveedores Mock',
      description: 'Gestionar proveedores de demostración y asignar invitaciones',
      href: '/admin/mock-providers',
      icon: <Users className="w-8 h-8" />,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Invitaciones',
      description: 'Crear y gestionar códigos de invitación para proveedores',
      href: '/admin/invitations',
      icon: <Mail className="w-8 h-8" />,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Aprobaciones',
      description: 'Revisar y aprobar solicitudes de proveedores pendientes',
      href: '/admin/approvals',
      icon: <CheckCircle className="w-8 h-8" />,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Provider Leads',
      description: 'Gestionar leads y solicitudes de proveedores',
      href: '/admin/provider-leads',
      icon: <List className="w-8 h-8" />,
      color: 'from-cyan-500 to-cyan-600',
    },
  ];

  // Seeds section - Unified seeds management
  const seedCards: AdminCard[] = [
    {
      title: '🌱 Gestión de Seeds',
      description: 'Ejecutar seeds existentes (Casa Voyage, Tierra Gres, Joyas Relmu, Atacama Dark Sky) o generar nuevos desde URLs',
      href: '/admin/seeds',
      icon: <Database className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-600',
    },
  ];

  // Statistics section
  const statsCards: AdminCard[] = [
    {
      title: 'Conversiones',
      description: 'Ver estadísticas de conversión de proveedores mock a reales',
      href: '/admin/conversions',
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'from-indigo-500 to-indigo-600',
    },
  ];

  const renderCard = (card: AdminCard) => {
    const isSeeded = card.seeded === true;
    const isLoading = loadingSeeds && card.seedKey;

    return (
      <button
        key={card.href}
        onClick={() => router.push(card.href)}
        className={`group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${
          isSeeded ? 'opacity-75' : ''
        }`}
      >
        {/* Seeded Badge */}
        {isSeeded && (
          <div className="absolute top-3 right-3 z-10">
            <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
              <Check className="w-3 h-3" />
              Seedeado
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute top-3 right-3 z-10">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
          </div>
        )}

        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

        {/* Content */}
        <div className="relative p-6">
          {/* Icon */}
          <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${card.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
            {card.icon}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-300">
            {card.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed">
            {card.description}
          </p>

          {/* Hover Arrow */}
          <div className="mt-4 flex items-center text-orange-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {isSeeded ? 'Ver detalles' : 'Abrir'}
            <svg
              className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Panel de Administración
          </h1>
          <p className="text-lg text-gray-600">
            Bienvenido, <span className="font-semibold text-orange-600">{user.email}</span>
          </p>
        </div>

        {/* Management Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-gray-700" />
            <h2 className="text-2xl font-bold text-gray-900">Gestión</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {managementCards.map(renderCard)}
          </div>
        </div>

        {/* Seeds Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-6 h-6 text-gray-700" />
            <h2 className="text-2xl font-bold text-gray-900">Seeds de Datos</h2>
            {loadingSeeds && (
              <span className="text-sm text-gray-500">Verificando estado...</span>
            )}
          </div>

          {!loadingSeeds && seedStatus && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Estado:</strong>{' '}
                {Object.values(seedStatus).filter(Boolean).length} de {Object.keys(seedStatus).length} seeds completados
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {seedCards.map(renderCard)}
          </div>
        </div>

        {/* Statistics Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-gray-700" />
            <h2 className="text-2xl font-bold text-gray-900">Estadísticas</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statsCards.map(renderCard)}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 p-6 bg-white rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Información del Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Usuario:</span> {user.email}
            </div>
            <div>
              <span className="font-medium">Rol:</span> {role}
            </div>
            <div>
              <span className="font-medium">UID:</span> {user.uid.substring(0, 12)}...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
