'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Search, Filter, LogOut, Star } from 'lucide-react';

// Dish type
interface Dish {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  dishCategory?: 'entrada' | 'fondo' | 'bebida' | 'complemento' | 'postre';
  rating: number;
  prepTime: string;
  image: string;
  scheduleTags?: ('desayuno' | 'almuerzo' | 'once' | 'cena' | 'bajon' | 'madrugada')[];
}

// Restaurant/Cook provider interface
interface Restaurant {
  id: string;
  name: string;
  description: string;
  category: 'chilena' | 'internacional' | 'vegetariana' | 'premium';
  rating: number;
  reviewCount: number;
  prepTimeAvg: string;
  image: string;
  dishes: Dish[];
}

// Mock restaurants with multiple dishes each
const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: 'dona-carmen',
    name: 'Cocina de Doña Carmen',
    description: 'Cocina tradicional chilena con recetas familiares transmitidas por generaciones.',
    category: 'chilena',
    rating: 4.9,
    reviewCount: 127,
    prepTimeAvg: '30 min',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
    dishes: [
      {
        id: 'porotos-granados',
        restaurantId: 'dona-carmen',
        name: 'Porotos Granados Atacameños',
        description: 'Clásico imprescindible de la cocina chilena. Preparado con porotos frescos, choclo dulce y zapallo otoñal.',
        price: 8500,
        category: 'chilena',
        rating: 4.8,
        prepTime: '25 min',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
        scheduleTags: ['almuerzo', 'cena'],
      },
      {
        id: 'humita-atacamena',
        restaurantId: 'dona-carmen',
        name: 'Humita Atacameña Premium',
        description: 'Humita preparada diariamente con choclo recién cosechado del oasis local.',
        price: 7200,
        category: 'chilena',
        rating: 4.9,
        prepTime: '30 min',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
        scheduleTags: ['desayuno', 'once'],
      },
      {
        id: 'charquican',
        restaurantId: 'dona-carmen',
        name: 'Charquicán del Desierto',
        description: 'Estofado tradicional atacameño hecho con carne de res tierna y papas andinas.',
        price: 9500,
        category: 'chilena',
        rating: 4.7,
        prepTime: '35 min',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
        scheduleTags: ['almuerzo', 'cena'],
      },
      {
        id: 'cazuela-campo',
        restaurantId: 'dona-carmen',
        name: 'Cazuela del Campo',
        description: 'Sopa tradicional chilena con carne, zapallo, choclo y papas del valle.',
        price: 8000,
        category: 'chilena',
        rating: 4.6,
        prepTime: '40 min',
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop',
        scheduleTags: ['almuerzo', 'madrugada'],
      },
    ],
  },
  {
    id: 'familia-silva',
    name: 'Familia Silva',
    description: 'Platos gourmet con ingredientes locales y técnicas modernas.',
    category: 'premium',
    rating: 4.8,
    reviewCount: 89,
    prepTimeAvg: '40 min',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    dishes: [
      {
        id: 'pastel-choclo',
        restaurantId: 'familia-silva',
        name: 'Pastel de Choclo Gourmet',
        description: 'Pastel estratificado con capas de carne, pollo, huevo y aceitunas. Cubierto con pasta de choclo cremosa.',
        price: 12000,
        category: 'premium',
        rating: 4.9,
        prepTime: '45 min',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
      },
      {
        id: 'lomo-saltado',
        restaurantId: 'familia-silva',
        name: 'Lomo Saltado Premium',
        description: 'Lomo de res salteado con vegetales frescos y papas fritas artesanales.',
        price: 13500,
        category: 'premium',
        rating: 4.8,
        prepTime: '35 min',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
      },
      {
        id: 'salmon-atacama',
        restaurantId: 'familia-silva',
        name: 'Salmón del Atacama',
        description: 'Filete de salmón a la parrilla con quinoa del altiplano y verduras asadas.',
        price: 15000,
        category: 'premium',
        rating: 5.0,
        prepTime: '40 min',
        image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
      },
    ],
  },
  {
    id: 'verde-oasis',
    name: 'Verde Oasis',
    description: 'Opciones vegetarianas y veganas frescas del huerto local.',
    category: 'vegetariana',
    rating: 4.7,
    reviewCount: 64,
    prepTimeAvg: '25 min',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    dishes: [
      {
        id: 'buddha-bowl',
        restaurantId: 'verde-oasis',
        name: 'Buddha Bowl Atacameño',
        description: 'Bowl nutritivo con quinoa, vegetales asados, aguacate y aderezo de tahini.',
        price: 7500,
        category: 'vegetariana',
        rating: 4.8,
        prepTime: '20 min',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
      },
      {
        id: 'ensalada-quinoa',
        restaurantId: 'verde-oasis',
        name: 'Ensalada de Quinoa Premium',
        description: 'Quinoa orgánica con vegetales frescos, nueces y vinagreta de limón.',
        price: 6500,
        category: 'vegetariana',
        rating: 4.6,
        prepTime: '15 min',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
      },
      {
        id: 'wrap-veggie',
        restaurantId: 'verde-oasis',
        name: 'Wrap Vegetariano',
        description: 'Wrap integral con hummus casero, vegetales frescos y queso de cabra.',
        price: 6000,
        category: 'vegetariana',
        rating: 4.7,
        prepTime: '25 min',
        image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop',
      },
    ],
  },
  {
    id: 'chef-roberto',
    name: 'Chef Roberto Internacional',
    description: 'Fusión de sabores internacionales con toques locales.',
    category: 'internacional',
    rating: 4.6,
    reviewCount: 52,
    prepTimeAvg: '35 min',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
    dishes: [
      {
        id: 'pasta-carbonara',
        restaurantId: 'chef-roberto',
        name: 'Pasta Carbonara',
        description: 'Pasta fresca con salsa carbonara cremosa, tocino y parmesano.',
        price: 9000,
        category: 'internacional',
        rating: 4.7,
        prepTime: '30 min',
        image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop',
      },
      {
        id: 'pizza-margherita',
        restaurantId: 'chef-roberto',
        name: 'Pizza Margherita Artesanal',
        description: 'Pizza con masa madre, tomate san marzano, mozzarella fresca y albahaca.',
        price: 10500,
        category: 'internacional',
        rating: 4.5,
        prepTime: '35 min',
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop',
      },
      {
        id: 'risotto-funghi',
        restaurantId: 'chef-roberto',
        name: 'Risotto ai Funghi',
        description: 'Risotto cremoso con hongos silvestres y parmesano reggiano.',
        price: 11000,
        category: 'internacional',
        rating: 4.6,
        prepTime: '40 min',
        image: 'https://images.unsplash.com/photo-1476124369491-b79c9e58c10d?w=400&h=300&fit=crop',
      },
    ],
  },
];

