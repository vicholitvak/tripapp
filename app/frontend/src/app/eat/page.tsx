'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { ModernCard } from '../../components/ui/modern-card';
import { ChefHat, Clock, MapPin, Star, Award, Heart, TrendingUp, Utensils } from 'lucide-react';

// Componentes de Moai integrados
import FeaturedCarousel from './components/FeaturedCarousel';
import HowItWorks from './components/HowItWorks';
import RecommendationDashboard from './components/RecommendationDashboard';
import LocationBasedDishes from './components/LocationBasedDishes';
import Testimonials from './components/Testimonials';

export default function Eat() {
  const [showRecommendations, setShowRecommendations] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Show recommendations if user is logged in
    if (user) {
      setShowRecommendations(true);
    }
  }, [user]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  const stats = [
    { icon: ChefHat, label: 'Cocineros Locales', value: '50+', color: 'text-orange-600' },
    { icon: Utensils, label: 'Platos Disponibles', value: '200+', color: 'text-red-600' },
    { icon: Star, label: 'Calificación Promedio', value: '4.8', color: 'text-yellow-600' },
    { icon: MapPin, label: 'Ubicación', value: 'San Pedro', color: 'text-green-600' }
  ];

  const features = [
    {
      icon: Clock,
      title: 'Entrega Rápida',
      description: 'Recibe tu comida en menos de 45 minutos con nuestro sistema de delivery optimizado.'
    },
    {
      icon: Heart,
      title: 'Comida Casera',
      description: 'Disfruta de platos preparados con amor por cocineros locales expertos.'
    },
    {
      icon: Award,
      title: 'Calidad Garantizada',
      description: 'Todos nuestros cocineros pasan por un riguroso proceso de selección.'
    },
    {
      icon: TrendingUp,
      title: 'Sabores Únicos',
      description: 'Descubre la gastronomía tradicional de San Pedro de Atacama.'
    }
  ];

  const traditionalPlaces = [
    { id: 1, name: 'Restaurante El Ayllu', cuisine: 'Gastronomía Local', description: 'Auténticos sabores de Atacama preparados con ingredientes frescos.', rating: 4.7, price: '$$$' },
    { id: 2, name: 'Café Honradez', cuisine: 'Café y Pasteles', description: 'Café orgánico con vista al pueblo y pasteles caseros.', rating: 4.5, price: '$$' },
    { id: 3, name: 'Quincho de Doña Ana', cuisine: 'Comida Chilena', description: 'Tradicional comida casera con toques modernos.', rating: 4.9, price: '$$' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
      <Head>
        <title>¿Qué Comer? - Santurist - San Pedro de Atacama</title>
        <meta name="description" content="Descubre la gastronomía local de San Pedro de Atacama. Delivery de comida casera con Moai." />
      </Head>

      {/* Modern Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-2xl font-bold text-atacama-orange cursor-pointer">
              Santurist
            </Link>

            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-atacama-orange font-medium transition-colors">Inicio</Link>
              <Link href="/tours" className="text-gray-700 hover:text-atacama-orange font-medium transition-colors">Tours</Link>
              <Link href="/eat" className="text-atacama-orange font-bold transition-colors">¿Qué Comer?</Link>
              <Link href="/services" className="text-gray-700 hover:text-atacama-orange font-medium transition-colors">Servicios</Link>
              <Link href="/marketplace" className="text-gray-700 hover:text-atacama-orange font-medium transition-colors">Tienda</Link>
            </nav>

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700 hidden md:block">Hola, {user.displayName}</span>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors font-medium">
                    Salir
                  </button>
                </div>
              ) : (
                <button className="bg-atacama-orange text-white px-6 py-2 rounded-full hover:bg-atacama-orange/90 transition-colors font-medium">
                  Iniciar Sesión
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="pt-20">
        {/* Hero Section - Integración Moai */}
        <motion.section
          className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-white to-red-50 overflow-hidden"
          variants={containerVariants}
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
            <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                🍽️ ¿Qué Comer en San Pedro?
              </h1>
              <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
                Descubre la gastronomía única del desierto de Atacama. Platos tradicionales preparados por cocineros locales con ingredientes frescos y auténticos.
              </p>
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/eat/delivery" className="inline-block px-8 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700">
                  🍽️ Explorar Platos
                </Link>
                <Link href="/eat/delivery" className="inline-block px-8 py-4 text-lg font-semibold rounded-full border-2 border-orange-600 text-orange-600 hover:bg-orange-50 transition-all duration-300 ml-4">
                  👨‍🍳 Ver Cocineros
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section
          className="py-16 bg-white/50 backdrop-blur-sm -mt-16 relative z-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
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

        {/* How It Works Section - Moai Integration */}
        <motion.section
          className="py-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="container mx-auto px-4">
            <motion.div variants={itemVariants} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                ¿Cómo Funciona el Delivery?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Tres simples pasos para disfrutar de la mejor comida local de San Pedro de Atacama
              </p>
            </motion.div>
            <HowItWorks />
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          className="py-20 bg-gradient-to-r from-orange-50/50 to-red-50/30"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="container mx-auto px-4">
            <motion.div variants={itemVariants} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                ¿Por Qué Nuestra Comida?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Descubre por qué nuestros platos son únicos en San Pedro de Atacama
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div key={feature.title} variants={itemVariants}>
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

        {/* Featured Dishes Section - Moai Integration */}
        <motion.section
          className="py-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="container mx-auto px-4">
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Platos Destacados
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Descubre los mejores platos preparados por cocineros locales de San Pedro de Atacama
              </p>
            </motion.div>
            <FeaturedCarousel />
          </div>
        </motion.section>

        {/* Recommendations Section - Only for logged in users */}
        {showRecommendations && (
          <motion.section
            className="py-20 bg-gradient-to-r from-orange-50/50 to-red-50/30"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="container mx-auto px-4">
              <RecommendationDashboard />
            </div>
          </motion.section>
        )}

        {/* Location-Based Dishes Section - Moai Integration */}
        <motion.section
          className="py-20 bg-gradient-to-r from-green-50/50 to-blue-50/30"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="container mx-auto px-4">
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Gastronomía del Desierto
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Descubre platos tradicionales preparados con ingredientes únicos del desierto de Atacama
              </p>
            </motion.div>
            <LocationBasedDishes />
          </div>
        </motion.section>

        {/* Traditional Restaurants Section */}
        <motion.section
          className="py-20 bg-white"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="container mx-auto px-4">
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Restaurantes Tradicionales
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Lugares emblemáticos donde puedes disfrutar de la auténtica gastronomía local
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {traditionalPlaces.map((place) => (
                <motion.div key={place.id} variants={itemVariants}>
                  <ModernCard variant="elevated" className="p-6 hover-lift">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{place.rating}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-600">{place.price}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{place.name}</h3>
                    <p className="text-sm text-orange-600 mb-2">{place.cuisine}</p>
                    <p className="text-gray-600 mb-4">{place.description}</p>
                    <button className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-2 px-4 rounded-md hover:from-orange-700 hover:to-red-700 transition-colors font-medium">
                      Ver Más
                    </button>
                  </ModernCard>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Testimonials Section - Moai Integration */}
        <motion.section
          className="py-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="container mx-auto px-4">
            <motion.div variants={itemVariants} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                ¿Qué Dice la Gente?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Experiencias reales de nuestros clientes y cocineros en San Pedro de Atacama
              </p>
            </motion.div>
            <Testimonials />
          </div>
        </motion.section>

        {/* Call to Action Section */}
        <motion.section
          className="py-20 bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 relative overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
                ¿Listo para Degustar?
              </h2>
              <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
                Únete a la comunidad gastronómica de San Pedro de Atacama y disfruta de experiencias culinarias inolvidables
              </p>
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link href="/eat/delivery" className="inline-block px-8 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 bg-white text-orange-600 hover:bg-gray-50">
                  🍽️ Explorar Platos
                </Link>
                <Link href="/eat/delivery" className="inline-block px-8 py-4 text-lg font-semibold rounded-full border-2 border-white/30 text-white hover:bg-white/10 transition-all duration-300 ml-4">
                  👨‍🍳 Conocer Cocineros
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Santurist
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Tu compañero perfecto para explorar San Pedro de Atacama con experiencias culinarias inolvidables.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">¿Qué Hacer?</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/tours" className="hover:text-orange-400 transition-colors">Tours Guiados</Link></li>
                <li><Link href="/eat" className="hover:text-orange-400 transition-colors">¿Qué Comer?</Link></li>
                <li><Link href="/services" className="hover:text-orange-400 transition-colors">Servicios</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Gastronomía</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/eat/dishes" className="hover:text-orange-400 transition-colors">Explorar Platos</a></li>
                <li><Link href="/eat/delivery" className="hover:text-orange-400 transition-colors">Cocineros Locales</Link></li>
                <li><a href="/eat/orders" className="hover:text-orange-400 transition-colors">Mis Pedidos</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Contacto</h4>
              <div className="space-y-2 text-gray-300">
                <p className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  San Pedro de Atacama, Chile
                </p>
                <p>info@santurist.cl</p>
                <p>+56 9 1234 5678</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-300">
            <p>&copy; 2025 Santurist. Todos los derechos reservados. Hecho con ❤️ en el desierto.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
