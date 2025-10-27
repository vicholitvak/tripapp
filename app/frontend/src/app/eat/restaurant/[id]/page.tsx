'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import {
  ArrowLeft,
  ShoppingCart,
  Star,
  Clock,
  MessageCircle,
  Share2,
  Loader,
  AlertCircle,
} from 'lucide-react';

// Dish type
interface Dish {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  dishCategory: 'entrada' | 'fondo' | 'bebida' | 'complemento' | 'postre';
  rating: number;
  prepTime: string;
  image: string;
}

// Restaurant interface
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

// Mock data - same as delivery page
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
        dishCategory: 'fondo',
        rating: 4.8,
        prepTime: '25 min',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
      },
      {
        id: 'humita-atacamena',
        restaurantId: 'dona-carmen',
        name: 'Humita Atacameña Premium',
        description: 'Humita preparada diariamente con choclo recién cosechado del oasis local.',
        price: 7200,
        category: 'chilena',
        dishCategory: 'entrada',
        rating: 4.9,
        prepTime: '30 min',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
      },
      {
        id: 'charquican',
        restaurantId: 'dona-carmen',
        name: 'Charquicán del Desierto',
        description: 'Estofado tradicional atacameño hecho con carne de res tierna y papas andinas.',
        price: 9500,
        category: 'chilena',
        dishCategory: 'fondo',
        rating: 4.7,
        prepTime: '35 min',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
      },
      {
        id: 'cazuela-campo',
        restaurantId: 'dona-carmen',
        name: 'Cazuela del Campo',
        description: 'Sopa tradicional chilena con carne, zapallo, choclo y papas del valle.',
        price: 8000,
        category: 'chilena',
        dishCategory: 'entrada',
        rating: 4.6,
        prepTime: '40 min',
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop',
      },
      {
        id: 'mote-con-huesillo',
        restaurantId: 'dona-carmen',
        name: 'Mote con Huesillo Tradicional',
        description: 'Refrescante bebida tradicional chilena con mote de trigo y duraznos en almíbar.',
        price: 3500,
        category: 'chilena',
        dishCategory: 'bebida',
        rating: 4.5,
        prepTime: '5 min',
        image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=300&fit=crop',
      },
      {
        id: 'pebre-casero',
        restaurantId: 'dona-carmen',
        name: 'Pebre Casero',
        description: 'Salsa chilena picante con tomate, cebolla, cilantro y ají verde.',
        price: 2500,
        category: 'chilena',
        dishCategory: 'complemento',
        rating: 4.7,
        prepTime: '10 min',
        image: 'https://images.unsplash.com/photo-1599639957043-f3aa5c986398?w=400&h=300&fit=crop',
      },
      {
        id: 'sopaipillas',
        restaurantId: 'dona-carmen',
        name: 'Sopaipillas Pasadas',
        description: 'Sopaipillas fritas con chancaca caliente, perfectas para el frío del desierto.',
        price: 4500,
        category: 'chilena',
        dishCategory: 'postre',
        rating: 4.8,
        prepTime: '15 min',
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop',
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
        dishCategory: 'fondo',
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
        dishCategory: 'fondo',
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
        dishCategory: 'fondo',
        rating: 5.0,
        prepTime: '40 min',
        image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
      },
      {
        id: 'pisco-sour-premium',
        restaurantId: 'familia-silva',
        name: 'Pisco Sour Premium',
        description: 'Clásico chileno preparado con pisco artesanal y limones frescos.',
        price: 5500,
        category: 'premium',
        dishCategory: 'bebida',
        rating: 4.9,
        prepTime: '10 min',
        image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=300&fit=crop',
      },
      {
        id: 'ceviche-entrada',
        restaurantId: 'familia-silva',
        name: 'Ceviche de Entrada',
        description: 'Pescado fresco marinado en limón con cebolla morada y cilantro.',
        price: 8500,
        category: 'premium',
        dishCategory: 'entrada',
        rating: 4.8,
        prepTime: '15 min',
        image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
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
        dishCategory: 'fondo',
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
        dishCategory: 'entrada',
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
        dishCategory: 'fondo',
        rating: 4.7,
        prepTime: '25 min',
        image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop',
      },
      {
        id: 'smoothie-verde',
        restaurantId: 'verde-oasis',
        name: 'Smoothie Verde Energizante',
        description: 'Batido verde con espinaca, plátano, mango y leche de almendras.',
        price: 4500,
        category: 'vegetariana',
        dishCategory: 'bebida',
        rating: 4.7,
        prepTime: '5 min',
        image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=300&fit=crop',
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
        dishCategory: 'fondo',
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
        dishCategory: 'fondo',
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
        dishCategory: 'fondo',
        rating: 4.6,
        prepTime: '40 min',
        image: 'https://images.unsplash.com/photo-1476124369491-b79c9e58c10d?w=400&h=300&fit=crop',
      },
      {
        id: 'bruschetta-italiana',
        restaurantId: 'chef-roberto',
        name: 'Bruschetta Italiana',
        description: 'Pan tostado con tomates frescos, albahaca y aceite de oliva virgen.',
        price: 5500,
        category: 'internacional',
        dishCategory: 'entrada',
        rating: 4.4,
        prepTime: '10 min',
        image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&h=300&fit=crop',
      },
      {
        id: 'vino-tinto',
        restaurantId: 'chef-roberto',
        name: 'Copa de Vino Tinto',
        description: 'Selección de vinos tintos chilenos premium.',
        price: 4500,
        category: 'internacional',
        dishCategory: 'bebida',
        rating: 4.6,
        prepTime: '2 min',
        image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop',
      },
    ],
  },
];

