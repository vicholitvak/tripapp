'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ModernCard } from '../../components/ui/modern-card';
import { Star, Clock, Calendar, MapPin, Users, Camera, Mountain, Waves } from 'lucide-react';

interface Tour {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  image: string;
  duration: string;
  date: string;
  time: string;
  capacity: number;
  rating: number;
  isPromotional?: boolean;
  isUpcoming?: boolean;
  difficulty: 'Fácil' | 'Medio' | 'Difícil';
  guide: string;
}

// Mock tour data - replace with API data later
const mockTours: Tour[] = [
  {
    id: '1',
    title: 'Tour Valle de la Luna',
    description: 'Explora las formaciones geológicas únicas del desierto de Atacama, incluyendo las Tres Marías y el Valle de la Muerte.',
    price: 45000,
    category: 'adventure',
    location: 'San Pedro de Atacama',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    duration: '4 horas',
    date: '2024-09-26',
    time: '09:00',
    capacity: 12,
    rating: 4.9,
    isUpcoming: true,
    difficulty: 'Medio',
    guide: 'María González'
  },
  {
    id: '2',
    title: 'Observación de Estrellas',
    description: 'Vive una experiencia única bajo el cielo más claro del mundo, con telescopios profesionales.',
    price: 35000,
    category: 'stargazing',
    location: 'ALMA Observatory',
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&h=300&fit=crop',
    duration: '3 horas',
    date: '2024-09-25',
    time: '16:00',
    capacity: 8,
    rating: 4.8,
    isPromotional: true,
    difficulty: 'Fácil',
    guide: 'Carlos Rodríguez'
  },
  {
    id: '3',
    title: 'Ascenso al Licancabur',
    description: 'Conquista el volcán más alto del desierto, con vistas panorámicas espectaculares.',
    price: 85000,
    category: 'hiking',
    location: 'Licancabur Volcano',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
    duration: '8 horas',
    date: '2025-01-20',
    time: '06:00',
    capacity: 6,
    rating: 5.0,
    difficulty: 'Difícil',
    guide: 'Pedro Silva'
  },
  {
    id: '4',
    title: 'Fotografía Nocturna',
    description: 'Captura la belleza del desierto bajo las estrellas con equipos profesionales.',
    price: 55000,
    category: 'photography',
    location: 'El Tatio Geysers',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    duration: '5 horas',
    date: '2025-01-18',
    time: '22:00',
    capacity: 10,
    rating: 4.7,
    isPromotional: true,
    difficulty: 'Medio',
    guide: 'Ana María'
  },
  {
    id: '5',
    title: 'Bicicleta por el Desierto',
    description: 'Recorre los paisajes únicos del Atacama en bicicleta, con paradas en oasis naturales.',
    price: 32000,
    category: 'cycling',
    location: 'Ruta del Desierto',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
    duration: '6 horas',
    date: '2025-01-17',
    time: '09:00',
    capacity: 15,
    rating: 4.6,
    difficulty: 'Medio',
    guide: 'Juan Pérez'
  },
  {
    id: '6',
    title: 'Experiencia Cultural Aymara',
    description: 'Sumérgete en la cultura ancestral de los pueblos originarios del Atacama.',
    price: 28000,
    category: 'cultural',
    location: 'Pueblo Aymara',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    duration: '3 horas',
    date: '2025-01-19',
    time: '14:00',
    capacity: 20,
    rating: 4.9,
    isUpcoming: true,
    difficulty: 'Fácil',
    guide: 'Rosa Mamani'
  }
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Fácil': return 'bg-green-100 text-green-800';
    case 'Medio': return 'bg-yellow-100 text-yellow-800';
    case 'Difícil': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'adventure': return Mountain;
    case 'stargazing': return Star;
    case 'hiking': return Mountain;
    case 'photography': return Camera;
    case 'cycling': return Waves;
    case 'cultural': return Users;
    default: return Mountain;
  }
};

