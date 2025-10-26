'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MarketplaceService } from '@/lib/services/marketplaceService';
import { UnifiedCartService } from '@/lib/services/unifiedCartService';
import { Listing, ListingCategory, SearchFilters } from '@/types/marketplace';
import { useAuth } from '@/context/AuthContext';
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

const CATEGORIES: { value: ListingCategory; label: string }[] = [
  { value: 'joyeria', label: 'Joyería' },
  { value: 'ceramica', label: 'Cerámica' },
  { value: 'textiles', label: 'Textiles' },
  { value: 'comida', label: 'Comida' },
  { value: 'tour_astronomico', label: 'Tour Astronómico' },
  { value: 'tour_volcan', label: 'Tour Volcán' },
  { value: 'tour_trekking', label: 'Tour Trekking' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'taxi', label: 'Taxi' },
  { value: 'bicicleta', label: 'Bicicleta' },
  { value: 'taller', label: 'Taller' },
];

export default function MarketplacePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [cartCount, setCartCount] = useState(0);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory | ''>('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock listings for demonstration
  const MOCK_LISTINGS: Listing[] = [
    {
      id: '1',
      providerId: 'provider-1',
      type: 'product',
      category: 'comida',
      name: 'Empanadas Caseras',
      description: 'Deliciosas empanadas de queso y champiñones recién hechas',
      price: 3000,
      currency: 'CLP',
      images: ['https://images.unsplash.com/photo-1585238341710-4dd0bd180d8d?w=400'],
      rating: 4.8,
      reviewCount: 24,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      providerId: 'provider-2',
      type: 'service',
      category: 'tour_astronomico',
      name: 'Tour Astronómico',
      description: 'Experiencia única observando las estrellas desde el desierto de Atacama',
      price: 45000,
      currency: 'CLP',
      images: ['https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400'],
      rating: 4.9,
      reviewCount: 52,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      providerId: 'provider-3',
      type: 'product',
      category: 'ceramica',
      name: 'Cerámica Artesanal',
      description: 'Hermosas piezas de cerámica hecha a mano por artesanos chilenos',
      price: 25000,
      currency: 'CLP',
      images: ['https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=400'],
      rating: 4.7,
      reviewCount: 18,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
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
      } catch (firebaseErr) {
        console.warn('Firebase error loading listings (likely permissions), using mock data:', firebaseErr);
        // Use mock data for demonstration
        setListings(MOCK_LISTINGS);
        setFilteredListings(MOCK_LISTINGS);
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
      {/* Header con carrito */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
            <p className="text-sm text-gray-600">
              Explora productos y servicios locales
            </p>
          </div>

          <button
            onClick={() => router.push('/marketplace/cart')}
            className="relative bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Mi carrito</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
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
        ) : viewMode === 'grid' ? (
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
          Mostrando {filteredListings.length} de {listings.length} resultados
        </div>
      </div>
    </div>
  );
}
