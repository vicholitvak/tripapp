'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './auth-modal';
import { User, LogOut, Menu, X } from 'lucide-react';

export function Header() {
  const { user, logout, loading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-orange-600 hover:text-orange-700 transition-colors">
              Santurist
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-orange-600 font-bold transition-colors">Inicio</Link>
              <Link href="/tours" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">¿Qué Hacer?</Link>
              <Link href="/eat" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">¿Qué Comer?</Link>
              <Link href="/services" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">Servicios</Link>
            </nav>

            {/* Auth Section */}
            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
              ) : user ? (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 px-4 py-2 rounded-full bg-orange-100 hover:bg-orange-200 transition-colors"
                  >
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    ) : (
                      <User className="w-5 h-5 text-orange-600" />
                    )}
                    <span className="text-orange-600 font-medium hidden sm:inline">
                      {user.displayName || 'Mi Perfil'}
                    </span>
                  </Link>
                  <button
                    onClick={logout}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="hidden sm:block bg-orange-600 text-white px-6 py-2 rounded-full hover:bg-orange-700 transition-colors font-medium"
                >
                  Iniciar Sesión
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-600" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <Link href="/" className="block px-4 py-2 text-orange-600 font-bold">
                Inicio
              </Link>
              <Link href="/tours" className="block px-4 py-2 text-gray-700 hover:text-orange-600">
                ¿Qué Hacer?
              </Link>
              <Link href="/eat" className="block px-4 py-2 text-gray-700 hover:text-orange-600">
                ¿Qué Comer?
              </Link>
              <Link href="/services" className="block px-4 py-2 text-gray-700 hover:text-orange-600">
                Servicios
              </Link>
              {!user && (
                <button
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full mx-4 bg-orange-600 text-white px-4 py-2 rounded-full hover:bg-orange-700 transition-colors font-medium"
                >
                  Iniciar Sesión
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
