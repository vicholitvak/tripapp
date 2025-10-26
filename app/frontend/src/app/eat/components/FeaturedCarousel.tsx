'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ModernCard } from '../../../components/ui/modern-card';
import { Star, Clock, MapPin, ChefHat } from 'lucide-react';

// Sample featured dishes for San Pedro de Atacama
const featuredDishes = [
  {
    id: 1,
    name: 'Porotos Granados Atacameños',
    description: 'Clásico imprescindible de la cocina chilena. Preparado con porotos frescos, choclo dulce y zapallo otoñal. Receta familiar transmitida por generaciones. Doña Carmen lo prepara con el toque especial de las abuelas.',
    price: 8500,
    cooker: 'Doña Carmen',
    location: 'San Pedro Centro',
    rating: 4.8,
    prepTime: '25 min',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'
  },
  {
    id: 2,
    name: 'Humita Atacameña Premium',
    description: 'Humita preparada diariamente con choclo recién cosechado del oasis local y hierbas aromáticas del desierto. Envuelta en hojas de choclo y cocida al vapor. Acompañada con salsa criolla casera. Experiencia auténtica del norte.',
    price: 7200,
    cooker: 'Chef Roberto',
    location: 'Cochrane 234',
    rating: 4.9,
    prepTime: '30 min',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop'
  },
  {
    id: 3,
    name: 'Charquicán del Desierto',
    description: 'Estofado tradicional atacameño hecho con carne de res tierna, papas andinas, cebolla morada y condimentos locales. Preparado a fuego lento en cazuela de barro. Representa la esencia de la gastronomía del Atacama. Perfecto para calentar el alma en las noches frías.',
    price: 9500,
    cooker: 'María González',
    location: 'Toconao',
    rating: 4.7,
    prepTime: '35 min',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'
  },
  {
    id: 4,
    name: 'Pastel de Choclo Gourmet',
    description: 'Pastel estratificado con capas de carne roja molida, pollo, huevo duro y aceitunas negras. Cubierto con pasta de choclo cremosa y gratinado al horno. Resultado: explosion de sabores en cada bocado. Especialidad de la Familia Silva.',
    price: 12000,
    cooker: 'Familia Silva',
    location: 'San Pedro Norte',
    rating: 4.6,
    prepTime: '45 min',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop'
  }
];

const FeaturedCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredDishes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  return (
    <section className="py-20 bg-gradient-to-r from-orange-50/30 to-red-50/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            🍽️ Platos Destacados
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubre los sabores más populares preparados por cocineros locales de San Pedro de Atacama
          </p>
        </motion.div>

        {/* Featured Dishes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredDishes.map((dish, index) => (
            <motion.div
              key={dish.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <ModernCard variant="elevated" className="overflow-hidden hover-lift group">
                {/* Dish Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{dish.rating}</span>
                  </div>
                </div>

                {/* Dish Info */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                    {dish.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {dish.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <ChefHat className="w-4 h-4" />
                      <span>{dish.cooker}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{dish.prepTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-gray-600">{dish.location}</span>
                    </div>
                    <span className="text-lg font-bold text-orange-600">
                      {formatPrice(dish.price)}
                    </span>
                  </div>

                  {/* Action Button */}
                  <a href="/dishes" className="block w-full mt-4 bg-gradient-to-r from-orange-600 to-red-600 text-white py-2 px-4 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-medium transform hover:scale-105 text-center">
                    🍽️ Ordenar Ahora
                  </a>
                </div>
              </ModernCard>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <a href="/dishes" className="inline-block bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-3 rounded-full hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105">
            Ver Todos los Platos →
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedCarousel;
