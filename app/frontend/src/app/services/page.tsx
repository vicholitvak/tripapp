'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ModernCard } from '../../components/ui/modern-card';
import {
  Car,
  Bike,
  Plane,
  Phone,
  MapPin,
  Star,
  Users,
  Shield
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  provider: string;
  category: 'taxi' | 'bike' | 'transfer';
  price: number;
  description: string;
  features: string[];
  rating: number;
  phone: string;
  location: string;
  image: string;
  available24h?: boolean;
}

const servicesData: Service[] = [
  // Taxis locales
  {
    id: '1',
    name: 'Taxi Radio Taxi San Pedro',
    provider: 'Radio Taxi San Pedro',
    category: 'taxi',
    price: 5000,
    description: 'Servicio de taxi confiable para moverte dentro de San Pedro y alrededores.',
    features: ['Disponible 24/7', 'Conductores locales', 'Vehículos seguros', 'Tarifas fijas'],
    rating: 4.6,
    phone: '+56 9 8765 4321',
    location: 'Centro de San Pedro',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250&fit=crop',
    available24h: true
  },
  {
    id: '2',
    name: 'Taxi Ecológico Atacama',
    provider: 'Taxi Ecológico',
    category: 'taxi',
    price: 6000,
    description: 'Taxis eléctricos para un transporte sostenible dentro del pueblo.',
    features: ['Vehículos eléctricos', 'Tarifa plana', 'Conductores certificados', 'GPS integrado'],
    rating: 4.8,
    phone: '+56 9 8123 4567',
    location: 'Centro y alrededores',
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=250&fit=crop'
  },
  {
    id: '3',
    name: 'Taxi Nocturno Seguro',
    provider: 'Taxi Seguro SPA',
    category: 'taxi',
    price: 7000,
    description: 'Servicio especializado de taxi nocturno con mayor seguridad.',
    features: ['Servicio nocturno', 'GPS tracking', 'Botón de pánico', 'Conductores verificados'],
    rating: 4.9,
    phone: '+56 9 8987 6543',
    location: 'Todo San Pedro',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=250&fit=crop',
    available24h: true
  },

  // Alquiler de bicicletas
  {
    id: '4',
    name: 'Bicicletas El Desierto',
    provider: 'El Desierto Bike Rental',
    category: 'bike',
    price: 8000,
    description: 'Bicicletas de calidad para explorar San Pedro y sus alrededores.',
    features: ['Bicicletas nuevas', 'Cascos incluidos', 'GPS opcional', 'Mantenimiento diario'],
    rating: 4.7,
    phone: '+56 9 8234 5678',
    location: 'Calle Caracoles 145',
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&h=250&fit=crop'
  },
  {
    id: '5',
    name: 'Bike Tour San Pedro',
    provider: 'Bike Tour SPA',
    category: 'bike',
    price: 12000,
    description: 'Alquiler de bicicletas premium con tours guiados incluidos.',
    features: ['Bicicletas de montaña', 'Guía incluido', 'Equipo de seguridad', 'Rutas personalizadas'],
    rating: 4.9,
    phone: '+56 9 8567 2341',
    location: 'Av. Gustavo Le Paige 123',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop'
  },
  {
    id: '6',
    name: 'Eco Bikes Atacama',
    provider: 'Eco Bikes',
    category: 'bike',
    price: 6000,
    description: 'Bicicletas ecológicas para un turismo sostenible.',
    features: ['Bicicletas híbridas', 'Precio económico', 'Entrega a domicilio', 'Reparaciones gratis'],
    rating: 4.4,
    phone: '+56 9 8678 3456',
    location: 'Barrio Los Pintores',
    image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=400&h=250&fit=crop'
  },

  // Transfers al aeropuerto
  {
    id: '7',
    name: 'Transfer Aeropuerto Altiplánico',
    provider: 'Altiplánico Transfers',
    category: 'transfer',
    price: 25000,
    description: 'Servicio de transfer desde/hacia el Aeropuerto de Calama.',
    features: ['Vehículos ejecutivos', 'Servicio puerta a puerta', 'WiFi gratuito', 'Agua mineral'],
    rating: 4.8,
    phone: '+56 9 8345 6789',
    location: 'Aeropuerto Calama ↔ San Pedro',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=250&fit=crop'
  },
  {
    id: '8',
    name: 'TransVIP Ejecutivo',
    provider: 'TransVIP',
    category: 'transfer',
    price: 35000,
    description: 'Transfer VIP con chofer profesional y vehículo de lujo.',
    features: ['Servicio ejecutivo', 'Vehículos premium', 'Chofer bilingüe', 'Servicio personalizado'],
    rating: 5.0,
    phone: '+56 9 8123 7890',
    location: 'Aeropuerto Calama ↔ San Pedro',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop'
  },
  {
    id: '9',
    name: 'Transfer Compartido Calama',
    provider: 'Transfer Compartido SPA',
    category: 'transfer',
    price: 15000,
    description: 'Opción económica de transfer compartido al aeropuerto.',
    features: ['Precio compartido', 'Horarios fijos', 'Servicio confiable', 'Recogida en hotel'],
    rating: 4.5,
    phone: '+56 9 8456 1234',
    location: 'Aeropuerto Calama ↔ San Pedro',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=250&fit=crop'
  }
];

const categoryIcons = {
  taxi: Car,
  bike: Bike,
  transfer: Plane
};

