'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UnifiedCartService } from '@/lib/services/unifiedCartService';
import { Listing, ListingCategory } from '@/types/marketplace';
import Link from 'next/link';
import {
  ArrowLeft,
  ShoppingCart,
  Star,
  MapPin,
  MessageCircle,
  Share2,
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

// Mock data - same as marketplace page
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

export default function ProviderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    loadProvider();
    if (user) {
      updateCartCount();
    }
  }, [params.id, user]);

  const loadProvider = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real app, fetch from Firebase
      // const providerData = await ProviderService.getById(params.id);

      // For now, use mock data
      const foundProvider = MOCK_PROVIDERS.find(p => p.id === params.id);

      if (!foundProvider) {
        setError('Proveedor no encontrado');
        return;
      }

      setProvider(foundProvider);
    } catch (err) {
      console.error('Error loading provider:', err);
      setError('Error cargando información del proveedor');
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
          <p className="text-gray-600">Cargando proveedor...</p>
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{error || 'Proveedor no encontrado'}</h2>
          <Link
            href="/marketplace"
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            ← Volver al marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header con navegación */}
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

      {/* Botón volver */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al marketplace
          </Link>
        </div>
      </div>

      {/* Hero del proveedor */}
      <div className="bg-gradient-to-br from-orange-100 to-orange-50 border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Imagen del proveedor */}
            <div className="w-full md:w-64 h-64 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={provider.image}
                alt={provider.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Información del proveedor */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {provider.name}
              </h1>
              <p className="text-lg text-gray-700 mb-4">
                {provider.description}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(provider.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {provider.rating.toFixed(1)}
                </span>
                <span className="text-gray-600">
                  ({provider.reviewCount} reseñas)
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-orange-600">
                    {provider.products.length}
                  </div>
                  <div className="text-sm text-gray-600">Productos</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-orange-600">
                    {provider.reviewCount}
                  </div>
                  <div className="text-sm text-gray-600">Reseñas</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-orange-600">
                    {provider.rating.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Rating</div>
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

      {/* Productos del proveedor */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Productos de {provider.name}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {provider.products.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Imagen del producto */}
              <div className="relative h-48 bg-gray-200 overflow-hidden">
                {product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Sin imagen
                  </div>
                )}
              </div>

              {/* Contenido */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>

                {/* Rating */}
                {product.reviewCount > 0 && (
                  <div className="flex items-center gap-1 mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < Math.round(product.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">
                      ({product.reviewCount})
                    </span>
                  </div>
                )}

                {/* Precio y botón */}
                <div className="flex items-center justify-between">
                  <div className="text-xl font-bold text-orange-600">
                    ${product.price.toLocaleString('es-CL')}
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
