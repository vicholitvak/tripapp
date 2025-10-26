'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { motion } from 'framer-motion';
import { ModernCard } from '../../../components/ui/modern-card';
import { Star, Clock, MapPin, Heart, TrendingUp, ChefHat, Sparkles, Target } from 'lucide-react';

interface Recommendation {
  id: number;
  name: string;
  description: string;
  price: number;
  cooker: string;
  location: string;
  rating: number;
  prepTime: string;
  image: string;
  matchType: 'trending' | 'personal' | 'location' | 'favorites';
  reason: string;
}

const RecommendationDashboard = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Simulate loading recommendations
      setTimeout(() => {
        setRecommendations([
          {
            id: 1,
            name: 'Cazuela Atacameña',
            description: 'Cazuela tradicional preparada con carne de alpaca y verduras del desierto',
            price: 12500,
            cooker: 'Chef Ana María',
            location: 'San Pedro Centro',
            rating: 4.9,
            prepTime: '40 min',
            image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
            matchType: 'location',
            reason: 'Popular en San Pedro'
          },
          {
            id: 2,
            name: 'Quinoa del Desierto',
            description: 'Quinoa orgánica cocida con hierbas aromáticas y verduras frescas',
            price: 7800,
            cooker: 'María José',
            location: 'Toconao',
            rating: 4.8,
            prepTime: '20 min',
            image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
            matchType: 'personal',
            reason: 'Basado en tus preferencias'
          },
          {
            id: 3,
            name: 'Empanadas Chilenas',
            description: 'Empanadas de pino tradicionales con masa casera',
            price: 6500,
            cooker: 'Familia Rodríguez',
            location: 'San Pedro Sur',
            rating: 4.7,
            prepTime: '25 min',
            image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
            matchType: 'trending',
            reason: 'Más pedido esta semana'
          }
        ]);
        setLoading(false);
      }, 1500);
    }
  }, [user]);

  const getMatchTypeIcon = (matchType: string) => {
    switch (matchType) {
      case 'location':
        return <MapPin className="h-4 w-4" />;
      case 'personal':
        return <Heart className="h-4 w-4" />;
      case 'trending':
        return <TrendingUp className="h-4 w-4" />;
      case 'favorites':
        return <Star className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const getMatchTypeColor = (matchType: string) => {
    switch (matchType) {
      case 'location':
        return 'bg-green-100 text-green-800';
      case 'personal':
        return 'bg-pink-100 text-pink-800';
      case 'trending':
        return 'bg-orange-100 text-orange-800';
      case 'favorites':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  if (!user) {
    return (
      <div className="py-20 bg-gradient-to-r from-orange-50/50 to-red-50/30">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto shadow-lg">
            <Heart className="w-16 h-16 text-orange-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Inicia Sesión para Recomendaciones
            </h3>
            <p className="text-gray-600 mb-6">
              Descubre platos personalizados según tus gustos y ubicación en San Pedro de Atacama.
            </p>
            <button className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-full hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-medium">
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-20 bg-gradient-to-r from-orange-50/50 to-red-50/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              🍽️ Recomendaciones Personalizadas
            </h2>
            <p className="text-lg text-gray-600">
              Preparando recomendaciones especiales para ti...
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <ModernCard key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </ModernCard>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 bg-gradient-to-r from-orange-50/50 to-red-50/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            🎯 Recomendaciones para {user.displayName?.split(' ')[0]}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Platos seleccionados especialmente para ti basados en tus preferencias y la gastronomía de San Pedro de Atacama
          </p>
        </motion.div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recommendations.map((dish, index) => (
            <motion.div
              key={dish.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <ModernCard variant="elevated" className="overflow-hidden hover-lift group">
                {/* Match Type Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getMatchTypeColor(dish.matchType)} backdrop-blur-sm`}>
                    {getMatchTypeIcon(dish.matchType)}
                    <span>{dish.reason}</span>
                  </div>
                </div>

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

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 max-w-lg mx-auto shadow-lg">
            <Sparkles className="w-12 h-12 text-orange-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¿Quieres más recomendaciones?
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Cuantos más pedidos hagas, mejores serán nuestras sugerencias personalizadas.
            </p>
            <a href="/dishes" className="inline-block bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-full hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-medium">
              Ver Todos los Platos
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RecommendationDashboard;
