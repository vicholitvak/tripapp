'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Star, ThumbsUp, AlertCircle } from 'lucide-react';
import ProviderLayout from '@/components/provider/ProviderLayout';
import { ModernCard as Card } from '@/components/ui/modern-card';
import { Review } from '@/types/marketplace';
import { ReviewService } from '@/lib/services/reviewService';
import { ProviderService } from '@/lib/services/providerService';

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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: number]: number };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'helpful'>('recent');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin');
    }
  }, [user, authLoading, router]);

  // Load reviews
  useEffect(() => {
    async function loadReviews() {
      if (!user) return;

      try {
        setLoading(true);

        // Get provider ID
        const provider = await ProviderService.getByUserId(user.uid);
        if (!provider?.id) {
          console.error('Provider not found');
          return;
        }

        // Get provider reviews
        const providerReviews = await ReviewService.getProviderReviews(provider.id);
        setReviews(providerReviews);

        // Get stats
        const providerStats = await ReviewService.getProviderStats(provider.id);
        setStats(providerStats);
      } catch (error) {
        console.error('Error loading reviews:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user && !authLoading) {
      loadReviews();
    }
  }, [user, authLoading]);

  const avgRating = stats?.averageRating.toFixed(1) || '0.0';
  const ratingDistribution = stats?.ratingDistribution || {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'helpful':
        return b.helpful - a.helpful;
      case 'recent':
      default:
        const dateA = a.createdAt instanceof Date ? a.createdAt : a.createdAt.toDate();
        const dateB = b.createdAt instanceof Date ? b.createdAt : b.createdAt.toDate();
        return dateB.getTime() - dateA.getTime();
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
            {sortedReviews.map((review) => {
              const displayDate = review.createdAt instanceof Date
                ? review.createdAt
                : review.createdAt.toDate();

              return (
                <Card key={review.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Cliente #{review.customerId.slice(0, 8)}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {displayDate.toLocaleDateString('es-CL', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>

                  <p className="text-gray-700 mb-4">{review.comment}</p>

                  {review.photos && review.photos.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {review.photos.map((photo, idx) => (
                        <img
                          key={idx}
                          src={photo}
                          alt={`Review photo ${idx + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                      <ThumbsUp className="w-4 h-4" />
                      Útil ({review.helpful})
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      Orden: #{review.orderId.slice(0, 8)}
                    </span>
                  </div>
                </Card>
              );
            })}
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
