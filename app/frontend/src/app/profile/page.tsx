'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/header';
import { ModernCard } from '../../components/ui/modern-card';
import { User, Mail, Phone, MapPin, Calendar, LogOut, Edit2, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { updateProfile } from 'firebase/auth';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    // Load user data from localStorage or initialize empty
    setDisplayName(user.displayName || '');
    setPhone(localStorage.getItem(`${user.uid}-phone`) || '');
    setAddress(localStorage.getItem(`${user.uid}-address`) || '');
  }, [user, router]);

  const handleSaveProfile = async () => {
    if (!user || !displayName.trim()) {
      setError('Por favor ingresa un nombre');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Update Firebase profile
      await updateProfile(user, {
        displayName: displayName.trim(),
      });

      // Save additional info to localStorage (in a real app, use a database)
      localStorage.setItem(`${user.uid}-phone`, phone);
      localStorage.setItem(`${user.uid}-address`, address);

      setSuccess('Perfil actualizado correctamente');
      setIsEditing(false);

      // Reload user context
      await user.reload();
    } catch (err) {
      setError('Error al actualizar el perfil');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
      <Header />

      <main className="pt-20">
        {/* Profile Header */}
        <motion.section
          className="bg-gradient-to-r from-orange-600 to-red-600 py-12"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          initial="hidden"
          animate="visible"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.6 }}
              className="flex items-center space-x-4"
            >
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  width={100}
                  height={100}
                  className="rounded-full border-4 border-white"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-white">
                  <User className="w-12 h-12 text-white" />
                </div>
              )}
              <div className="text-white">
                <h1 className="text-4xl font-bold">{displayName || 'Mi Perfil'}</h1>
                <p className="text-white/80 text-lg">{user.email}</p>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Profile Content */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600"
              >
                {success}
              </motion.div>
            )}

            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.6 }}
              className="grid md:grid-cols-3 gap-8"
            >
              {/* Profile Info Card */}
              <div className="md:col-span-2">
                <ModernCard variant="elevated" className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Información Personal</h2>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-orange-100 hover:bg-orange-200 rounded-lg text-orange-600 font-medium transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Editar</span>
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-6">
                      {/* Name Field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre Completo
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Tu nombre completo"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Phone Field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Teléfono
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+56 9 1234 5678"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Address Field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Dirección
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <textarea
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Tu dirección"
                            rows={3}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-4 pt-4">
                        <button
                          onClick={handleSaveProfile}
                          disabled={saving}
                          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 disabled:opacity-50 font-medium"
                        >
                          <Save className="w-4 h-4" />
                          <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setDisplayName(user.displayName || '');
                            setPhone(localStorage.getItem(`${user.uid}-phone`) || '');
                            setAddress(localStorage.getItem(`${user.uid}-address`) || '');
                          }}
                          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors font-medium"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancelar</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Readable Display */}
                      <div className="flex items-start space-x-4">
                        <User className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">Nombre</p>
                          <p className="text-lg font-medium text-gray-900">{displayName || 'No especificado'}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <Mail className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="text-lg font-medium text-gray-900">{user.email}</p>
                        </div>
                      </div>

                      {phone && (
                        <div className="flex items-start space-x-4">
                          <Phone className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-600">Teléfono</p>
                            <p className="text-lg font-medium text-gray-900">{phone}</p>
                          </div>
                        </div>
                      )}

                      {address && (
                        <div className="flex items-start space-x-4">
                          <MapPin className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-600">Dirección</p>
                            <p className="text-lg font-medium text-gray-900">{address}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start space-x-4">
                        <Calendar className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">Miembro desde</p>
                          <p className="text-lg font-medium text-gray-900">
                            {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('es-ES') : 'No disponible'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </ModernCard>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <ModernCard variant="elevated" className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Acciones</h3>
                  <div className="space-y-3">
                    <Link
                      href="/tours"
                      className="block w-full text-center px-4 py-2.5 bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-lg font-medium transition-colors"
                    >
                      Ver mis Tours
                    </Link>
                    <Link
                      href="/services"
                      className="block w-full text-center px-4 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg font-medium transition-colors"
                    >
                      Ver Servicios
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg font-medium transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </ModernCard>

                {/* Account Info */}
                <ModernCard variant="glass" className="p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Información de Cuenta</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Autenticación:</span> {user.providerData?.[0]?.providerId === 'google.com' ? 'Google' : 'Email'}
                    </p>
                    <p>
                      <span className="font-medium">Email verificado:</span> {user.emailVerified ? 'Sí' : 'No'}
                    </p>
                  </div>
                </ModernCard>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