export default function RestaurantDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart, itemCount } = useCart();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    loadRestaurant();
  }, [params.id]);

  const loadRestaurant = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real app, fetch from Firebase
      const foundRestaurant = MOCK_RESTAURANTS.find(r => r.id === params.id);

      if (!foundRestaurant) {
        setError('Restaurante no encontrado');
        return;
      }

      setRestaurant(foundRestaurant);
    } catch (err) {
      console.error('Error loading restaurant:', err);
      setError('Error cargando información del restaurante');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (dish: Dish) => {
    if (!restaurant) return;

    const quantity = quantities[dish.id] || 1;

    addToCart({
      dishId: dish.id,
      name: dish.name,
      price: dish.price,
      image: dish.image,
      cookerName: restaurant.name,
      cookerId: restaurant.id,
      cookerAvatar: restaurant.image,
      quantity,
      prepTime: dish.prepTime,
      category: dish.category
    });

    // Reset quantity after adding
    setQuantities(prev => ({ ...prev, [dish.id]: 1 }));
  };

  const updateQuantity = (dishId: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[dishId] || 1;
      const newValue = Math.max(1, current + delta);
      return { ...prev, [dishId]: newValue };
    });
  };

  // Group dishes by category
  const groupedDishes = restaurant?.dishes.reduce((acc, dish) => {
    if (!acc[dish.dishCategory]) {
      acc[dish.dishCategory] = [];
    }
    acc[dish.dishCategory].push(dish);
    return acc;
  }, {} as Record<string, Dish[]>) || {};

  const categoryNames: Record<string, string> = {
    entrada: '🥗 Entradas',
    fondo: '🍽️ Platos de Fondo',
    bebida: '🥤 Bebidas',
    complemento: '🌶️ Complementos',
    postre: '🍰 Postres',
  };

  const categoryOrder: ('entrada' | 'fondo' | 'bebida' | 'complemento' | 'postre')[] = [
    'entrada',
    'fondo',
    'bebida',
    'complemento',
    'postre',
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando restaurante...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{error || 'Restaurante no encontrado'}</h2>
          <Link
            href="/eat/delivery"
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            ← Volver al delivery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            🍽️ Delivery
          </h1>

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
        </div>
      </header>

      {/* Back button */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/eat/delivery"
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al delivery
          </Link>
        </div>
      </div>

      {/* Restaurant Hero */}
      <div className="bg-gradient-to-br from-orange-100 to-orange-50 border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-64 h-64 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {restaurant.name}
              </h1>
              <p className="text-lg text-gray-700 mb-4">
                {restaurant.description}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(restaurant.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {restaurant.rating.toFixed(1)}
                </span>
                <span className="text-gray-600">
                  ({restaurant.reviewCount} reseñas)
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-orange-600">
                    {restaurant.dishes.length}
                  </div>
                  <div className="text-sm text-gray-600">Platos</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-orange-600 flex items-center gap-1">
                    <Clock className="w-5 h-5" />
                    {restaurant.prepTimeAvg}
                  </div>
                  <div className="text-sm text-gray-600">Tiempo Promedio</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-orange-600">
                    {restaurant.reviewCount}
                  </div>
                  <div className="text-sm text-gray-600">Reseñas</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  <MessageCircle className="w-5 h-5" />
                  Contactar
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  <Share2 className="w-5 h-5" />
                  Compartir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant Dishes by Category */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Menú de {restaurant.name}
        </h2>

        {categoryOrder.map(category => {
          const dishesInCategory = groupedDishes[category];
          if (!dishesInCategory || dishesInCategory.length === 0) return null;

          return (
            <div key={category} className="mb-12">
              <h3 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-orange-500">
                {categoryNames[category]}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {dishesInCategory.map(dish => {
                  const quantity = quantities[dish.id] || 1;
                  return (
                    <div
                      key={dish.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all"
                    >
                      {/* Dish Image */}
                      <div className="relative h-48 bg-gray-200 overflow-hidden">
                        {dish.image ? (
                          <img
                            src={dish.image}
                            alt={dish.name}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            Sin imagen
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm font-medium">{dish.rating}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {dish.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {dish.description}
                        </p>

                        {/* Prep time */}
                        <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                          <Clock className="w-4 h-4" />
                          <span>{dish.prepTime}</span>
                        </div>

                        {/* Price */}
                        <div className="text-xl font-bold text-orange-600 mb-3">
                          ${dish.price.toLocaleString('es-CL')}
                        </div>

                        {/* Quantity selector and add button */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(dish.id, -1)}
                              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 font-bold"
                            >
                              -
                            </button>
                            <div className="px-4 py-2 min-w-[3rem] text-center font-semibold">
                              {quantity}
                            </div>
                            <button
                              onClick={() => updateQuantity(dish.id, 1)}
                              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 font-bold"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => handleAddToCart(dish)}
                            className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-medium"
                          >
                            Agregar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
