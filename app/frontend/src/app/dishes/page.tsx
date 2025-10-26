'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { ChefHat, Clock, Star, Utensils } from 'lucide-react';

export default function DishesRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Moai app for full delivery functionality
    const timer = setTimeout(() => {
      window.location.href = 'https://moai-wheat.vercel.app/dishes';
    }, 2000); // Give user time to see the redirect message

    return () => clearTimeout(timer);
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50/30">
      <Head>
        <title>🍽️ Explorar Platos - Santurist</title>
        <meta name="description" content="Descubre y ordena deliciosos platos preparados por cocineros locales en San Pedro de Atacama" />
        <meta http-equiv="refresh" content="2;url=https://moai-wheat.vercel.app/dishes" />
      </Head>

      {/* Modern Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="text-2xl font-bold text-atacama-orange cursor-pointer" onClick={() => router.push('/')}>
              Santurist
            </div>

            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-atacama-orange font-medium transition-colors">Inicio</Link>
              <Link href="/tours" className="text-gray-700 hover:text-atacama-orange font-medium transition-colors">Tours</Link>
              <Link href="/eat" className="text-atacama-orange font-bold transition-colors">¿Qué Comer?</Link>
              <Link href="/services" className="text-gray-700 hover:text-atacama-orange font-medium transition-colors">Servicios</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <button className="bg-atacama-orange text-white px-6 py-2 rounded-full hover:bg-atacama-orange/90 transition-colors font-medium">
                Iniciar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-20">
        <motion.section
          className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-white to-red-50 overflow-hidden"
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
              {/* Loading Animation */}
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-6">
                  <Utensils className="w-12 h-12 text-white animate-pulse" />
                </div>

                {/* Animated dots */}
                <div className="flex justify-center space-x-2 mb-6">
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>

              <motion.h1
                variants={itemVariants}
                className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"
              >
                🍽️ Explorar Platos
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed"
              >
                Redirigiendo a nuestro sistema completo de delivery Moai para que puedas explorar y ordenar todos los deliciosos platos preparados por cocineros locales...
              </motion.p>

              {/* Features Preview */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-3xl mx-auto"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                  <ChefHat className="w-10 h-10 text-orange-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Cocineros Locales</h3>
                  <p className="text-sm text-gray-600">Más de 50 cocineros expertos en San Pedro</p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                  <Clock className="w-10 h-10 text-red-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Entrega Rápida</h3>
                  <p className="text-sm text-gray-600">Delivery en menos de 45 minutos</p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                  <Star className="w-10 h-10 text-yellow-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Calidad Garantizada</h3>
                  <p className="text-sm text-gray-600">Todos nuestros cocineros certificados</p>
                </div>
              </motion.div>

              {/* Manual Redirect Button */}
              <motion.div variants={itemVariants}>
                <button
                  onClick={() => window.location.href = 'https://moai-wheat.vercel.app/dishes'}
                  className="inline-block bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-full hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  🍽️ Ir a Moai Delivery Ahora
                </button>
              </motion.div>

              <motion.p
                variants={itemVariants}
                className="text-sm text-gray-500 mt-6"
              >
                O espera un momento... te estamos llevando automáticamente
              </motion.p>
            </motion.div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
