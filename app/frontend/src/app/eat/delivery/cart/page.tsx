'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Trash2, ArrowLeft, ShoppingCart } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, removeFromCart, updateQuantity, clearCart, getCartSubtotal, getDeliveryFee, getServiceFee, getTotal } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      router.push('/');
      return;
    }

    if (items.length === 0) {
      return;
    }

    // Redirigir a página de checkout
    router.push('/eat/delivery/checkout');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <button
            onClick={() => router.push('/eat/delivery')}
            className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
          <h1 className="text-2xl font-bold ml-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            🛒 Carrito
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Tu carrito está vacío</h2>
            <p className="text-gray-500 mb-6">Agrega algunos platos deliciosos para continuar</p>
            <button
              onClick={() => router.push('/eat/delivery')}
              className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-semibold"
            >
              Explorar platos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-6">Tus platos</h2>
                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-gray-200">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.cookerName}</p>
                        <p className="text-orange-600 font-bold mt-1">
                          ${item.price.toLocaleString('es-CL')} c/u
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors flex items-center justify-center"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
                <h2 className="text-xl font-bold mb-6">Resumen del pedido</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">${getCartSubtotal().toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Envío</span>
                    <span className="font-semibold">${getDeliveryFee().toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tarifa de servicio</span>
                    <span className="font-semibold">${getServiceFee().toLocaleString('es-CL')}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-lg text-orange-600">${getTotal().toLocaleString('es-CL')}</span>
                  </div>
                </div>

                {user ? (
                  <>
                    <button
                      onClick={handleCheckout}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-semibold disabled:opacity-50"
                    >
                      {isLoading ? 'Procesando...' : '💳 Ir a Pagar'}
                    </button>
                    <button
                      onClick={() => clearCart()}
                      className="w-full mt-3 text-gray-600 hover:text-gray-900 transition-colors text-sm"
                    >
                      Limpiar carrito
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => router.push('/')}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-semibold"
                  >
                    Inicia sesión para continuar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