export default function Services() {
  const [selectedCategory, setSelectedCategory] = useState<'taxi' | 'bike' | 'transfer' | 'all'>('all');
  const router = useRouter();

  const filteredServices = selectedCategory === 'all'
    ? servicesData
    : servicesData.filter(service => service.category === selectedCategory);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
      {/* Modern Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="text-2xl font-bold text-atacama-orange cursor-pointer" onClick={() => router.push('/')}>
              Santurist
            </div>

            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-atacama-orange font-medium transition-colors">Inicio</Link>
              <Link href="/tours" className="text-gray-700 hover:text-atacama-orange font-medium transition-colors">¿Qué Hacer?</Link>
              <Link href="/eat" className="text-gray-700 hover:text-atacama-orange font-medium transition-colors">¿Qué Comer?</Link>
              <Link href="/services" className="text-atacama-orange font-bold transition-colors">Servicios</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <button className="bg-atacama-orange text-white px-6 py-2 rounded-full hover:bg-atacama-orange/90 transition-colors font-medium">
                Iniciar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-20">
        {/* Hero Section */}
        <motion.section
          className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-cyan-50 overflow-hidden"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          initial="hidden"
          animate="visible"
        >
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                🏙️ Servicios en San Pedro
              </h1>
              <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
                Todo lo que necesitas para moverte cómodamente por San Pedro de Atacama. Desde taxis locales hasta transfers al aeropuerto.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Services Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"
            >
              🚗 Servicios Disponibles
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto"
            >
              Encuentra el servicio perfecto para tu estadía en San Pedro. Todos nuestros proveedores son locales y certificados.
            </motion.p>

            {/* Category Filter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-wrap justify-center gap-4 mb-12"
            >
              {[
                { key: 'all', label: 'Todos los Servicios', icon: Users },
                { key: 'taxi', label: 'Taxis Locales', icon: Car },
                { key: 'bike', label: 'Bicicletas', icon: Bike },
                { key: 'transfer', label: 'Transfers', icon: Plane }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key as 'taxi' | 'bike' | 'transfer' | 'all')}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center space-x-2 ${
                    selectedCategory === key
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </button>
              ))}
            </motion.div>

            {/* Services Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredServices.map((service, index) => {
                const CategoryIcon = categoryIcons[service.category];

                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <ModernCard variant="elevated" className="overflow-hidden hover-lift group h-full">
                      {/* Service Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={service.image}
                          alt={service.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {/* Category Badge */}
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                          <CategoryIcon className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-medium text-gray-700 capitalize">
                            {service.category}
                          </span>
                        </div>
                        {/* 24h Badge */}
                        {service.available24h && (
                          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            24/7
                          </div>
                        )}
                      </div>

                      {/* Service Info */}
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {service.name}
                          </h3>
                          <p className="text-sm text-blue-600 font-medium mb-2">{service.provider}</p>
                          <p className="text-gray-600 text-sm mb-3">{service.description}</p>

                          {/* Rating */}
                          <div className="flex items-center space-x-1 mb-3">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium text-gray-700">{service.rating}</span>
                          </div>

                          {/* Features */}
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-1">
                              {service.features.slice(0, 2).map((feature, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                                >
                                  {feature}
                                </span>
                              ))}
                              {service.features.length > 2 && (
                                <span className="text-xs text-gray-500">
                                  +{service.features.length - 2} más
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Location & Phone */}
                          <div className="space-y-1 text-sm text-gray-600 mb-4">
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{service.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Phone className="w-4 h-4" />
                              <span>{service.phone}</span>
                            </div>
                          </div>
                        </div>

                        {/* Price and Action */}
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl font-bold text-blue-600">
                              {formatPrice(service.price)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {service.category === 'transfer' ? 'por persona' :
                               service.category === 'bike' ? 'por día' : 'por viaje'}
                            </span>
                          </div>
                          <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 font-medium transform hover:scale-105">
                            📞 Contactar Ahora
                          </button>
                        </div>
                      </div>
                    </ModernCard>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
              className="text-center mt-16"
            >
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8 max-w-lg mx-auto shadow-lg">
                <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ¿Necesitas otro servicio?
                </h3>
                <p className="text-gray-600 mb-6 text-sm">
                  Si no encuentras lo que buscas, podemos ayudarte a coordinar cualquier servicio adicional en San Pedro.
                </p>
                <button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-full hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 font-medium">
                  Solicitar Servicio Personalizado
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Santurist
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Tu compañero perfecto para explorar San Pedro de Atacama con experiencias inolvidables.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">¿Qué Hacer?</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/tours" className="hover:text-blue-400 transition-colors">Tours Guiados</Link></li>
                <li><Link href="/eat" className="hover:text-blue-400 transition-colors">¿Qué Comer?</Link></li>
                <li><Link href="/services" className="hover:text-blue-400 transition-colors">Servicios</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Servicios</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#taxi" className="hover:text-blue-400 transition-colors">Taxis Locales</a></li>
                <li><a href="#bike" className="hover:text-blue-400 transition-colors">Alquiler Bicicletas</a></li>
                <li><a href="#transfer" className="hover:text-blue-400 transition-colors">Transfers Aeropuerto</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Contacto</h4>
              <div className="space-y-2 text-gray-300">
                <p className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  San Pedro de Atacama, Chile
                </p>
                <p>info@santurist.cl</p>
                <p>+56 9 1234 5678</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-300">
            <p>&copy; 2025 Santurist. Todos los derechos reservados. Hecho con ❤️ en el desierto.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
