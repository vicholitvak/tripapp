'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MarketplaceService } from '@/lib/services/marketplaceService';
import { UnifiedCartService } from '@/lib/services/unifiedCartService';
import { Listing, ListingCategory, SearchFilters } from '@/types/marketplace';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  Search,
  Filter,
  ShoppingCart,
  Star,
  Grid,
  List as ListIcon,
  Loader,
  AlertCircle,
} from 'lucide-react';

interface Provider {
  id: string;
  name: string;
  description: string;
  category: ListingCategory;
  rating: number;
  reviewCount: number;
  image: string;
  products: Listing[];
}

const CATEGORIES: { value: ListingCategory; label: string; icon: string }[] = [
  { value: 'naturales', label: 'Productos Naturales & Orgánicos', icon: '🌿' },
  { value: 'joyeria', label: 'Joyería Artesanal', icon: '💎' },
  { value: 'ceramica', label: 'Cerámica Atacameña', icon: '🏺' },
  { value: 'textiles', label: 'Textiles Andinos', icon: '🧶' },
  { value: 'licores', label: 'Licores Locales', icon: '🍷' },
  { value: 'artesania', label: 'Artesanía General', icon: '🎨' },
];

export default function MarketplacePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [cartCount, setCartCount] = useState(0);

  // Nueva navegación: todos, categoria, artesano
  const [displayMode, setDisplayMode] = useState<'all' | 'category' | 'provider'>('all');

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory | ''>('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock providers con múltiples productos cada uno
  const MOCK_PROVIDERS: Provider[] = [
    {
      id: 'herbolario-jose',
      name: 'Herbolario Don José',
      description: 'Hierbas medicinales y productos orgánicos del altiplano. 30 años de experiencia.',
      category: 'naturales',
      rating: 4.9,
      reviewCount: 85,
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400',
      products: [
        {
          id: 'rica-rica-1',
          providerId: 'herbolario-jose',
          baseType: 'marketplace',
          category: 'naturales',
          name: 'Rica-Rica (50g)',
          description: 'Rica-rica seca ideal para té digestivo y mal de altura.',
          price: 5000,
          currency: 'CLP',
          images: ['https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400'],
          rating: 4.9,
          reviewCount: 45,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'chachacoma-1',
          providerId: 'herbolario-jose',
          baseType: 'marketplace',
          category: 'naturales',
          name: 'Chachacoma (50g)',
          description: 'Chachacoma 100% natural para mal de altura y digestión.',
          price: 6000,
          currency: 'CLP',
          images: ['https://images.unsplash.com/photo-1515694590279-73124e8df5c5?w=400'],
          rating: 4.8,
          reviewCount: 38,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'coca-1',
          providerId: 'herbolario-jose',
          baseType: 'marketplace',
          category: 'naturales',
          name: 'Hoja de Coca (100g)',
          description: 'Hojas de coca tradicionales para energía y mal de altura.',
          price: 4000,
          currency: 'CLP',
          images: ['https://images.unsplash.com/photo-1606588260160-8e536f22c56a?w=400'],
          rating: 5.0,
          reviewCount: 67,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'mezcla-digestiva',
          providerId: 'herbolario-jose',
          baseType: 'marketplace',
          category: 'naturales',
          name: 'Mezcla Digestiva (100g)',
          description: 'Mezcla de hierbas para problemas digestivos. Rica-rica, boldo y menta.',
          price: 7000,
          currency: 'CLP',
          images: ['https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400'],
          rating: 4.7,
          reviewCount: 28,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'miel-organica',
          providerId: 'herbolario-jose',
          baseType: 'marketplace',
          category: 'naturales',
          name: 'Miel Orgánica del Desierto (250g)',
          description: 'Miel 100% orgánica de flores del desierto de Atacama. Sin aditivos.',
          price: 8500,
          currency: 'CLP',
          images: ['https://images.unsplash.com/photo-1587049352846-4a222e784099?w=400'],
          rating: 4.9,
          reviewCount: 34,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'quinoa-organica',
          providerId: 'herbolario-jose',
          baseType: 'marketplace',
          category: 'naturales',
          name: 'Quinoa Orgánica (500g)',
          description: 'Quinoa orgánica cultivada en el altiplano. Alta en proteínas.',
          price: 6500,
          currency: 'CLP',
          images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'],
          rating: 4.8,
          reviewCount: 21,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    },
    {
      id: 'ceramica-maria',
      name: 'Cerámica María',
      description: 'Cerámica artesanal atacameña. Diseños tradicionales y modernos.',
      category: 'ceramica',
      rating: 4.8,
      reviewCount: 52,
      image: 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=400',
      products: [
        {
          id: 'vaso-andino',
          providerId: 'ceramica-maria',
          baseType: 'marketplace',
          category: 'ceramica',
          name: 'Vaso Andino',
          description: 'Vaso de cerámica con diseños geométricos atacameños.',
          price: 8000,
          currency: 'CLP',
          images: ['https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=400'],
          rating: 4.8,
          reviewCount: 15,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'plato-ceramica',
          providerId: 'ceramica-maria',
          baseType: 'marketplace',
          category: 'ceramica',
          name: 'Plato Decorativo',
          description: 'Plato de cerámica pintado a mano con motivos del desierto.',
          price: 12000,
          currency: 'CLP',
          images: ['https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400'],
          rating: 4.9,
          reviewCount: 22,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'jarron-pequeno',
          providerId: 'ceramica-maria',
          baseType: 'marketplace',
          category: 'ceramica',
          name: 'Jarrón Pequeño',
          description: 'Jarrón de cerámica artesanal ideal para flores secas.',
          price: 15000,
          currency: 'CLP',
          images: ['https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=400'],
          rating: 4.7,
          reviewCount: 10,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    },
    {
      id: 'joyeria-atacama',
      name: 'Joyería Atacama',
      description: 'Joyería artesanal con piedras preciosas de Chile.',
      category: 'joyeria',
      rating: 4.9,
      reviewCount: 68,
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400',
      products: [
        {
          id: 'collar-lapislazuli',
          providerId: 'joyeria-atacama',
          baseType: 'marketplace',
          category: 'joyeria',
          name: 'Collar Lapis Lazuli',
          description: 'Hermoso collar con piedras de lapis lazuli chileno.',
          price: 18000,
          currency: 'CLP',
          images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400'],
          rating: 4.9,
          reviewCount: 32,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'anillo-plata',
          providerId: 'joyeria-atacama',
          baseType: 'marketplace',
          category: 'joyeria',
          name: 'Anillo de Plata',
          description: 'Anillo de plata 950 con diseño andino.',
          price: 25000,
          currency: 'CLP',
          images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400'],
          rating: 5.0,
          reviewCount: 18,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'pulsera-cuarzo',
          providerId: 'joyeria-atacama',
          baseType: 'marketplace',
          category: 'joyeria',
          name: 'Pulsera de Cuarzo',
          description: 'Pulsera artesanal con cuarzos del desierto.',
          price: 12000,
          currency: 'CLP',
          images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400'],
          rating: 4.8,
          reviewCount: 15,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    },
    {
      id: 'textiles-andes',
      name: 'Textiles Los Andes',
      description: 'Textiles andinos tejidos a mano con lana de alpaca.',
      category: 'textiles',
      rating: 5.0,
      reviewCount: 42,
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400',
      products: [
        {
          id: 'manta-alpaca',
          providerId: 'textiles-andes',
          baseType: 'marketplace',
          category: 'textiles',
          name: 'Manta Andina',
          description: 'Manta tejida a mano 100% lana de alpaca.',
          price: 35000,
          currency: 'CLP',
          images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400'],
          rating: 5.0,
          reviewCount: 15,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'bufanda-alpaca',
          providerId: 'textiles-andes',
          baseType: 'marketplace',
          category: 'textiles',
          name: 'Bufanda de Alpaca',
          description: 'Bufanda suave y abrigada de lana de alpaca.',
          price: 15000,
          currency: 'CLP',
          images: ['https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=400'],
          rating: 5.0,
          reviewCount: 22,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    },
  ];

  useEffect(() => {
    loadListings();
    if (user) {
      updateCartCount();
    }
  }, [user]);

  const loadListings = async () => {
    try {
      setLoading(true);
      setError(null);
      try {
        const allListings = await MarketplaceService.getAllActive();
        setListings(allListings);
        setFilteredListings(allListings);
        // TODO: Load providers from Firebase
      } catch (firebaseErr) {
        console.warn('Firebase error loading listings (likely permissions), using mock data:', firebaseErr);
        // Use mock data: flatten all products from all providers
        setProviders(MOCK_PROVIDERS);
        const allProducts = MOCK_PROVIDERS.flatMap(provider => provider.products);
        setListings(allProducts);
        setFilteredListings(allProducts);
      }
    } catch (err) {
      console.error('Error loading listings:', err);
      setError('Error loading marketplace');
    } finally {
      setLoading(false);
    }
  };

  const updateCartCount = () => {
    if (user) {
      const count = UnifiedCartService.getItemCount(user.uid);
      setCartCount(count);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    applyFilters(value, selectedCategory, priceRange, minRating);
  };

  const handleCategoryChange = (category: ListingCategory | '') => {
    setSelectedCategory(category);
    applyFilters(searchTerm, category, priceRange, minRating);
  };

  const handlePriceChange = (min: number, max: number) => {
    setPriceRange({ min, max });
    applyFilters(searchTerm, selectedCategory, { min, max }, minRating);
  };

  const handleRatingChange = (rating: number) => {
    setMinRating(rating);
    applyFilters(searchTerm, selectedCategory, priceRange, rating);
  };

  const applyFilters = (
    search: string,
    category: ListingCategory | '',
    price: { min: number; max: number },
    rating: number
  ) => {
    let filtered = listings;

    // Búsqueda de texto
    if (search.trim()) {
      const term = search.toLowerCase();
      filtered = filtered.filter(
        l =>
          l.name.toLowerCase().includes(term) ||
          l.description.toLowerCase().includes(term)
      );
    }

    // Categoría
    if (category) {
      filtered = filtered.filter(l => l.category === category);
    }

    // Rango de precio
    filtered = filtered.filter(
      l => l.price >= price.min && l.price <= price.max
    );

    // Rating mínimo
    if (rating > 0) {
      filtered = filtered.filter(l => l.rating >= rating);
    }

    setFilteredListings(filtered);
  };

  const handleAddToCart = async (listing: Listing) => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    try {
      await UnifiedCartService.addToCart(user.uid, listing.id!);
      updateCartCount();
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header con navegación y carrito */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-orange-600 hover:text-orange-700 transition-colors">
              Santurist
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">Inicio</Link>
              <Link href="/tours" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">¿Qué Hacer?</Link>
              <Link href="/eat" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">¿Qué Comer?</Link>
              <Link href="/services" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">Servicios</Link>
              <Link href="/marketplace" className="text-orange-600 font-bold transition-colors">Tienda</Link>
            </nav>

            {/* Carrito */}
            <button
              onClick={() => router.push('/marketplace/cart')}
              className="relative bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline">Carrito</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Título de la página */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900">Tienda Local</h1>
          <p className="text-sm text-gray-600 mt-1">
            Hierbas medicinales, artesanía y productos locales para llevar
          </p>
        </div>
      </div>

      {/* Navegación de vistas: Todos / Por Categoría / Por Artesano */}
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
              📦 Todos los Productos
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
              onClick={() => setDisplayMode('provider')}
              className={`px-6 py-3 font-medium transition-colors ${
                displayMode === 'provider'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-orange-600'
              }`}
            >
              👤 Por Artesano
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 p-4">
          <div className="container mx-auto px-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Búsqueda principal */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos, servicios..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              <span>Filtros</span>
            </button>

            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-orange-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-orange-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ListIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filtros expandidos */}
          {showFilters && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
              {/* Categorías */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Categoría
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  <button
                    onClick={() => handleCategoryChange('')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === ''
                        ? 'bg-orange-600 text-white'
                        : 'bg-white border border-gray-300 hover:border-orange-400'
                    }`}
                  >
                    Todas
                  </button>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => handleCategoryChange(cat.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === cat.value
                          ? 'bg-orange-600 text-white'
                          : 'bg-white border border-gray-300 hover:border-orange-400'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rango de precio */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Rango de precio: ${priceRange.min.toLocaleString('es-CL')} - $
                  {priceRange.max.toLocaleString('es-CL')}
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="10000"
                    value={priceRange.min}
                    onChange={(e) =>
                      handlePriceChange(
                        parseInt(e.target.value),
                        priceRange.max
                      )
                    }
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="10000"
                    value={priceRange.max}
                    onChange={(e) =>
                      handlePriceChange(priceRange.min, parseInt(e.target.value))
                    }
                    className="w-full"
                  />
                </div>
              </div>

              {/* Rating mínimo */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Rating mínimo
                </label>
                <div className="flex gap-2">
                  {[0, 1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => handleRatingChange(rating)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        minRating === rating
                          ? 'bg-orange-600 text-white'
                          : 'bg-white border border-gray-300 hover:border-orange-400'
                      }`}
                    >
                      {rating === 0 ? 'Todos' : `${rating}+ ⭐`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-12">
        {filteredListings.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No se encontraron resultados
            </h2>
            <p className="text-gray-600 mb-6">
              Intenta con otros filtros o términos de búsqueda
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setPriceRange({ min: 0, max: 1000000 });
                setMinRating(0);
                setFilteredListings(listings);
              }}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        ) : displayMode === 'provider' ? (
          /* Vista Por Artesano - Mostrar tarjetas de proveedores */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map(provider => {
              // Filtrar productos del proveedor según filtros activos
              const providerProducts = provider.products.filter(product =>
                filteredListings.some(fl => fl.id === product.id)
              );

              // Solo mostrar proveedor si tiene productos que pasan los filtros
              if (providerProducts.length === 0) return null;

              return (
                <div
                  key={provider.id}
                  onClick={() => router.push(`/marketplace/provider/${provider.id}`)}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
                >
                  {/* Imagen del proveedor */}
                  <div className="relative h-48 bg-gradient-to-br from-orange-100 to-orange-50 overflow-hidden">
                    <img
                      src={provider.image}
                      alt={provider.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  {/* Contenido */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {provider.name}
                        </h3>
                        <p className="text-sm text-gray-500 uppercase font-semibold">
                          {CATEGORIES.find(c => c.value === provider.category)?.label}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {provider.description}
                    </p>

                    {/* Rating y reviews */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(provider.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {provider.rating.toFixed(1)} ({provider.reviewCount} reseñas)
                      </span>
                    </div>

                    {/* Cantidad de productos */}
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-orange-600">
                          {providerProducts.length} {providerProducts.length === 1 ? 'producto' : 'productos'}
                        </span>{' '}
                        disponibles
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : displayMode === 'category' ? (
          /* Vista Por Categoría - Agrupar por categoría y luego por proveedor */
          <div className="space-y-12">
            {CATEGORIES.map(category => {
              // Obtener todos los proveedores de esta categoría que tienen productos filtrados
              const categoryProviders = providers.filter(provider => {
                const hasProducts = provider.products.some(product =>
                  filteredListings.some(fl => fl.id === product.id) &&
                  product.category === category.value
                );
                return hasProducts;
              });

              if (categoryProviders.length === 0) return null;

              return (
                <div key={category.value} className="space-y-6">
                  {/* Header de categoría */}
                  <div className="flex items-center gap-3 pb-4 border-b-2 border-orange-200">
                    <span className="text-4xl">{category.icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {category.label}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {categoryProviders.length} {categoryProviders.length === 1 ? 'artesano' : 'artesanos'}
                      </p>
                    </div>
                  </div>

                  {/* Proveedores de esta categoría */}
                  <div className="space-y-8">
                    {categoryProviders.map(provider => {
                      const providerProducts = provider.products.filter(product =>
                        filteredListings.some(fl => fl.id === product.id) &&
                        product.category === category.value
                      );

                      return (
                        <div key={provider.id} className="bg-white rounded-lg shadow-md p-6">
                          {/* Header del proveedor */}
                          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                              <img
                                src={provider.image}
                                alt={provider.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900">
                                {provider.name}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {provider.description}
                              </p>
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${
                                        i < Math.round(provider.rating)
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-600">
                                  {provider.rating.toFixed(1)}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => router.push(`/marketplace/provider/${provider.id}`)}
                              className="px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors text-sm font-medium"
                            >
                              Ver todos →
                            </button>
                          </div>

                          {/* Productos del proveedor */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {providerProducts.map(listing => (
                              <div
                                key={listing.id}
                                className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 hover:shadow-md transition-all"
                              >
                                <div className="flex gap-3">
                                  {/* Mini imagen */}
                                  <div className="w-20 h-20 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                                    {listing.images[0] ? (
                                      <img
                                        src={listing.images[0]}
                                        alt={listing.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                        Sin imagen
                                      </div>
                                    )}
                                  </div>

                                  {/* Info del producto */}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                                      {listing.name}
                                    </h4>
                                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                      {listing.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                      <span className="text-orange-600 font-bold">
                                        ${listing.price.toLocaleString('es-CL')}
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAddToCart(listing);
                                        }}
                                        className="bg-orange-600 text-white p-1.5 rounded hover:bg-orange-700 transition-colors"
                                      >
                                        <ShoppingCart className="w-3.5 h-3.5" />
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
        ) : viewMode === 'grid' ? (
          /* Vista Todos - Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map(listing => (
              <div
                key={listing.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              >
                {/* Imagen */}
                <div className="relative h-40 bg-gray-200 overflow-hidden">
                  {listing.images[0] ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Sin imagen
                    </div>
                  )}
                  {listing.featured && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Destacado
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                    {listing.category}
                  </p>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {listing.name}
                  </h3>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {listing.description}
                  </p>

                  {/* Rating */}
                  {listing.reviewCount > 0 && (
                    <div className="flex items-center gap-1 mb-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(listing.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">
                        ({listing.reviewCount})
                      </span>
                    </div>
                  )}

                  {/* Precio y botón */}
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-orange-600">
                      ${listing.price.toLocaleString('es-CL')}
                    </div>
                    <button
                      onClick={() => handleAddToCart(listing)}
                      className="bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Vista Todos - List */
          <div className="space-y-4">
            {filteredListings.map(listing => (
              <div
                key={listing.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex gap-6"
              >
                {/* Imagen */}
                <div className="w-48 h-48 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                  {listing.images[0] ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Sin imagen
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                    {listing.category}
                  </p>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {listing.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{listing.description}</p>

                  {/* Rating */}
                  {listing.reviewCount > 0 && (
                    <div className="flex items-center gap-1 mb-4">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(listing.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {listing.rating.toFixed(1)} ({listing.reviewCount} reviews)
                      </span>
                    </div>
                  )}

                  {/* Precio y botón */}
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-orange-600">
                      ${listing.price.toLocaleString('es-CL')}
                    </div>
                    <button
                      onClick={() => handleAddToCart(listing)}
                      className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Agregar al carrito
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Información de resultados */}
        <div className="mt-12 text-center text-gray-600">
          {displayMode === 'provider' ? (
            <>Mostrando {providers.filter(p => p.products.some(prod => filteredListings.some(fl => fl.id === prod.id))).length} artesanos</>
          ) : displayMode === 'category' ? (
            <>Mostrando productos en {CATEGORIES.filter(cat => providers.some(p => p.products.some(prod => filteredListings.some(fl => fl.id === prod.id) && prod.category === cat.value))).length} categorías</>
          ) : (
            <>Mostrando {filteredListings.length} de {listings.length} resultados</>
          )}
        </div>
      </div>
    </div>
  );
}
