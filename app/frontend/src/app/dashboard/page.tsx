'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/header';
import { ModernCard } from '../../components/ui/modern-card';
import { Calendar, Users, CreditCard, ChevronRight, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Booking {
  id: string;
  tourId: string;
  tourTitle: string;
  tourImage: string;
  description: string;
  date: string;
  numberOfPeople: number;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  bookedAt: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    // Simulate loading bookings from localStorage
    setTimeout(() => {
      const savedBookings = localStorage.getItem(`${user.uid}-bookings`);
      const bookingsData = savedBookings ? JSON.parse(savedBookings) : [];
      setBookings(bookingsData);
      setLoading(false);
    }, 500);
  }, [user, router]);

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
      <Header />

      <main className="pt-20">
        {/* Dashboard Header */}
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
            >
              <h1 className="text-4xl font-bold text-white mb-2">Mi Dashboard</h1>
              <p className="text-white/80">Gestiona tus reservas y bookings</p>
            </motion.div>
          </div>
        </motion.section>

        {/* Dashboard Content */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.6 }}
              className="grid md:grid-cols-4 gap-6 mb-12"
            >
              {/* Statistics Cards */}
              <ModernCard variant="elevated" className="p-6">
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-1">Total Reservas</p>
                  <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
                </div>
              </ModernCard>

              <ModernCard variant="elevated" className="p-6">
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-1">Confirmadas</p>
                  <p className="text-3xl font-bold text-green-600">
                    {bookings.filter(b => b.status === 'confirmed').length}
                  </p>
                </div>
              </ModernCard>

              <ModernCard variant="elevated" className="p-6">
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-1">Pendientes</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {bookings.filter(b => b.status === 'pending').length}
                  </p>
                </div>
              </ModernCard>

              <ModernCard variant="elevated" className="p-6">
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-1">Gasto Total</p>
                  <p className="text-xl font-bold text-orange-600">
                    ${(bookings.reduce((acc, b) => acc + b.totalPrice, 0) / 1000).toFixed(0)}K
                  </p>
                </div>
              </ModernCard>
            </motion.div>

            {/* Filter Tabs */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8 flex flex-wrap gap-3"
            >
              {['all', 'confirmed', 'pending', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status as 'all' | 'confirmed' | 'pending' | 'cancelled')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === status
                      ? 'bg-orange-600 text-white'
                      : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-orange-600'
                  }`}
                >
                  {status === 'all' ? 'Todas' : status === 'confirmed' ? 'Confirmadas' : status === 'pending' ? 'Pendientes' : 'Canceladas'}
                </button>
              ))}
            </motion.div>

            {/* Bookings List */}
            <motion.div
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <ModernCard key={i} className="animate-pulse">
                      <div className="h-40 bg-gray-200 rounded-lg"></div>
                    </ModernCard>
                  ))}
                </div>
              ) : filteredBookings.length > 0 ? (
                <div className="space-y-4">
                  {filteredBookings.map((booking, index) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ModernCard variant="elevated" className="overflow-hidden hover-lift">
                        <div className="flex flex-col md:flex-row">
                          {/* Tour Image */}
                          <div className="md:w-40 h-40 relative flex-shrink-0 bg-gray-200">
                            <Image
                              src={booking.tourImage}
                              alt={booking.tourTitle}
                              fill
                              className="object-cover"
                            />
                          </div>

                          {/* Booking Info */}
                          <div className="flex-1 p-6 flex flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                                    {booking.tourTitle}
                                  </h3>
                                  <p className="text-sm text-gray-600">{booking.description}</p>
                                </div>
                                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                                  {getStatusIcon(booking.status)}
                                  <span>{getStatusLabel(booking.status)}</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                                <div className="flex items-center space-x-2 text-gray-600">
                                  <Calendar className="w-4 h-4" />
                                  <span>{formatDate(booking.date)}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-gray-600">
                                  <Users className="w-4 h-4" />
                                  <span>{booking.numberOfPeople} persona{booking.numberOfPeople > 1 ? 's' : ''}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-gray-600">
                                  <CreditCard className="w-4 h-4" />
                                  <span>{formatPrice(booking.totalPrice)}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-gray-600">
                                  <Clock className="w-4 h-4" />
                                  <span>{new Date(booking.bookedAt).toLocaleDateString('es-ES')}</span>
                                </div>
                              </div>
                            </div>

                            {/* Action Button */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                              <Link
                                href="/tours"
                                className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
                              >
                                <span>Ver tour similar</span>
                                <ChevronRight className="w-4 h-4" />
                              </Link>
                              {booking.status === 'pending' && (
                                <button className="px-4 py-2 bg-orange-100 text-orange-600 hover:bg-orange-200 rounded-lg font-medium transition-colors">
                                  Completar pago
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </ModernCard>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-2xl font-bold text-gray-700 mb-4">No hay reservas</p>
                  <p className="text-gray-600 mb-8">
                    {filter === 'all'
                      ? 'Aún no tienes ninguna reserva. ¡Comienza tu aventura!'
                      : `No tienes reservas ${getStatusLabel(filter).toLowerCase()}.`}
                  </p>
                  <Link
                    href="/tours"
                    className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  >
                    Explorar Tours
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
