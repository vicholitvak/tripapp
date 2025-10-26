'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Search, Filter, LogOut } from 'lucide-react';

// Sample featured dishes data for now
const featuredDishes = [
  {
    id: '1',
    name: 'Porotos Granados Atacameños',
    description: 'Clásico imprescindible de la cocina chilena. Preparado con porotos frescos, choclo dulce y zapallo otoñal.',
    price: 8500,
    cookerName: 'Doña Carmen',
    cookerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop',
    rating: 4.8,
    prepTime: '25 min',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    category: 'Tradicional'
  },
  {
    id: '2',
    name: 'Humita Atacameña Premium',
    description: 'Humita preparada diariamente con choclo recién cosechado del oasis local.',
    price: 7200,
    cookerName: 'Chef Roberto',
    cookerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop',
    rating: 4.9,
    prepTime: '30 min',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    category: 'Tradicional'
  },
  {
    id: '3',
    name: 'Charquicán del Desierto',
    description: 'Estofado tradicional atacameño hecho con carne de res tierna y papas andinas.',
    price: 9500,
    cookerName: 'María González',
    cookerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop',
    rating: 4.7,
    prepTime: '35 min',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    category: 'Tradicional'
  },
  {
    id: '4',
    name: 'Pastel de Choclo Gourmet',
    description: 'Pastel estratificado con capas de carne, pollo, huevo y aceitunas. Cubierto con pasta de choclo cremosa.',
    price: 12000,
    cookerName: 'Familia Silva',
    cookerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop',
    rating: 4.6,
    prepTime: '45 min',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    category: 'Tradicional'
  }
];

export default function DeliveryPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { addToCart, itemCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleAddToCart = (dish: typeof featuredDishes[0]) => {
    addToCart({
      dishId: dish.id,
      name: dish.name,
      price: dish.price,
      image: dish.image,
      cookerName: dish.cookerName,
      cookerId: 'cooker-id',
      cookerAvatar: dish.cookerAvatar,
      quantity: 1,
      prepTime: dish.prepTime,
      category: dish.category
    });
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const filteredDishes = featuredDishes.filter(dish => {
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || dish.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              🍽️ Delivery
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/eat/delivery/cart')}
              className="relative p-2 hover:bg-orange-50 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            {user && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Busca platos o cocineros..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-5 h-5" />
              Filtros
            </button>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['All', 'Tradicional', 'Vegetariano', 'Premium'].map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap px-4 py-2 rounded-full transition-colors ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Dishes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredDishes.map(dish => (
            <div key={dish.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Dish Image */}
              <div className="relative h-48 overflow-hidden bg-gray-200">
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm font-medium">{dish.rating}</span>
                </div>
              </div>

              {/* Dish Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{dish.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{dish.description}</p>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <span>👨‍🍳</span>
                    <span>{dish.cookerName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>⏱️</span>
                    <span>{dish.prepTime}</span>
                  </div>
                </div>

                {/* Price and Button */}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-orange-600">
                    ${dish.price.toLocaleString('es-CL')}
                  </span>
                  <button
                    onClick={() => handleAddToCart(dish)}
                    className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-medium"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredDishes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron platos</p>
          </div>
        )}
      </main>
    </div>
  );
}
