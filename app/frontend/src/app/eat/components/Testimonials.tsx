'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ModernCard } from '../../../components/ui/modern-card';
import { Star, Quote, MapPin, Heart } from 'lucide-react';

interface Testimonial {
  id: number;
  quote: string;
  name: string;
  role: string;
  location: string;
  rating: number;
  image: string;
  dish?: string;
}

const testimonialsData: Testimonial[] = [
  {
    id: 1,
    quote: "La llama guisada del Restaurante El Ayllu fue increíble. Nunca había probado carne tan tierna y con tanto sabor. ¡El desierto sabe cocinar!",
    name: 'Ana García',
    role: 'Turista Española',
    location: 'Madrid, España',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    dish: 'Llama Guisada'
  },
  {
    id: 2,
    quote: "Como cocinera local, amo poder compartir mis recetas tradicionales con visitantes de todo el mundo. La quinoa del desierto es mi especialidad.",
    name: 'María José Mamani',
    role: 'Cocinera Local',
    location: 'San Pedro de Atacama',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    dish: 'Quinoa del Desierto'
  },
  {
    id: 3,
    quote: "Las empanadas chilenas del Café Honradez nos transportaron directo a la Patagonia. ¡Mejor delivery que he tenido en todo Chile!",
    name: 'Carlos Rodríguez',
    role: 'Turista Chileno',
    location: 'Santiago, Chile',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    dish: 'Empanadas Chilenas'
  },
  {
    id: 4,
    quote: "La trucha del altiplano superó todas mis expectativas. Fresca, perfectamente cocinada y con un sabor único del desierto. ¡Recomendadísimo!",
    name: 'Sarah Johnson',
    role: 'Turista Estadounidense',
    location: 'Nueva York, USA',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    dish: 'Trucha del Altiplano'
  },
  {
    id: 5,
    quote: "Cada plato cuenta una historia del Atacama. El charquicán de Doña Rosa me hizo sentir como en casa, a miles de kilómetros de la mía.",
    name: 'Lucas Ferreira',
    role: 'Turista Brasileño',
    location: 'São Paulo, Brasil',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    dish: 'Charquicán del Desierto'
  },
  {
    id: 6,
    quote: "¡La mejor experiencia culinaria del desierto! Los sabores auténticos y la atención personalizada hacen que cada comida sea memorable.",
    name: 'Isabella Rossi',
    role: 'Turista Italiana',
    location: 'Roma, Italia',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face',
    dish: 'Cazuela Atacameña'
  }
];

const TestimonialCard = ({ testimonial, index }: { testimonial: Testimonial; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="h-full"
    >
      <ModernCard variant="glass" className="p-6 h-full hover-lift group">
        {/* Quote Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full p-3">
            <Quote className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Rating */}
        <div className="flex justify-center mb-4">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
          ))}
        </div>

        {/* Quote */}
        <blockquote className="text-gray-700 text-center mb-6 leading-relaxed italic">
          &ldquo;{testimonial.quote}&rdquo;
        </blockquote>

        {/* Dish Tag */}
        {testimonial.dish && (
          <div className="flex justify-center mb-4">
            <span className="bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full">
              🍽️ {testimonial.dish}
            </span>
          </div>
        )}

        {/* Author Info */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <img
              src={testimonial.image}
              alt={testimonial.name}
              className="w-full h-full object-cover"
            />
          </div>

          <h4 className="font-semibold text-gray-900 mb-1">
            {testimonial.name}
          </h4>

          <p className="text-sm text-orange-600 font-medium mb-2">
            {testimonial.role}
          </p>

          <div className="flex items-center justify-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-1" />
            {testimonial.location}
          </div>
        </div>
      </ModernCard>
    </motion.div>
  );
};

const Testimonials = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const testimonialsPerPage = 3;
  const totalPages = Math.ceil(testimonialsData.length / testimonialsPerPage);

  const currentTestimonials = testimonialsData.slice(
    currentPage * testimonialsPerPage,
    (currentPage + 1) * testimonialsPerPage
  );

  return (
    <section className="py-20 bg-gradient-to-r from-gray-50 to-orange-50/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            💬 ¿Qué Dice la Gente?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experiencias reales de nuestros clientes y cocineros en San Pedro de Atacama
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {currentTestimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true }}
            className="flex justify-center space-x-2"
          >
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentPage === i
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Ir a la página ${i + 1}`}
              />
            ))}
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 max-w-lg mx-auto shadow-lg">
            <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¿Quieres Compartir tu Experiencia?
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Tu opinión nos ayuda a mejorar y a otros viajeros a elegir los mejores platos de San Pedro.
            </p>
            <button className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-full hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-medium">
              Dejar un Comentario
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
