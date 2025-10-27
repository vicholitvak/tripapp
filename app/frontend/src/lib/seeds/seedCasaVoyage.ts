/**
 * Seed script para Casa Voyage Hostel
 *
 * Información Real:
 * - Nombre: Casa Voyage Hostel
 * - Ubicación: Lascar 368, San Pedro de Atacama
 * - Teléfono: +56957636043
 * - Email: info@casavoyagehostel.com
 * - Instagram: @casavoyagehostel
 * - Rating Booking.com: 9.0/10 (1,152 reviews)
 * - Tipo: Hostel híbrido con domos geodésicos
 *
 * Este proveedor será parte de la base de datos de leads para
 * eventualmente enviarles una invitación real.
 */

import {
  collection,
  addDoc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ProviderLead } from '@/types/provider';
import { Stay } from '@/types/stay';

const ADMIN_ID = 'admin-seed'; // ID temporal del admin que crea estos seeds

export async function seedCasaVoyage() {
  console.log('🏠 Seeding Casa Voyage Hostel...');

  try {
    // ========== 1. PROVIDER LEAD ==========
    console.log('Creating ProviderLead for Casa Voyage...');

    const leadData: Omit<ProviderLead, 'id'> = {
      // Tipo de proveedor
      type: 'lodging',
      category: 'Hostel & Glamping',

      // Información de contacto REAL
      contactInfo: {
        name: 'Casa Voyage',
        businessName: 'Casa Voyage Hostel',
        email: 'info@casavoyagehostel.com',
        phone: '+56957636043',
        whatsapp: '+56957636043',
        address: 'Lascar 368, San Pedro de Atacama',
      },

      // Servicios ofrecidos
      servicesOffered: [
        'Habitaciones compartidas (dormitorios)',
        'Habitaciones privadas',
        'Domos geodésicos ecológicos',
        'Cocina compartida',
        'Servicio de tours',
        'Alquiler de bicicletas',
      ],

      // Estado y seguimiento
      status: 'new',
      priority: 'high', // Alta prioridad - buen rating
      source: 'social_media', // Instagram @casavoyagehostel
      isActive: true,

      // Metadata
      createdBy: ADMIN_ID,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,

      // Notas (aquí podemos incluir info extra como instagram, website, rating)
      notes: 'Investigado el 2025-10-27. Negocio real con excelente rating (9.0/10 con 1,152 reviews en Booking.com). Modelo híbrido interesante: hostel tradicional + domos geodésicos. Instagram: @casavoyagehostel | Website: https://casavoyagehostel.com | Características: Piscina, jardín, arte, biblioteca, muro de escalada, mesa de pool, fogatas. Perfecto para invitar a la plataforma.',

      // Tags para búsqueda
      tags: ['hostel', 'glamping', 'domos', 'backpackers', 'art', 'eco-friendly', 'high-rating'],
    };

    const leadRef = await addDoc(collection(db, 'providerLeads'), leadData);
    console.log(`✅ ProviderLead created with ID: ${leadRef.id}`);

    // ========== 2. MOCK STAY ==========
    console.log('Creating Mock Stay for Casa Voyage...');

    const stayData: Omit<Stay, 'id'> = {
      providerId: `mock-${leadRef.id}`, // Link al lead

      // Básico
      name: 'Casa Voyage Hostel',
      type: 'hybrid', // Hostel + Domos
      description: 'Un oasis en medio del desierto de Atacama. Casa Voyage es un hostel diseñado por y para viajeros, donde el arte, la ecología, la cultura y la alegría se integran. Un lugar amigable que invita a quedarse, compartir y participar en diferentes actividades y talleres. Ofrecemos habitaciones compartidas temáticas, habitaciones privadas y domos geodésicos ecológicos.',
      shortDescription: 'Hostel vibrante con domos geodésicos, piscina, arte y espacios de encuentro',
      photos: [
        'https://casavoyagehostel.com/wp-content/uploads/2024/06/casa-voyage-hostel-atacama-1400x690.jpg', // Hostel exterior
        'https://casavoyagehostel.com/wp-content/uploads/2024/06/domos.casa_.voyage.hostel-1600x690.jpg', // Domos geodésicos
        'https://casavoyagehostel.com/wp-content/uploads/2024/06/hab-compartida-lascar-h1-1024x683.jpg', // Habitación compartida
        'https://casavoyagehostel.com/wp-content/uploads/2024/06/casa-voyage-hostel-atacama-chile-891x595.jpg', // Vista del hostel
        'https://casavoyagehostel.com/wp-content/uploads/2024/06/cvh13.jpg', // Instalaciones
        'https://casavoyagehostel.com/wp-content/uploads/2020/12/laguna-atacama-casa-voyage-1-1280x690.jpg', // Laguna cercana
      ],

      // Híbrido: Hostel + Domos
      isHybrid: true,
      spaceTypes: [
        // Habitaciones compartidas
        {
          type: 'hostel',
          name: 'Habitación Compartida Mixta',
          description: 'Habitaciones temáticas con nombres de volcanes locales (Licancabur, Juriques, Tatio, Lascar). 4 camas por habitación, cada una con enchufe individual, lámpara, cortina y casillero.',
          quantity: 4,
          capacity: {
            maxGuests: 4,
            beds: 4,
            bathrooms: 0, // Baños compartidos
            sharedBathroom: true,
          },
          pricing: {
            basePrice: 12000,
            currency: 'CLP',
            weeklyDiscount: 10,
            monthlyDiscount: 20,
          },
          photos: [
            'https://casavoyagehostel.com/wp-content/uploads/2024/06/hab-compartida-lascar-h1-1024x683.jpg',
            'https://casavoyagehostel.com/wp-content/uploads/2024/06/cvh13.jpg',
          ],
          amenities: ['Enchufe individual', 'Lámpara', 'Cortina privacidad', 'Casillero', 'Ropa de cama'],
        },
        // Habitaciones privadas
        {
          type: 'hostel',
          name: 'Habitación Privada',
          description: 'Habitaciones privadas Tumisa, Sairecabur y Kimal. Perfectas para parejas o viajeros que buscan más privacidad.',
          quantity: 3,
          capacity: {
            maxGuests: 2,
            beds: 1,
            bathrooms: 0,
            sharedBathroom: true,
          },
          pricing: {
            basePrice: 35000,
            currency: 'CLP',
            weeklyDiscount: 10,
            monthlyDiscount: 20,
          },
          photos: [
            'https://casavoyagehostel.com/wp-content/uploads/2024/06/casa-voyage-hostel-atacama-chile-891x595.jpg',
          ],
          amenities: ['Cama matrimonial', 'Ropa de cama', 'Privacidad', 'Ventana'],
        },
        // Domos geodésicos
        {
          type: 'dome',
          name: 'Domo Geodésico',
          description: 'Domos Cordillera y Quechua: alojamientos ecológicos únicos construidos para la experiencia del desierto. Una forma especial de conectar con la naturaleza del Atacama.',
          quantity: 2,
          capacity: {
            maxGuests: 2,
            beds: 1,
            bathrooms: 0,
            sharedBathroom: true,
          },
          pricing: {
            basePrice: 45000,
            currency: 'CLP',
            weeklyDiscount: 10,
            monthlyDiscount: 20,
          },
          photos: [
            'https://casavoyagehostel.com/wp-content/uploads/2024/06/domos.casa_.voyage.hostel-1600x690.jpg',
            'https://casavoyagehostel.com/wp-content/uploads/2024/06/casa-voyage-hostel-atacama-1400x690.jpg',
          ],
          amenities: ['Construcción ecológica', 'Ventanas panorámicas', 'Experiencia única', 'Ropa de cama'],
        },
      ],

      // Ubicación
      address: 'Lascar 368, San Pedro de Atacama',
      location: {
        lat: -22.9083,
        lng: -68.1999,
      },
      distanceToCenter: 0.8, // 0.8km del centro
      neighborhood: 'Centro',

      // Amenidades generales
      amenities: [
        'WiFi gratis 24h',
        'Piscina al aire libre',
        'Jardín',
        'Zona de fogatas',
        'Cocina compartida',
        'Biblioteca',
        'Mesa de pool',
        'Muro de escalada',
        'Alquiler de bicicletas',
        'Estacionamiento privado',
        'Recepción 24 horas',
        'Servicio de tours',
        'Hamacas',
        'Arte y murales',
      ],

      // Highlights
      highlights: [
        'Rating 9.0/10 en Booking.com',
        'Domos geodésicos únicos',
        'Arte y cultura integrados',
        'Ambiente internacional de viajeros',
        'Múltiples espacios de encuentro',
        'Actividades y talleres',
      ],

      // Información importante
      importantInfo: {
        transportationNeeded: false, // Está en el centro
        bringYourFood: false, // Tiene cocina compartida
        remoteLocation: false, // Centro del pueblo
        limitedCellSignal: false,
        customNotes: [
          'Check-in: 3:00 PM / Check-out: 12:00 PM',
          'Ambiente de mochileros y viajeros internacionales',
          'Ideal para conocer gente y compartir experiencias',
          'Actividades y talleres culturales disponibles',
        ],
      },

      // Disponibilidad (calendario simplificado)
      availability: {
        calendar: {}, // Calendario vacío por ahora
        defaultMinStay: 1,
        defaultMaxStay: 30,
        bookingWindow: 0, // Reserva inmediata
        instantBooking: true,
      },

      // Reglas
      rules: {
        checkIn: '15:00 - 22:00',
        checkOut: '12:00',
        checkInInstructions: 'Recepción 24 horas disponible. Si llegas después de las 22:00, por favor avisa con anticipación.',
        smoking: false,
        pets: false,
        parties: false,
        children: true,
        quietHours: '23:00 - 08:00',
        customRules: [
          'Respeto por los demás huéspedes',
          'Mantener espacios comunes limpios',
          'Participación en actividades es bienvenida',
        ],
      },

      // Política de cancelación
      cancellationPolicy: 'moderate', // Reembolso completo hasta 5 días antes

      // Host info
      hostInfo: {
        name: 'Equipo Casa Voyage',
        responseTime: 'Responde en menos de 24 horas',
        languages: ['Español', 'Inglés', 'Francés'],
      },

      // Stats (basado en datos reales de Booking.com)
      rating: 9.0,
      reviewCount: 1152,
      totalBookings: 2500, // Estimado

      // Status
      status: 'active', // Activo para que aparezca en búsquedas
      featured: true, // Destacado por su excelente rating
      verified: false, // Se verificará cuando reclamen

      // Tags
      tags: ['backpackers', 'social', 'art', 'eco-friendly', 'domes', 'pool', 'cultural'],

      // Metadata
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    const stayRef = await addDoc(collection(db, 'stays'), stayData);
    console.log(`✅ Mock Stay created with ID: ${stayRef.id}`);

    // ========== 3. INVITATION ==========
    console.log('Creating Invitation for Casa Voyage...');

    const invitationData = {
      code: `ATK-2025-VOYAGE-001`,

      // Link to mock stay
      mockProviderId: stayRef.id, // En este caso es el Stay ID
      linkedLeadId: leadRef.id,

      // Personalización
      recipientName: 'Casa Voyage',
      businessName: 'Casa Voyage Hostel',
      category: 'hostel & glamping',
      email: 'info@casavoyagehostel.com',
      customMessage: '¡Hola Casa Voyage! Nos encantaría que formaras parte de Santurist, la plataforma que conecta a viajeros con las mejores experiencias de San Pedro de Atacama. Tu hostel con domos geodésicos y ambiente cultural es exactamente lo que buscamos.',

      type: 'lodging',
      status: 'pending',

      createdBy: ADMIN_ID,
      createdAt: serverTimestamp(),

      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 días

      metadata: {
        notes: 'Proveedor investigado. Excelente rating (9.0/10) y modelo híbrido único. Prioridad alta.',
      },
    };

    const invitationRef = await addDoc(collection(db, 'invitations'), invitationData);
    console.log(`✅ Invitation created with ID: ${invitationRef.id}`);
    console.log(`   Code: ${invitationData.code}`);
    console.log(`   URL: /invite/${invitationData.code}`);

    // ========== SUMMARY ==========
    console.log('\n✨ Casa Voyage Hostel seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Provider Lead ID:', leadRef.id);
    console.log('🏠 Mock Stay ID:', stayRef.id);
    console.log('✉️  Invitation ID:', invitationRef.id);
    console.log('🔗 Invitation Code:', invitationData.code);
    console.log('📧 Contact Email:', 'info@casavoyagehostel.com');
    console.log('📱 WhatsApp:', '+56957636043');
    console.log('📍 Instagram:', '@casavoyagehostel');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return {
      leadId: leadRef.id,
      stayId: stayRef.id,
      invitationId: invitationRef.id,
      invitationCode: invitationData.code,
    };

  } catch (error) {
    console.error('❌ Error seeding Casa Voyage:', error);
    throw error;
  }
}

// Para ejecutar manualmente desde consola del navegador:
// import { seedCasaVoyage } from '@/lib/seeds/seedCasaVoyage';
// seedCasaVoyage().then(result => console.log('Done!', result));