export default function Tours() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [, forceUpdate] = useState(0);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [userEmail, setUserEmail] = useState('');
  // Replace the auth lines
  // const { user } = useAuth(); // Get user from context

  // Mock user for payment testing (remove in production)
  const mockUser = { uid: 'mock-user-id', email: 'test@example.com' };
  const user = mockUser; // Use mock for now

  useEffect(() => {
    // if (user) {  // Comment out real logic
      setUserEmail(user.email || '');
    // }
  }, [user]);  // Keep dependency

  useEffect(() => {
    // For now, use mock data since backend is not configured
    // TODO: Enable API fetch when backend is properly configured
    console.log('Using mock tour data - backend not available');
    setTours(mockTours);
    setLoading(false);
  }, []);

  // Update component every minute to refresh countdown
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update countdown timers
      forceUpdate(prev => prev + 1);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  const isUpcoming = (date: string) => {
    const tourDate = new Date(date);
    const now = new Date();
    const diffTime = tourDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays > 0;
  };

  const getTimeUntilTour = (date: string, time: string) => {
    const tourDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    const diffMs = tourDateTime.getTime() - now.getTime();

    if (diffMs <= 0) {
      return { text: 'Tour ya comenzó', status: 'past', color: 'text-red-600' };
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      return {
        text: `Faltan ${diffDays} día${diffDays > 1 ? 's' : ''}`,
        status: 'future',
        color: 'text-blue-600'
      };
    } else if (diffHours > 0) {
      return {
        text: `Faltan ${diffHours} hora${diffHours > 1 ? 's' : ''}`,
        status: 'soon',
        color: 'text-orange-600'
      };
    } else if (diffMinutes > 0) {
      return {
        text: `Faltan ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`,
        status: 'very-soon',
        color: 'text-red-600'
      };
    } else {
      return {
        text: 'Comienza pronto',
        status: 'now',
        color: 'text-red-600'
      };
    }
  };

  // Booking function
  const handleBookTour = async () => {
    if (!selectedTour || !userEmail || !user.uid) return;  // Use user.uid

    const totalPrice = selectedTour.price * numberOfPeople;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/bookings/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          touristId: user.uid,  // mock uid
          touristEmail: userEmail,
          tourId: selectedTour.id,
          tourTitle: selectedTour.title,
          tourImage: selectedTour.image,
          description: selectedTour.description,
          date: selectedTour.date,
          numberOfPeople,
          totalPrice
        }),
      });

      if (!response.ok) throw new Error('Error creating payment');

      const data = await response.json();
      const { paymentUrl } = data;

      // Redirect to Mercado Pago
      window.location.href = paymentUrl;
    } catch (error) {
      console.error('Booking error:', error);
      alert('Error al procesar la reserva. Intenta de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
      {/* Modern Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-2xl font-bold text-atacama-orange cursor-pointer">
              Santurist
            </Link>

            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-atacama-orange font-medium transition-colors">Inicio</Link>
              <Link href="/tours" className="text-atacama-orange font-bold transition-colors">¿Qué Hacer?</Link>
              <Link href="/eat" className="text-gray-700 hover:text-atacama-orange font-medium transition-colors">¿Qué Comer?</Link>
              <Link href="/services" className="text-gray-700 hover:text-atacama-orange font-medium transition-colors">Servicios</Link>
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
          className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-white to-red-50 overflow-hidden"
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
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                🏜️ ¿Qué Hacer en San Pedro?
              </h1>
              <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
                Descubre experiencias inolvidables en el desierto de Atacama. Tours guiados, aventuras únicas y conexiones culturales que te harán vivir el corazón del desierto.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Tours Grid */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"
            >
              🌟 Experiencias Inolvidables
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto"
            >
              Vive experiencias inolvidables en el desierto de Atacama con guías expertos locales. Cada aventura está diseñada para conectarte profundamente con la magia del desierto.
            </motion.p>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <ModernCard key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                    <div className="p-6 space-y-3">
                      <div className="h-6 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </ModernCard>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {tours.map((tour, index) => {
                  const CategoryIcon = getCategoryIcon(tour.category);
                  const isTourUpcoming = isUpcoming(tour.date);

                  return (
                    <motion.div
                      key={tour.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <ModernCard variant="elevated" className="overflow-hidden hover-lift group">
                        {/* Smart Tags */}
                        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                          {tour.isPromotional && (
                            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                              🔥 OFERTA ESPECIAL
                            </div>
                          )}
                          {tour.isUpcoming && (
                            <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                              ⚡ PRÓXIMO
                            </div>
                          )}
                          {isTourUpcoming && !tour.isUpcoming && (
                            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                              🚀 SALE PRONTO
                            </div>
                          )}
                        </div>

                        {/* Difficulty Badge */}
                        <div className="absolute top-3 right-3 z-10">
                          <div className={`text-xs font-medium px-2 py-1 rounded-full ${getDifficultyColor(tour.difficulty)}`}>
                            {tour.difficulty}
                          </div>
                        </div>

                        {/* Tour Image */}
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={tour.image}
                            alt={tour.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          {/* Category Icon Overlay */}
                          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-full p-2">
                            <CategoryIcon className="w-5 h-5 text-orange-600" />
                          </div>
                        </div>

                        {/* Tour Info */}
                        <div className="p-6">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                            {tour.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {tour.description}
                          </p>

                          {/* Rating and Guide */}
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="font-medium">{tour.rating}</span>
                            </div>
                            <span>por {tour.guide}</span>
                          </div>

                          {/* Time Until Tour */}
                          <div className="mb-3">
                            {(() => {
                              const timeInfo = getTimeUntilTour(tour.date, tour.time);
                              return (
                                <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
                                  timeInfo.status === 'past' ? 'bg-red-100 text-red-800' :
                                  timeInfo.status === 'very-soon' ? 'bg-red-100 text-red-800' :
                                  timeInfo.status === 'soon' ? 'bg-orange-100 text-orange-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  <Clock className="w-3 h-3" />
                                  <span>{timeInfo.text}</span>
                                </div>
                              );
                            })()}
                          </div>

                          {/* Tour Details */}
                          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{tour.duration}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(tour.date).toLocaleDateString('es-CL')}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{tour.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>Máx {tour.capacity}</span>
                            </div>
                          </div>

                          {/* Price and Time */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4 text-orange-600" />
                              <span className="text-sm text-gray-600">{tour.time}</span>
                            </div>
                            <span className="text-2xl font-bold text-orange-600">
                              {formatPrice(tour.price)}
                            </span>
                          </div>

                          {/* Action Button */}
                          <button
                            onClick={() => {
                              setSelectedTour(tour);
                              setNumberOfPeople(1);
                              setShowModal(true);
                            }}
                            className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-4 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-medium transform hover:scale-105"
                          >
                            🎫 Reservar Tour
                          </button>
                        </div>
                      </ModernCard>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
              className="text-center mt-16"
            >
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8 max-w-lg mx-auto shadow-lg">
                <Mountain className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ¿No encuentras tu tour ideal?
                </h3>
                <p className="text-gray-600 mb-6 text-sm">
                  Contáctanos para crear una experiencia personalizada en el desierto de Atacama.
                </p>
                <button className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-full hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-medium">
                  Solicitar Tour Personalizado
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
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Santurist
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Tu compañero perfecto para explorar San Pedro de Atacama con experiencias inolvidables.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">¿Qué Hacer?</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/tours" className="hover:text-orange-400 transition-colors">Tours Guiados</Link></li>
                <li><Link href="/eat" className="hover:text-orange-400 transition-colors">¿Qué Comer?</Link></li>
                <li><Link href="/services" className="hover:text-orange-400 transition-colors">Servicios</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Categorías</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/tours?category=adventure" className="hover:text-orange-400 transition-colors">Aventura</Link></li>
                <li><Link href="/tours?category=cultural" className="hover:text-orange-400 transition-colors">Cultural</Link></li>
                <li><Link href="/tours?category=photography" className="hover:text-orange-400 transition-colors">Fotografía</Link></li>
                <li><Link href="/tours?category=stargazing" className="hover:text-orange-400 transition-colors">Estrellas</Link></li>
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold mb-4">Reservar {selectedTour?.title}</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de Personas</label>
                <input
                  type="number"
                  min="1"
                  max={selectedTour?.capacity || 20}
                  value={numberOfPeople}
                  onChange={(e) => setNumberOfPeople(parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="text-lg font-semibold text-orange-600">
                Total: {formatPrice((selectedTour?.price || 0) * numberOfPeople)}
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleBookTour}
                className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all"
                disabled={!userEmail}
              >
                Pagar con Mercado Pago
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
