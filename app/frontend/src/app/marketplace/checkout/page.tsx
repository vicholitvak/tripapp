'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UnifiedCartService } from '@/lib/services/unifiedCartService';
import { PaymentService } from '@/lib/services/paymentService';
import { OrderService } from '@/lib/services/orderService';
import { UnifiedCart, PaymentInfo } from '@/types/marketplace';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowLeft,
  Loader,
  AlertCircle,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';

type CheckoutStep = 'shipping' | 'payment' | 'confirm';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [cart, setCart] = useState<UnifiedCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [processingPayment, setProcessingPayment] = useState(false);

  // Datos de usuario
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');

  // Datos de envío (para productos)
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Errores de formulario
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    loadCart();
    loadUserProfile();
  }, [user, router]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const cart = UnifiedCartService.getCart(user!.uid);
      if (!cart.items.length) {
        router.push('/marketplace/cart');
        return;
      }
      setCart(cart);
    } catch (error) {
      console.error('Error loading cart:', error);
      setError('Error al cargar el carrito');
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      // Aquí se cargaría el perfil del usuario si existe
      // Por ahora dejamos los campos vacíos para llenarlos
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const validateShippingForm = () => {
    const errors: Record<string, string> = {};

    if (!displayName.trim()) {
      errors.displayName = 'El nombre es requerido';
    }
    if (!email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!email.includes('@')) {
      errors.email = 'Email inválido';
    }
    if (!phone.trim()) {
      errors.phone = 'El teléfono es requerido';
    }

    // Validar dirección solo si hay productos (no servicios)
    const hasProducts = cart?.items.some(item => item.baseType === 'marketplace');
    if (hasProducts) {
      if (!address.trim()) {
        errors.address = 'La dirección es requerida';
      }
      if (!city.trim()) {
        errors.city = 'La ciudad es requerida';
      }
      if (!postalCode.trim()) {
        errors.postalCode = 'El código postal es requerido';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinueToPayment = () => {
    if (validateShippingForm()) {
      setStep('payment');
    }
  };

  const handlePayment = async () => {
    if (!cart || !user) return;

    setProcessingPayment(true);
    setError(null);

    try {
      // Crear información de pago
      const paymentInfo: PaymentInfo = {
        method: 'mercadopago',
        total: cart.total,
        currency: 'CLP',
        status: 'pending',
      };

      // Crear orden
      const order = await OrderService.createOrderFromCart(
        cart,
        user.uid,
        email,
        paymentInfo,
        address
          ? {
              address,
              city,
              postalCode,
              phone,
              status: 'pending',
            }
          : undefined
      );

      // Crear preferencia de Mercado Pago
      const { preferenceId, initPoint } =
        await PaymentService.createMercadoPagoPreference(
          order.id!,
          cart,
          displayName,
          email,
          typeof window !== 'undefined' ? window.location.origin : ''
        );

      // Guardar orden ID en sesión/localStorage para después del pago
      localStorage.setItem('pending_order_id', order.id!);
      localStorage.setItem('pending_preference_id', preferenceId);

      // Redirigir a Mercado Pago
      if (initPoint) {
        window.location.href = initPoint;
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setError(
        error instanceof Error ? error.message : 'Error al procesar el pago'
      );
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando checkout...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Carrito vacío</h1>
          <p className="text-gray-600 mb-6">El carrito está vacío</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/marketplace/cart')}
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al carrito
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Finalizar compra</h1>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de checkout */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pasos */}
            <div className="flex gap-4 mb-8">
              {(['shipping', 'payment', 'confirm'] as CheckoutStep[]).map(
                (checkoutStep) => (
                  <div key={checkoutStep} className="flex items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        checkoutStep === step
                          ? 'bg-orange-600 text-white'
                          : step === 'payment' && checkoutStep === 'shipping'
                          ? 'bg-green-500 text-white'
                          : step === 'confirm' && checkoutStep !== 'confirm'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {step === 'payment' && checkoutStep === 'shipping' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : step === 'confirm' && checkoutStep !== 'confirm' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        ({
                          shipping: 1,
                          payment: 2,
                          confirm: 3,
                        }[checkoutStep])
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      {
                        {
                          shipping: 'Datos',
                          payment: 'Pago',
                          confirm: 'Confirmar',
                        }[checkoutStep]
                      }
                    </span>
                    {checkoutStep !== 'confirm' && (
                      <div className="w-4 h-0.5 bg-gray-300 mx-2" />
                    )}
                  </div>
                )
              )}
            </div>

            {/* Contenido del paso */}
            {step === 'shipping' && (
              <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Información de contacto
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        formErrors.displayName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Juan Pérez"
                    />
                    {formErrors.displayName && (
                      <p className="text-red-600 text-sm mt-1">
                        {formErrors.displayName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        formErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="juan@ejemplo.com"
                    />
                    {formErrors.email && (
                      <p className="text-red-600 text-sm mt-1">
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        formErrors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+56912345678"
                    />
                    {formErrors.phone && (
                      <p className="text-red-600 text-sm mt-1">
                        {formErrors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Mostrar formulario de dirección solo si hay productos */}
                {cart.items.some(item => item.baseType === 'marketplace') && (
                  <>
                    <hr />
                    <h2 className="text-xl font-bold text-gray-900">
                      Dirección de envío
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Dirección *
                        </label>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                            formErrors.address ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Calle Principal 123, Apto 4"
                        />
                        {formErrors.address && (
                          <p className="text-red-600 text-sm mt-1">
                            {formErrors.address}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Ciudad *
                          </label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                              formErrors.city ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="San Pedro de Atacama"
                          />
                          {formErrors.city && (
                            <p className="text-red-600 text-sm mt-1">
                              {formErrors.city}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Código Postal *
                          </label>
                          <input
                            type="text"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                              formErrors.postalCode
                                ? 'border-red-500'
                                : 'border-gray-300'
                            }`}
                            placeholder="1420000"
                          />
                          {formErrors.postalCode && (
                            <p className="text-red-600 text-sm mt-1">
                              {formErrors.postalCode}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <button
                  onClick={handleContinueToPayment}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold"
                >
                  Continuar a pago
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Método de pago
                </h2>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-900">
                    <strong>Mercado Pago</strong> es nuestro método de pago seguro
                    y confiable. Serás redirigido a Mercado Pago para completar
                    el pago.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Métodos aceptados en Mercado Pago:</strong>
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>✓ Tarjetas de crédito</li>
                    <li>✓ Tarjetas de débito</li>
                    <li>✓ Transferencia bancaria</li>
                    <li>✓ Efectivo (servicio 24 horas)</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('shipping')}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Atrás
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={processingPayment}
                    className="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {processingPayment ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      'Ir a Mercado Pago'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Resumen del pedido
              </h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 max-h-60 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.listingId} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.listingName} × {item.quantity}
                    </span>
                    <span className="font-medium text-gray-900">
                      ${(item.price * item.quantity).toLocaleString('es-CL')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>${cart.subtotal.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Comisión:</span>
                  <span>${cart.commission.toLocaleString('es-CL')}</span>
                </div>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-orange-600">
                  ${cart.total.toLocaleString('es-CL')}
                </span>
              </div>

              {/* Datos de contacto */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 text-sm">
                <div className="flex gap-2 items-start">
                  <Mail className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="text-gray-900 font-medium">{email || '—'}</p>
                  </div>
                </div>
                <div className="flex gap-2 items-start">
                  <Phone className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-600">Teléfono</p>
                    <p className="text-gray-900 font-medium">{phone || '—'}</p>
                  </div>
                </div>
                {address && (
                  <div className="flex gap-2 items-start">
                    <MapPin className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-600">Dirección</p>
                      <p className="text-gray-900 font-medium">
                        {address}, {city}
                      </p>
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
