'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { DeliveryBookingService } from '@/lib/services/deliveryBookingService';
import { ArrowLeft, Loader, AlertCircle, MapPin, Phone, Mail } from 'lucide-react';

export default function DeliveryCheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, getCartSubtotal, getDeliveryFee, getServiceFee, getTotal, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('San Pedro de Atacama');
  const [instructions, setInstructions] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user || items.length === 0) {
      router.push('/eat/delivery');
    }
  }, [user, items, router]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!customerName.trim()) errors.customerName = 'El nombre es requerido';
    if (!customerEmail.trim()) errors.customerEmail = 'El email es requerido';
    if (!customerPhone.trim()) errors.customerPhone = 'El teléfono es requerido';
    if (!street.trim()) errors.street = 'La dirección es requerida';
    if (!city.trim()) errors.city = 'La ciudad es requerida';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const order = {
        customerId: user.uid,
        customerName,
        customerEmail,
        customerPhone,
        items: items.map(item => ({
          dishId: item.dishId,
          name: item.name,
          cookerId: item.cookerId,
          cookerName: item.cookerName,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: getCartSubtotal(),
        deliveryFee: getDeliveryFee(),
        serviceFee: getServiceFee(),
        total: getTotal(),
        deliveryAddress: {
          street,
          city,
          instructions,
        },
      };

      const { orderId, initPoint } = await DeliveryBookingService.createOrderWithPayment(order);

      // Guardar order ID
      localStorage.setItem('pending_delivery_order', orderId);

      // Limpiar carrito
      clearCart();

      // Redirigir a Mercado Pago
      window.location.href = initPoint;
    } catch (err) {
      console.error('Error creating order:', err);
      setError('Error al procesar el pedido. Por favor intenta nuevamente.');
      setLoading(false);
    }
  };

  if (!user || items.length === 0) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al carrito
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar pedido</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Información de contacto</h2>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    formErrors.customerName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Juan Pérez"
                />
                {formErrors.customerName && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.customerName}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      formErrors.customerEmail ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="juan@ejemplo.com"
                  />
                  {formErrors.customerEmail && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.customerEmail}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      formErrors.customerPhone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+56912345678"
                  />
                  {formErrors.customerPhone && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.customerPhone}</p>
                  )}
                </div>
              </div>

              <hr />

              <h2 className="text-xl font-bold text-gray-900">Dirección de entrega</h2>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Calle y número *
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    formErrors.street ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Calle Principal 123"
                />
                {formErrors.street && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.street}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Ciudad *
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Instrucciones de entrega (opcional)
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Ej: Casa blanca, segundo piso"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Ir a pagar'
                )}
              </button>
            </form>
          </div>

          {/* Resumen */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Resumen</h2>

              <div className="space-y-2 mb-4 pb-4 border-b border-gray-200 max-h-60 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium text-gray-900">
                      ${(item.price * item.quantity).toLocaleString('es-CL')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${getCartSubtotal().toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span>${getDeliveryFee().toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Comisión</span>
                  <span>${getServiceFee().toLocaleString('es-CL')}</span>
                </div>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-orange-600">
                  ${getTotal().toLocaleString('es-CL')}
                </span>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2 text-sm">
                {customerEmail && (
                  <div className="flex gap-2 items-start">
                    <Mail className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-600">Email</p>
                      <p className="text-gray-900 font-medium">{customerEmail}</p>
                    </div>
                  </div>
                )}
                {customerPhone && (
                  <div className="flex gap-2 items-start">
                    <Phone className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-600">Teléfono</p>
                      <p className="text-gray-900 font-medium">{customerPhone}</p>
                    </div>
                  </div>
                )}
                {street && (
                  <div className="flex gap-2 items-start">
                    <MapPin className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-600">Dirección</p>
                      <p className="text-gray-900 font-medium">{street}, {city}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
