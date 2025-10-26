'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Star, ThumbsUp, AlertCircle } from 'lucide-react';
import ProviderLayout from '@/components/provider/ProviderLayout';
import { ModernCard as Card } from '@/components/ui/modern-card';

interface Review {
  id: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  helpful: number;
  createdAt: Date | string;
}

const MOCK_REVIEWS: Review[] = [
  {
    id: 'REV-001',
    customerId: 'cust-123',
    customerName: 'Juan Pérez',
    rating: 5,
    comment:
      'Excelente clase de cocina. El instructor fue muy paciente y los ingredientes de muy buena calidad.',
    helpful: 12,
    createdAt: '2024-10-24',
  },
  {
    id: 'REV-002',
    customerId: 'cust-456',
    customerName: 'María García',
    rating: 5,
    comment: 'Increíble experiencia. Tour muy bien organizado y con mucha información interesante.',
    helpful: 8,
    createdAt: '2024-10-22',
  },
  {
    id: 'REV-003',
    customerId: 'cust-789',
    customerName: 'Carlos López',
    rating: 4,
    comment:
      'Muy buena comida. Solo una pequeña recomendación sería mejorar la presentación de los platos.',
    helpful: 5,
    createdAt: '2024-10-20',
  },
  {
    id: 'REV-004',
    customerId: 'cust-101',
    customerName: 'Ana Rodríguez',
    rating: 5,
    comment:
      'Perfecto para una cena corporativa. Profesional y delicioso. Volvería a contratar sin dudarlo.',
    helpful: 15,
    createdAt: '2024-10-18',
  },
];

function StarRating({ rating, size = 'default' }: { rating: number; size?: 'default' | 'large' }) {
  const sizeClass = size === 'large' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`${sizeClass} ${
            i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

export default function ProviderReviews() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'helpful'>('recent');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin');
    }
  }, [user, authLoading, router]);

  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
  const ratingDistribution = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'helpful':
        return b.helpful - a.helpful;
      case 'recent':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  if (authLoading || loading) {
    return (
      <ProviderLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando reseñas...</p>
          </div>
        </div>
      </ProviderLayout>
    );
  }

  return (
    <ProviderLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reseñas y Calificaciones</h1>
          <p className="text-gray-600 mt-2">Feedback de tus clientes después de cada servicio</p>
        </div>

        {/* Rating Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overall Rating */}
          <Card className="p-6 col-span-1">
            <div className="text-center">
              <p className="text-gray-600 font-medium mb-2">Calificación Promedio</p>
              <p className="text-6xl font-bold text-orange-600 mb-2">{avgRating}</p>
              <StarRating rating={Math.round(parseFloat(avgRating))} size="large" />
              <p className="text-gray-600 text-sm mt-3">{reviews.length} reseñas</p>
            </div>
          </Card>

          {/* Rating Distribution */}
          <Card className="p-6 col-span-2">
            <p className="text-gray-600 font-medium mb-4">Distribución de Calificaciones</p>
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-3 mb-3">
                <div className="flex gap-1">
                  {[...Array(rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                  {[...Array(5 - rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-gray-300" />
                  ))}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-yellow-400 h-full"
                    style={{
                      width: `${((ratingDistribution[rating as keyof typeof ratingDistribution] || 0) / reviews.length) * 100}%`,
                    }}
                  ></div>
                </div>
                <p className="text-gray-700 font-medium w-8 text-right">
                  {ratingDistribution[rating as keyof typeof ratingDistribution] || 0}
                </p>
              </div>
            ))}
          </Card>
        </div>

        {/* Sort Options */}
        <div className="flex gap-2">
          {[
            { id: 'recent', label: 'Más Reciente' },
            { id: 'rating', label: 'Mayor Calificación' },
            { id: 'helpful', label: 'Más Útiles' },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setSortBy(option.id as 'recent' | 'rating' | 'helpful')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                sortBy === option.id
                  ? 'bg-orange-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Reviews List */}
        {sortedReviews.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600 mb-4">Aún no tienes reseñas</p>
            <p className="text-gray-500 text-sm">Las reseñas aparecerán aquí cuando tus clientes califiquen tus servicios</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedReviews.map((review) => (
              <Card key={review.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{review.customerName}</h3>
                    <p className="text-gray-600 text-sm">
                      {new Date(review.createdAt).toLocaleDateString('es-CL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <StarRating rating={review.rating} />
                </div>

                <p className="text-gray-700 mb-4">{review.comment}</p>

                <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                  <button className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors text-sm font-medium">
                    <ThumbsUp className="w-4 h-4" />
                    Útil ({review.helpful})
                  </button>
                  <button className="text-gray-600 hover:text-red-600 transition-colors text-sm font-medium">
                    Reportar
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Tips for Better Reviews */}
        <Card className="p-6 bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Consejos para Mejorar Reseñas</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>✓ Mantén una comunicación clara y profesional con tus clientes</li>
                <li>✓ Entrega servicios de alta calidad que superen expectativas</li>
                <li>✓ Responde rápidamente a preguntas y solicitudes</li>
                <li>✓ Solicita retroalimentación después de cada servicio completado</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </ProviderLayout>
  );
}
