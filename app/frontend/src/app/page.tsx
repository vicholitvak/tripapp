'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ModernCard } from '../components/ui/modern-card';
import { Header } from '../components/header';
import { AuthModal } from '../components/auth-modal';
import { useAuth } from '../context/AuthContext';
import {
  Star,
  Heart,
  Award,
  Users,
  ChefHat,
  Calendar,
  Car,
  Phone
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleOperatorClick = () => {
    if (user) {
      // Usuario autenticado, ir al onboarding
      router.push('/onboarding/welcome');
    } else {
      // No autenticado, mostrar modal de login
      setIsAuthModalOpen(true);
    }
  };
  const services = [
    {
      id: 'tours',
      title: '🏜️ ¿Qué Hacer?',
      subtitle: 'Experiencias inolvidables',
      description: 'Descubre tours únicos y aventuras en el desierto de Atacama con guías expertos locales.',
      image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600&h=400&fit=crop', // Volcán Licancabur
      href: '/tours',
      color: 'from-orange-500 to-red-500',
      stats: '15+ Tours disponibles'
    },
    {
      id: 'eat',
      title: '🍽️ ¿Qué Comer?',
      subtitle: 'Gastronomía local',
      description: 'Disfruta de platos tradicionales preparados por cocineros locales con ingredientes frescos.',
      image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600&h=400&fit=crop', // Comida chilena casera
      href: '/eat',
      color: 'from-red-500 to-pink-500',
      stats: '50+ Cocineros activos'
    },
    {
      id: 'services',
      title: '🚗 Servicios',
      subtitle: 'Transporte y más',
      description: 'Taxis locales, alquiler de bicicletas, transfers y artesanías de la zona.',
      image: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=600&h=400&fit=crop', // Transfer/viaje
      href: '/services',
      color: 'from-blue-500 to-cyan-500',
      stats: '9+ Proveedores verificados'
    },
    {
      id: 'stay',
      title: '🏕️ ¿Dónde Quedarse?',
      subtitle: 'Alojamiento único',
      description: 'Descubre glampings, campings y lugares especiales para una experiencia auténtica en el desierto.',
      image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop', // Glamping/camping
      href: '/stay',
      color: 'from-teal-500 to-cyan-500',
      stats: '20+ Alojamientos disponibles'
    },
    {
      id: 'marketplace',
      title: '🏪 Tienda',
      subtitle: 'Artesanías y productos locales',
      description: 'Descubre joyería, cerámica, textiles y productos artesanales hechos por manos locales.',
      image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&h=400&fit=crop', // Joyería artesanal
      href: '/marketplace',
      color: 'from-purple-500 to-pink-500',
      stats: '100+ Productos disponibles'
    }
  ];

  const stats = [
    { icon: Users, label: 'Viajeros Atendidos', value: '5000+', color: 'text-blue-600' },
    { icon: Star, label: 'Calificación Promedio', value: '4.9', color: 'text-yellow-600' },
    { icon: Award, label: 'Proveedores Verificados', value: '80+', color: 'text-green-600' },
    { icon: Phone, label: 'Reservas Diarias', value: '200+', color: 'text-orange-600' }
  ];

  const features = [
    {
      icon: Users,
      title: 'Todo en un Lugar',
      description: 'Encuentra tours, comida local y transporte todo en una sola app para tu viaje perfecto.'
    },
    {
      icon: Phone,
      title: 'Reservas Instantáneas',
      description: 'Reserva tours, servicios de transporte y experiencias culinarias con solo unos clics.'
    },
    {
      icon: Award,
      title: 'Proveedores Verificados',
      description: 'Todos nuestros proveedores pasan rigurosos controles de calidad y seguridad.'
    },
    {
      icon: Heart,
      title: 'Apoyo a la Comunidad Local',
      description: 'Conectamos viajeros con emprendedores locales, generando desarrollo sostenible.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
      {/* Header */}
      <Header />

      <main>
        {/* Hero Section */}
        <motion.section
          className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50/30 overflow-hidden pt-16"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          initial="hidden"
          animate="visible"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23F97316' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                🏜️ Bienvenido a San Pedro de Atacama
              </h1>
              <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
                Tu compañero esencial para vivir la magia del desierto. Tours, gastronomía local, alojamiento único y más. Todo lo que necesitas en un solo lugar.
              </p>
              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <button
                  onClick={() => document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-block px-8 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700"
                >
                  🚀 Explorar Servicios
                </button>
                <Link
                  href="/tours"
                  className="inline-block px-8 py-4 text-lg font-semibold rounded-full border-2 border-orange-600 text-orange-600 hover:bg-orange-50 transition-all duration-300"
                >
                  🏜️ Ver Tours Disponibles
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Services Overview Section */}
        <motion.section
          id="services-section"
          className="py-20 bg-white"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="container mx-auto px-4">
            <motion.h2
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"
            >
              🎯 Todo lo que Necesitas en San Pedro
            </motion.h2>
            <motion.p
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto"
            >
              Una app completa para tu viaje al desierto. Tours, gastronomía, alojamiento, servicios y artesanías locales, todo en un solo lugar.
            </motion.p>

            <motion.div
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8"
            >
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group"
                >
                  <Link href={service.href} className="block">
                    <ModernCard variant="elevated" className="overflow-hidden hover-lift h-full">
                      {/* Service Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {/* Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-t ${service.color} opacity-20 group-hover:opacity-30 transition-opacity duration-300`} />
                        {/* Stats Badge */}
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                          <span className="text-xs font-medium text-gray-700">{service.stats}</span>
                        </div>
                      </div>

                      {/* Service Content */}
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                          {service.title}
                        </h3>
                        <p className="text-orange-600 font-medium text-sm mb-3">{service.subtitle}</p>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                          {service.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Ver más →</span>
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${service.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                            <span className="text-white text-sm">→</span>
                          </div>
                        </div>
                      </div>
                    </ModernCard>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section
          className="py-16 bg-white/50 backdrop-blur-sm -mt-16 relative z-20"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center group"
                >
                  <ModernCard variant="glass" className="p-6">
                    <div className="flex flex-col items-center space-y-3">
                      <div className={`p-3 rounded-full bg-gradient-to-br from-white to-gray-50 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                        <stat.icon className={`w-8 h-8 ${stat.color}`} />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
                      </div>
                    </div>
                  </ModernCard>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          className="py-20 bg-gradient-to-r from-orange-50/50 to-red-50/30"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="container mx-auto px-4">
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                ¿Por Qué Elegir Santurist?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Descubre las ventajas que hacen de tu viaje algo inolvidable
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <ModernCard variant="elevated" className="p-6 h-full text-center group">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="p-4 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg group-hover:shadow-xl transition-all duration-300">
                        <feature.icon className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>
                  </ModernCard>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Call to Action */}
        <motion.section
          className="py-20 bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 relative overflow-hidden"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
                ¿Listo para tu Aventura?
              </h2>
              <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
                Únete a miles de viajeros que han descubierto la magia de San Pedro de Atacama
              </p>
              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link
                  href="/tours"
                  className="bg-white text-orange-600 font-bold px-8 py-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
                >
                  Explorar Tours
                </Link>
                <button
                  onClick={handleOperatorClick}
                  className="border-2 border-white text-white font-bold px-8 py-4 rounded-full hover:bg-white/10 transition-all duration-300"
                >
                  Soy Operador
                </button>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Santurist
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Tu compañero perfecto para explorar San Pedro de Atacama con experiencias inolvidables.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Explora</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/tours" className="hover:text-orange-400 transition-colors">Tours Guiados</Link></li>
                <li><Link href="/eat" className="hover:text-orange-400 transition-colors">¿Qué Comer?</Link></li>
                <li><Link href="/stay" className="hover:text-orange-400 transition-colors">¿Dónde Quedarse?</Link></li>
                <li><Link href="/marketplace" className="hover:text-orange-400 transition-colors">Tienda</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Servicios</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#taxi" className="hover:text-orange-400 transition-colors">Taxis Locales</a></li>
                <li><a href="#bike" className="hover:text-orange-400 transition-colors">Alquiler Bicicletas</a></li>
                <li><a href="#transfer" className="hover:text-orange-400 transition-colors">Transfers Aeropuerto</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Contacto</h4>
              <div className="space-y-2 text-gray-300">
                <p className="flex items-center">
                  <span className="w-4 h-4 mr-2">📍</span>
                  San Pedro de Atacama, Chile
                </p>
                <p>📧 info@santurist.cl</p>
                <p>📞 +56 9 1234 5678</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-300">
            <p>&copy; 2025 Santurist. Todos los derechos reservados. Hecho con ❤️ en el desierto.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          router.push('/onboarding/welcome');
        }}
      />
    </div>
  );
}
