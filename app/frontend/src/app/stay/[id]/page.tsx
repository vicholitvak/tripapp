'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Star,
  Users,
  Bed,
  Bath,
  Wifi,
  UtensilsCrossed,
  Car,
  Shield,
  Calendar,
  Check,
  X,
  ArrowLeft,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Stay } from '@/types/stay';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StayDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [stay, setStay] = useState<Stay | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSpace, setSelectedSpace] = useState(0);

  useEffect(() => {
    loadStay();
  }, [resolvedParams.id]);

  const loadStay = async () => {
    try {
      setLoading(true);
      const stayDoc = await getDoc(doc(db, 'stays', resolvedParams.id));

      if (stayDoc.exists()) {
        setStay({ id: stayDoc.id, ...stayDoc.data() } as Stay);
      } else {
        console.error('Stay not found');
      }
    } catch (error) {
      console.error('Error loading stay:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando alojamiento...</p>
        </div>
      </div>
    );
  }

  if (!stay) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Alojamiento no encontrado</h1>
          <p className="text-gray-600 mb-4">El alojamiento que buscas no existe</p>
          <Link
            href="/stay"
            className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a alojamientos
          </Link>
        </div>
      </div>
    );
  }

  const currentImages = stay.isHybrid && stay.spaceTypes && stay.spaceTypes[selectedSpace]
    ? stay.spaceTypes[selectedSpace].photos || []
    : stay.photos;

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/" className="text-teal-600 hover:underline">Inicio</Link>
          <span>/</span>
          <Link href="/stay" className="text-teal-600 hover:underline">¿Dónde Quedarse?</Link>
          <span>/</span>
          <span className="text-gray-600">{stay.name}</span>
        </nav>
      </div>

      {/* Hero Image Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden mb-8">
          <div className="relative h-96 md:h-[500px]">
            <img
              src={currentImages[selectedImage] || '/placeholder-stay.jpg'}
              alt={stay.name}
              className="w-full h-full object-cover"
            />
            {currentImages.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage(prev => prev === 0 ? currentImages.length - 1 : prev - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setSelectedImage(prev => prev === currentImages.length - 1 ? 0 : prev + 1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {currentImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === selectedImage ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{stay.name}</h1>
                  <div className="flex items-center gap-4 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      <span className="font-semibold">{stay.rating?.toFixed(1) || 'Nuevo'}</span>
                      {stay.reviewCount && stay.reviewCount > 0 && (
                        <span className="text-sm">({stay.reviewCount} reviews)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{stay.address}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">{stay.description}</p>
            </div>

            {/* Space Types - For Hybrid Stays */}
            {stay.isHybrid && stay.spaceTypes && stay.spaceTypes.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Tipos de Espacios</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stay.spaceTypes.map((space, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedSpace(idx);
                        setSelectedImage(0);
                      }}
                      className={`text-left p-6 rounded-xl border-2 transition-all ${
                        selectedSpace === idx
                          ? 'border-teal-600 bg-teal-50'
                          : 'border-gray-200 hover:border-teal-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-gray-900">{space.name}</h3>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-teal-600">
                            ${space.pricing.basePrice.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">por noche</div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{space.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <Users className="w-4 h-4" />
                          <span>{space.capacity.maxGuests} personas</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <Bed className="w-4 h-4" />
                          <span>{space.capacity.beds} cama(s)</span>
                        </div>
                        {space.capacity.bathrooms > 0 && (
                          <div className="flex items-center gap-1 text-sm text-gray-700">
                            <Bath className="w-4 h-4" />
                            <span>{space.capacity.bathrooms} baño(s)</span>
                          </div>
                        )}
                      </div>
                      {space.amenities && space.amenities.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {space.amenities.slice(0, 3).map((amenity, i) => (
                            <span key={i} className="inline-flex items-center gap-1 text-xs bg-white px-2 py-1 rounded-full border border-gray-200">
                              <Check className="w-3 h-3 text-teal-600" />
                              {amenity}
                            </span>
                          ))}
                          {space.amenities.length > 3 && (
                            <span className="text-xs text-gray-500">+{space.amenities.length - 3} más</span>
                          )}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {stay.amenities && stay.amenities.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Amenidades</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {stay.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-teal-600 flex-shrink-0" />
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rules */}
            {stay.rules && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Reglas de la Casa</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="font-semibold text-gray-900">Check-in</div>
                        <div className="text-sm text-gray-600">{stay.rules.checkIn}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="font-semibold text-gray-900">Check-out</div>
                        <div className="text-sm text-gray-600">{stay.rules.checkOut}</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {stay.rules.smoking !== undefined && (
                      <div className="flex items-center gap-2">
                        {stay.rules.smoking ? <Check className="w-5 h-5 text-teal-600" /> : <X className="w-5 h-5 text-red-500" />}
                        <span className="text-gray-700">Fumar</span>
                      </div>
                    )}
                    {stay.rules.pets !== undefined && (
                      <div className="flex items-center gap-2">
                        {stay.rules.pets ? <Check className="w-5 h-5 text-teal-600" /> : <X className="w-5 h-5 text-red-500" />}
                        <span className="text-gray-700">Mascotas</span>
                      </div>
                    )}
                    {stay.rules.parties !== undefined && (
                      <div className="flex items-center gap-2">
                        {stay.rules.parties ? <Check className="w-5 h-5 text-teal-600" /> : <X className="w-5 h-5 text-red-500" />}
                        <span className="text-gray-700">Fiestas</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Highlights */}
            {stay.highlights && stay.highlights.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Lo Mejor del Lugar</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {stay.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-teal-50 p-4 rounded-lg">
                      <Star className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
              <div className="mb-6">
                {stay.isHybrid && stay.spaceTypes && stay.spaceTypes[selectedSpace] ? (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Desde</div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      ${stay.spaceTypes[selectedSpace].pricing.basePrice.toLocaleString()}
                      <span className="text-base font-normal text-gray-600"> CLP</span>
                    </div>
                    <div className="text-sm text-gray-600">por noche</div>
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-gray-900">Consultar disponibilidad</div>
                )}
              </div>

              <Link
                href={`https://wa.me/${stay.hostInfo?.name ? '56' : '56935134669'}?text=Hola! Estoy interesado en ${stay.name}`}
                target="_blank"
                className="block w-full bg-teal-600 text-white text-center py-4 rounded-xl font-semibold hover:bg-teal-700 transition-colors mb-4"
              >
                Consultar por WhatsApp
              </Link>

              <div className="text-center text-sm text-gray-600 mb-6">
                No se realizará ningún cargo todavía
              </div>

              <div className="border-t border-gray-200 pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-teal-600" />
                  <div>
                    <div className="font-semibold text-gray-900">Reserva Segura</div>
                    <div className="text-sm text-gray-600">Contacto directo con el proveedor</div>
                  </div>
                </div>
                {stay.hostInfo && (
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-teal-600" />
                    <div>
                      <div className="font-semibold text-gray-900">{stay.hostInfo.name}</div>
                      <div className="text-sm text-gray-600">{stay.hostInfo.responseTime}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/stay"
          className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a alojamientos
        </Link>
      </div>
    </div>
  );
}
