'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { ChefHat, Users, Award, Heart } from 'lucide-react';

export default function CooksRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Moai app for full cooker functionality
    const timer = setTimeout(() => {
      window.location.href = 'https://moai-wheat.vercel.app/cooks';
    }, 2000);

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
        <title>👨‍🍳 Cocineros Locales - Santurist</title>
        <meta name="description" content="Conoce a los cocineros locales que preparan los mejores platos de San Pedro de Atacama" />
        <meta http-equiv="refresh" content="2;url=https://moai-wheat.vercel.app/cooks" />
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
          <Link href="/eat" className="text-gray-700 hover:text-atacama-orange font-medium transition-colors">¿Qué Comer?</Link>
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
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
              {/* Loading Animation */}
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-6">
                  <ChefHat className="w-12 h-12 text-white animate-pulse" />
                </div>

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
                👨‍🍳 Cocineros Locales
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed"
              >
                Conoce a los talentosos cocineros que preparan los platos más deliciosos de San Pedro de Atacama con ingredientes frescos del desierto...
              </motion.p>

              {/* Features */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-3xl mx-auto"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                  <Award className="w-10 h-10 text-orange-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Certificados</h3>
                  <p className="text-sm text-gray-600">Todos nuestros cocineros pasan rigurosos controles de calidad</p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                  <Heart className="w-10 h-10 text-red-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Pasión Local</h3>
                  <p className="text-sm text-gray-600">Cocineros que aman compartir la gastronomía de Atacama</p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                  <Users className="w-10 h-10 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Comunidad</h3>
                  <p className="text-sm text-gray-600">Parte de una red de emprendedores culinarios locales</p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <button
                  onClick={() => window.location.href = 'https://moai-wheat.vercel.app/cooks'}
                  className="inline-block bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-full hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  👨‍🍳 Conocer a Nuestros Cocineros
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
