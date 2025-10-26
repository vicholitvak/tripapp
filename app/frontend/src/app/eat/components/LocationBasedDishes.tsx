'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ModernCard } from '../../../components/ui/modern-card';
import { MapPin, Clock, Star, ChefHat, Mountain, Waves, Sun } from 'lucide-react';

// Sample location-based dishes for San Pedro de Atacama
const locationDishes = {
  'san-pedro-centro': {
    name: 'San Pedro Centro',
    icon: MapPin,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    dishes: [
      {
        id: 1,
        name: 'Llama Guisada',
        description: 'Guiso tradicional de llama con papas y verduras del desierto',
        price: 14500,
        cooker: 'Restaurante El Ayllu',
        rating: 4.8,
        prepTime: '50 min',
        image: 'https://images.unsplash.com/photo-1551782450-17144efb5723?w=400&h=300&fit=crop',
        specialty: 'Carne de Llama'
      },
      {
        id: 2,
        name: 'Sopa de Quinoa',
        description: 'Sopa nutritiva preparada con quinoa orgánica del altiplano',
        price: 8200,
        cooker: 'Café Honradez',
        rating: 4.6,
        prepTime: '25 min',
        image: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=400&h=300&fit=crop',
        specialty: 'Quinoa Orgánica'
      }
    ]
  },
  'tocanao': {
    name: 'Toconao',
    icon: Mountain,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    dishes: [
      {
        id: 3,
        name: 'Pastel de Papas',
        description: 'Pastel de papas con carne y verduras, especialidad local',
        price: 11200,
        cooker: 'Comedor Doña Rosa',
        rating: 4.9,
        prepTime: '45 min',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
        specialty: 'Papas del Desierto'
      },
      {
        id: 4,
        name: 'Mate de Coca',
        description: 'Infusión tradicional de hojas de coca con hierbas aromáticas',
        price: 4500,
        cooker: 'Casa de Té Andino',
        rating: 4.7,
        prepTime: '10 min',
        image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop',
        specialty: 'Hierbas Andinas'
      }
    ]
  },
  'altiplano': {
    name: 'Altiplano',
    icon: Sun,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    dishes: [
      {
        id: 5,
        name: 'Trucha del Desierto',
        description: 'Trucha fresca de los ríos del altiplano, preparada al grill',
        price: 16800,
        cooker: 'Rincón del Pescador',
        rating: 4.8,
        prepTime: '35 min',
        image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
        specialty: 'Pescado Fresco'
      },
      {
        id: 6,
        name: 'Hummus de Pallar',
        description: 'Hummus preparado con pallar del desierto y especias locales',
        price: 7200,
        cooker: 'Fusion Atacama',
        rating: 4.5,
        prepTime: '15 min',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
        specialty: 'Ingredientes Únicos'
      }
    ]
  }
};

const LocationBasedDishes = () => {
  const [selectedLocation, setSelectedLocation] = useState('san-pedro-centro');
  const [loading, setLoading] = useState(false);

  const handleLocationChange = (locationId: string) => {
    setLoading(true);
    setTimeout(() => {
      setSelectedLocation(locationId);
      setLoading(false);
    }, 500);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  const currentLocation = locationDishes[selectedLocation as keyof typeof locationDishes];
  const LocationIcon = currentLocation.icon;

  return (
    <div className="py-20 bg-gradient-to-r from-blue-50/50 to-green-50/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            🏜️ Gastronomía por Zonas
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubre platos tradicionales preparados con ingredientes únicos de diferentes zonas del desierto de Atacama
          </p>
        </motion.div>

        {/* Location Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {Object.entries(locationDishes).map(([key, location]) => {
            const Icon = location.icon;
            const isSelected = selectedLocation === key;

            return (
              <button
                key={key}
                onClick={() => handleLocationChange(key)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-300 ${
                  isSelected
                    ? `bg-gradient-to-r from-${location.color.split('-')[1]}-500 to-${location.color.split('-')[1]}-600 text-white shadow-lg transform scale-105`
                    : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md hover:shadow-lg'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{location.name}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Location Info Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className={`${currentLocation.bgColor} rounded-2xl p-8 max-w-md mx-auto shadow-lg`}>
            <LocationIcon className={`w-12 h-12 ${currentLocation.color} mx-auto mb-4`} />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              {currentLocation.name}
            </h3>
            <p className="text-gray-600">
              Sabores únicos del desierto preparados por cocineros locales con ingredientes tradicionales.
            </p>
          </div>
        </motion.div>

        {/* Dishes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
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
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {currentLocation.dishes.map((dish, index) => (
              <motion.div
                key={dish.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <ModernCard variant="elevated" className="overflow-hidden hover-lift group">
                  {/* Specialty Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-orange-600 border border-orange-200">
                      ⭐ {dish.specialty}
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

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-1">
                        <LocationIcon className={`w-4 h-4 ${currentLocation.color}`} />
                        <span className="text-sm text-gray-600">{currentLocation.name}</span>
                      </div>
                      <span className="text-lg font-bold text-orange-600">
                        {formatPrice(dish.price)}
                      </span>
                    </div>

                    {/* Action Button */}
                    <a href="/dishes" className="block w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-2 px-4 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-medium transform hover:scale-105 text-center">
                      🍽️ Ordenar Ahora
                    </a>
                  </div>
                </ModernCard>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto shadow-lg">
            <Mountain className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Explora Más Zonas de San Pedro
            </h3>
            <p className="text-gray-600 mb-6">
              Cada zona del desierto tiene sus propios ingredientes y tradiciones culinarias únicas. Descubre todos los sabores de Atacama.
            </p>
            <a href="/dishes" className="inline-block bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-full hover:from-blue-700 hover:to-green-700 transition-all duration-300 font-medium">
              Ver Todas las Zonas →
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LocationBasedDishes;
