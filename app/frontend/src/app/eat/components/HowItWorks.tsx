'use client';

import { motion } from 'framer-motion';
import { Search, ShoppingCart, Truck } from 'lucide-react';
import { ModernCard } from '../../../components/ui/modern-card';

const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: 'Descubre',
      description: 'Explora la gastronomía única de San Pedro de Atacama. Encuentra platos tradicionales preparados con ingredientes frescos del desierto.'
    },
    {
      icon: ShoppingCart,
      title: 'Ordena',
      description: 'Selecciona tus platos favoritos y crea tu pedido personalizado con nuestros cocineros locales certificados.'
    },
    {
      icon: Truck,
      title: 'Disfruta',
      description: 'Recibe tu comida caliente en tu puerta o retírala en el restaurante. ¡Entrega rápida y segura!'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-orange-50/50 to-red-50/30">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-16 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"
        >
          🍽️ ¿Cómo Funciona el Delivery?
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Step Number */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
              </div>

              <ModernCard variant="elevated" className="p-8 text-center hover-lift pt-12">
                <div className="flex flex-col items-center space-y-6">
                  {/* Icon */}
                  <div className="p-4 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg">
                    <step.icon className="w-8 h-8" />
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </ModernCard>

              {/* Connection Line (hidden on mobile, visible on desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-full w-8 lg:w-12 h-0.5 bg-gradient-to-r from-orange-400 to-red-400 transform -translate-x-1/2"></div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              🚀 Servicio Premium en San Pedro de Atacama
            </h3>
            <p className="text-gray-600">
              Conectamos cocineros tradicionales con visitantes del desierto. Cada plato cuenta una historia del Atacama.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;



