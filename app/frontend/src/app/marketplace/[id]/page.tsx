'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Listing } from '@/types/marketplace';
import { UnifiedCartService } from '@/lib/services/unifiedCartService';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  ShoppingCart,
  Star,
  ChevronLeft,
  Loader,
  AlertCircle,
  Package,
  Truck,
  Shield,
  Heart,
} from 'lucide-react';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    loadListing();
  }, [params.id]);

  const loadListing = async () => {
    try {
      setLoading(true);
      setError(null);

      const listingRef = doc(db, 'marketplaceListings', params.id as string);
      const listingDoc = await getDoc(listingRef);

      if (!listingDoc.exists()) {
        setError('Producto no encontrado');
        return;
      }

      const data = listingDoc.data();
      const listingData: Listing = {
        id: listingDoc.id,
        providerId: data.providerId,
        baseType: data.baseType,
        category: data.category,
        name: data.name,
        description: data.description,
        price: data.price,
        currency: data.currency,
        images: data.images || [],
        rating: data.rating || 0,
        reviewCount: data.reviewCount || 0,
        status: data.status,
        featured: data.featured,
        tags: data.tags,
        productInfo: data.productInfo,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };

      setListing(listingData);
    } catch (err) {
      console.error('Error loading listing:', err);
      setError('Error al cargar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!listing?.id) return;

    try {
      setAddingToCart(true);
      for (let i = 0; i < quantity; i++) {
        await UnifiedCartService.addToCart(user.uid, listing.id);
      }
      // Mostrar feedback visual
      alert(`✓ ${quantity} ${quantity === 1 ? 'producto agregado' : 'productos agregados'} al carrito`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error al agregar al carrito');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{error || 'Producto no encontrado'}</h2>
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
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-2xl font-bold text-orange-600 hover:text-orange-700 transition-colors">
              Santurist
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">Inicio</Link>
              <Link href="/tours" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">¿Qué Hacer?</Link>
              <Link href="/marketplace" className="text-orange-600 font-bold transition-colors">Tienda</Link>
            </nav>
            <button
              onClick={() => router.push('/marketplace/cart')}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline">Carrito</span>
            </button>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/marketplace" className="hover:text-orange-600">Marketplace</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{listing.name}</span>
        </div>
      </div>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Volver
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Galería de imágenes */}
          <div>
            {/* Imagen principal */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-4">
              <div className="aspect-square bg-gray-100">
                {listing.images[selectedImage] ? (
                  <img
                    src={listing.images[selectedImage]}
                    alt={listing.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Sin imagen
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {listing.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {listing.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-orange-600 shadow-md'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${listing.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div>
            {/* Badges */}
            <div className="flex gap-2 mb-4">
              {listing.featured && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                  ⭐ Destacado
                </span>
              )}
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
                {listing.category}
              </span>
            </div>

            {/* Título */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{listing.name}</h1>

            {/* Rating */}
            {listing.reviewCount > 0 && (
              <div className="flex items-center gap-2 mb-6">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(listing.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {listing.rating.toFixed(1)} ({listing.reviewCount} reseñas)
                </span>
              </div>
            )}

            {/* Precio */}
            <div className="mb-6">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                ${listing.price.toLocaleString('es-CL')}
              </div>
              <p className="text-sm text-gray-600">Precio en pesos chilenos (CLP)</p>
            </div>

            {/* Descripción */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h2>
              <p className="text-gray-600 leading-relaxed">{listing.description}</p>
            </div>

            {/* Stock */}
            {listing.productInfo?.stock && (
              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  <Package className="w-4 h-4 inline mr-1" />
                  <span className="font-semibold">Stock:</span> {listing.productInfo.stock} unidades disponibles
                </p>
              </div>
            )}

            {/* Cantidad */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Cantidad
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 hover:border-orange-400 hover:bg-orange-50 transition-colors font-semibold"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={listing.productInfo?.stock || 999}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  onClick={() => setQuantity(Math.min(listing.productInfo?.stock || 999, quantity + 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 hover:border-orange-400 hover:bg-orange-50 transition-colors font-semibold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || !listing.productInfo?.stock}
                className="w-full bg-orange-600 text-white py-4 rounded-lg hover:bg-orange-700 transition-colors font-semibold text-lg flex items-center justify-center gap-3 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {addingToCart ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Agregando...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Agregar al Carrito
                  </>
                )}
              </button>

              <button className="w-full border-2 border-orange-600 text-orange-600 py-3 rounded-lg hover:bg-orange-50 transition-colors font-semibold flex items-center justify-center gap-2">
                <Heart className="w-5 h-5" />
                Agregar a Favoritos
              </button>
            </div>

            {/* Información adicional */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Envío</p>
                  <p className="text-sm text-gray-600">
                    {listing.productInfo?.shippingCost
                      ? `Costo de envío: $${listing.productInfo.shippingCost.toLocaleString('es-CL')}`
                      : 'Consultar costo de envío'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Garantía</p>
                  <p className="text-sm text-gray-600">
                    Producto artesanal 100% hecho a mano. Cada pieza es única.
                  </p>
                </div>
              </div>
            </div>

            {/* Tags */}
            {listing.tags?.custom && listing.tags.custom.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-900 mb-2">Etiquetas:</p>
                <div className="flex flex-wrap gap-2">
                  {listing.tags.custom.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
