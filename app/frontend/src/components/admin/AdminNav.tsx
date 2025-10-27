'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Mail,
  Activity,
  ShoppingBag,
  CheckCircle,
  Home
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

export default function AdminNav() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      href: '/admin/provider-leads',
      label: 'Leads',
      icon: <Users className="w-5 h-5" />,
      description: 'Base de datos de proveedores potenciales',
    },
    {
      href: '/admin/mock-providers',
      label: 'Mock Providers',
      icon: <Users className="w-5 h-5" />,
      description: 'Gestionar proveedores mock',
    },
    {
      href: '/admin/invitations',
      label: 'Invitaciones',
      icon: <Mail className="w-5 h-5" />,
      description: 'Crear y gestionar invitaciones',
    },
    {
      href: '/admin/conversions',
      label: 'Conversiones',
      icon: <Activity className="w-5 h-5" />,
      description: 'Dashboard de conversiones',
    },
    {
      href: '/admin/approvals',
      label: 'Aprobaciones',
      icon: <CheckCircle className="w-5 h-5" />,
      description: 'Aprobar proveedores',
    },
    {
      href: '/admin/seed-marketplace',
      label: 'Marketplace',
      icon: <ShoppingBag className="w-5 h-5" />,
      description: 'Seed data del marketplace',
    },
    {
      href: '/admin/seed-casa-voyage',
      label: 'Casa Voyage',
      icon: <Home className="w-5 h-5" />,
      description: 'Onboarding Casa Voyage Hostel',
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 overflow-x-auto py-4" aria-label="Admin Navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
              title={item.description}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