const CATEGORIES = [
  { value: 'chilena', label: 'Comida Chilena', icon: '🇨🇱' },
  { value: 'internacional', label: 'Internacional', icon: '🌎' },
  { value: 'vegetariana', label: 'Vegetariana', icon: '🥗' },
  { value: 'premium', label: 'Premium', icon: '⭐' },
];

export default function DeliveryPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { addToCart, itemCount } = useCart();
  const [restaurants, setRestaurants] = useState<Restaurant[]>(MOCK_RESTAURANTS);
  const [allDishes, setAllDishes] = useState<Dish[]>([]);
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [displayMode, setDisplayMode] = useState<'all' | 'category' | 'restaurant'>('all');

  // Initialize dishes from restaurants
  useState(() => {
    const dishes = restaurants.flatMap(r => r.dishes);
    setAllDishes(dishes);
    setFilteredDishes(dishes);
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(query, selectedCategory);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    applyFilters(searchQuery, category);
  };

  const applyFilters = (search: string, category: string) => {
    let filtered = allDishes;

    if (search.trim()) {
      const term = search.toLowerCase();
      filtered = filtered.filter(
        d => d.name.toLowerCase().includes(term) || d.description.toLowerCase().includes(term)
      );
    }

    if (category) {
      filtered = filtered.filter(d => d.category === category);
    }

    setFilteredDishes(filtered);
  };

  const handleAddToCart = (dish: Dish) => {
    const restaurant = restaurants.find(r => r.id === dish.restaurantId);
    if (!restaurant) return;

    addToCart({
      dishId: dish.id,
      name: dish.name,
      price: dish.price,
      image: dish.image,
      cookerName: restaurant.name,
      cookerId: restaurant.id,
      cookerAvatar: restaurant.image,
      quantity: 1,
      prepTime: dish.prepTime,
      category: dish.category
    });
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
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
                <span className="text-sm text-gray-600 hidden md:block">{user.email}</span>
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

      {/* Navigation Tabs: All / Category / Restaurant */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setDisplayMode('all')}
              className={`px-6 py-3 font-medium transition-colors ${
                displayMode === 'all'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-orange-600'
              }`}
            >
              📦 Todos los Platos
            </button>
            <button
              onClick={() => setDisplayMode('category')}
              className={`px-6 py-3 font-medium transition-colors ${
                displayMode === 'category'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-orange-600'
              }`}
            >
              🏷️ Por Categoría
            </button>
            <button
              onClick={() => setDisplayMode('restaurant')}
              className={`px-6 py-3 font-medium transition-colors ${
                displayMode === 'restaurant'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-orange-600'
              }`}
            >
              👨‍🍳 Por Restaurante
            </button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Busca platos o restaurantes..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
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
            <button
              onClick={() => handleCategoryChange('')}
              className={`whitespace-nowrap px-4 py-2 rounded-full transition-colors ${
                selectedCategory === ''
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`whitespace-nowrap px-4 py-2 rounded-full transition-colors ${
                  selectedCategory === cat.value
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content based on display mode */}
        {filteredDishes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron platos</p>
          </div>
        ) : displayMode === 'restaurant' ? (
          /* Vista Por Restaurante - Restaurant Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map(restaurant => {
              const restaurantDishes = restaurant.dishes.filter(dish =>
                filteredDishes.some(fd => fd.id === dish.id)
              );

              if (restaurantDishes.length === 0) return null;

              return (
                <div
                  key={restaurant.id}
                  onClick={() => router.push(`/eat/restaurant/${restaurant.id}`)}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
                >
                  <div className="relative h-48 bg-gradient-to-br from-orange-100 to-orange-50 overflow-hidden">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {restaurant.name}
                        </h3>
                        <p className="text-sm text-gray-500 uppercase font-semibold">
                          {CATEGORIES.find(c => c.value === restaurant.category)?.label}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {restaurant.description}
                    </p>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(restaurant.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {restaurant.rating.toFixed(1)} ({restaurant.reviewCount} reseñas)
                      </span>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-orange-600">
                          {restaurantDishes.length} {restaurantDishes.length === 1 ? 'plato' : 'platos'}
                        </span>{' '}
                        disponibles • ⏱️ {restaurant.prepTimeAvg}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : displayMode === 'category' ? (
          /* Vista Por Categoría - Grouped by category then restaurant */
          <div className="space-y-12">
            {CATEGORIES.map(category => {
              const categoryRestaurants = restaurants.filter(restaurant => {
                const hasDishes = restaurant.dishes.some(dish =>
                  filteredDishes.some(fd => fd.id === dish.id) &&
                  dish.category === category.value
                );
                return hasDishes;
              });

              if (categoryRestaurants.length === 0) return null;

              return (
                <div key={category.value} className="space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b-2 border-orange-200">
                    <span className="text-4xl">{category.icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {category.label}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {categoryRestaurants.length} {categoryRestaurants.length === 1 ? 'restaurante' : 'restaurantes'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {categoryRestaurants.map(restaurant => {
                      const restaurantDishes = restaurant.dishes.filter(dish =>
                        filteredDishes.some(fd => fd.id === dish.id) &&
                        dish.category === category.value
                      );

                      return (
                        <div key={restaurant.id} className="bg-white rounded-lg shadow-md p-6">
                          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                              <img
                                src={restaurant.image}
                                alt={restaurant.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900">
                                {restaurant.name}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {restaurant.description}
                              </p>
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${
                                        i < Math.round(restaurant.rating)
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-600">
                                  {restaurant.rating.toFixed(1)}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => router.push(`/eat/restaurant/${restaurant.id}`)}
                              className="px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors text-sm font-medium"
                            >
                              Ver todos →
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {restaurantDishes.map(dish => (
                              <div
                                key={dish.id}
                                className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 hover:shadow-md transition-all"
                              >
                                <div className="flex gap-3">
                                  <div className="w-20 h-20 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                                    <img
                                      src={dish.image}
                                      alt={dish.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                                      {dish.name}
                                    </h4>
                                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                      {dish.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                      <span className="text-orange-600 font-bold">
                                        ${dish.price.toLocaleString('es-CL')}
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAddToCart(dish);
                                        }}
                                        className="bg-orange-600 text-white px-2 py-1 rounded text-xs hover:bg-orange-700 transition-colors"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Vista Todos los Platos - All dishes grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredDishes.map(dish => {
              const restaurant = restaurants.find(r => r.id === dish.restaurantId);
              return (
                <div
                  key={dish.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
                  onClick={() => router.push(`/eat/restaurant/${dish.restaurantId}`)}
                >
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

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">{dish.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{dish.description}</p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <span>👨‍🍳</span>
                        <span className="truncate">{restaurant?.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>⏱️</span>
                        <span>{dish.prepTime}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-orange-600">
                        ${dish.price.toLocaleString('es-CL')}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(dish);
                        }}
                        className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-medium"
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Results info */}
        <div className="mt-12 text-center text-gray-600">
          {displayMode === 'restaurant' ? (
            <>Mostrando {restaurants.filter(r => r.dishes.some(d => filteredDishes.some(fd => fd.id === d.id))).length} restaurantes</>
          ) : displayMode === 'category' ? (
            <>Mostrando platos en {CATEGORIES.filter(cat => restaurants.some(r => r.dishes.some(d => filteredDishes.some(fd => fd.id === d.id) && d.category === cat.value))).length} categorías</>
          ) : (
            <>Mostrando {filteredDishes.length} de {allDishes.length} platos</>
          )}
        </div>
      </main>
    </div>
  );
}
