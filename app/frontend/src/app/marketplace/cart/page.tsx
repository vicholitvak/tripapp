'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UnifiedCartService } from '@/lib/services/unifiedCartService';
import { MarketplaceService } from '@/lib/services/marketplaceService';
import { UnifiedCart, CartByProvider } from '@/types/marketplace';
import { useAuth } from '@/context/AuthContext';
import {
  Trash2,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  ShoppingCart,
  Loader,
  AlertCircle,
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [cart, setCart] = useState<UnifiedCart | null>(null);
  const [cartByProvider, setCartByProvider] = useState<CartByProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(
    new Set()
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    loadCart();
  }, [user, router]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const cart = UnifiedCartService.getCart(user!.uid);
      setCart(cart);

      // Cargar nombres de proveedores
      const providersWithNames = await Promise.all(
        cart.itemsByProvider.map(async (provider) => {
          try {
            const listing = await MarketplaceService.getById(
              provider.items[0].listingId
            );
            return {
              ...provider,
              providerName: listing?.providerId || 'Proveedor',
            };
          } catch {
            return provider;
          }
        })
      );

      setCartByProvider(providersWithNames);
      setError(null);
    } catch (error) {
      console.error('Error loading cart:', error);
      setError('Error al cargar el carrito');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = (listingId: string) => {
    const updated = UnifiedCartService.removeFromCart(user!.uid, listingId);
    setCart(updated);

    const newCartByProvider = updated.itemsByProvider.filter(
      p => p.items.length > 0
    );
    setCartByProvider(newCartByProvider);
  };

  const handleUpdateQuantity = (listingId: string, quantity: number) => {
    const updated = UnifiedCartService.updateQuantity(
      user!.uid,
      listingId,
      quantity
    );
    setCart(updated);

    const newCartByProvider = updated.itemsByProvider.filter(
      p => p.items.length > 0
    );
    setCartByProvider(newCartByProvider);
  };

  const handleClearCart = () => {
    if (
      window.confirm(
        '¿Estás seguro de que deseas vaciar el carrito? Esta acción no se puede deshacer.'
      )
    ) {
      const updated = UnifiedCartService.clearCart(user!.uid);
      setCart(updated);
      setCartByProvider([]);
    }
  };

  const toggleProvider = (providerId: string) => {
    const newExpanded = new Set(expandedProviders);
    if (newExpanded.has(providerId)) {
      newExpanded.delete(providerId);
    } else {
      newExpanded.add(providerId);
    }
    setExpandedProviders(newExpanded);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando carrito...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/marketplace')}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Volver al marketplace
          </button>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <div className="container mx-auto px-4 py-12">
          <button
            onClick={() => router.push('/marketplace')}
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al marketplace
          </button>

          <div className="text-center py-24">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Carrito vacío
            </h1>
            <p className="text-gray-600 mb-8">
              Aún no has agregado ningún producto al carrito
            </p>
            <button
              onClick={() => router.push('/marketplace')}
              className="px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
            >
              Explorar marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/marketplace')}
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Seguir comprando
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Mi carrito</h1>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Carrito (lado izquierdo) */}
          <div className="lg:col-span-2 space-y-6">
            {cartByProvider.map((provider) => (
              <div key={provider.providerId} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Header del proveedor */}
                <button
                  onClick={() => toggleProvider(provider.providerId)}
                  className="w-full p-4 bg-orange-50 border-b border-orange-200 flex items-center justify-between hover:bg-orange-100 transition-colors"
                >
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">
                      {provider.providerName || 'Proveedor'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {provider.items.length} artículo
                      {provider.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${provider.subtotal.toLocaleString('es-CL')}
                      </p>
                      <p className="text-xs text-gray-600">subtotal</p>
                    </div>
                    {expandedProviders.has(provider.providerId) ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                </button>

                {/* Items del proveedor */}
                {expandedProviders.has(provider.providerId) && (
                  <div className="p-4 space-y-4">
                    {provider.items.map((item) => (
                      <div key={item.listingId} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                        {/* Imagen */}
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.listingName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              Sin imagen
                            </div>
                          )}
                        </div>

                        {/* Detalles */}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {item.listingName}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            ${item.price.toLocaleString('es-CL')} c/u
                          </p>

                          {/* Servicios con fecha */}
                          {item.serviceDate && (
                            <p className="text-xs text-gray-600 mb-2">
                              📅{' '}
                              {new Date(item.serviceDate).toLocaleDateString(
                                'es-CL'
                              )}
                              {item.serviceTime && ` a las ${item.serviceTime}`}
                            </p>
                          )}

                          {/* Cantidad */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.listingId,
                                  item.quantity - 1
                                )
                              }
                              disabled={item.quantity <= 1}
                              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                            >
                              −
                            </button>
                            <span className="w-8 text-center font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.listingId,
                                  item.quantity + 1
                                )
                              }
                              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Precio total y eliminar */}
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 mb-2">
                            $
                            {(item.price * item.quantity).toLocaleString(
                              'es-CL'
                            )}
                          </p>
                          <button
                            onClick={() => handleRemoveItem(item.listingId)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Botón limpiar carrito */}
            <button
              onClick={handleClearCart}
              className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
            >
              Vaciar carrito
            </button>
          </div>

          {/* Resumen (lado derecho) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen</h2>

              {/* Desglose */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>
                    ${(cart?.subtotal || 0).toLocaleString('es-CL')}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Comisión de plataforma:</span>
                  <span>
                    ${(cart?.commission || 0).toLocaleString('es-CL')}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  <p>
                    La comisión cubre gestión de pago, soporte, y operación de la
                    plataforma
                  </p>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-baseline mb-6">
                <span className="text-lg font-semibold text-gray-900">
                  Total:
                </span>
                <span className="text-3xl font-bold text-orange-600">
                  ${(cart?.total || 0).toLocaleString('es-CL')}
                </span>
              </div>

              {/* Botones */}
              <button
                onClick={() => router.push('/marketplace/checkout')}
                className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold mb-3"
              >
                Ir a checkout
              </button>

              <button
                onClick={() => router.push('/marketplace')}
                className="w-full border border-orange-600 text-orange-600 py-3 rounded-lg hover:bg-orange-50 transition-colors font-semibold"
              >
                Seguir comprando
              </button>

              {/* Información */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-700">
                  <strong>💡 Nota:</strong> Puedes comprar de múltiples proveedores.
                  Cada proveedor procesará su pedido por separado.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
