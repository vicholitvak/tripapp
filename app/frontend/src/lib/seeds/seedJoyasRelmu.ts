/**
 * Seed script para Joyas Relmu
 *
 * Información Real:
 * - Owner: Javiera (la Javi) - amiga del fundador
 * - Nombre: Joyas Relmu
 * - "Relmu" = "Arcoíris" en mapuche
 * - Categoría: Joyería artesanal en plata con piedras del desierto
 * - Ubicación: San Pedro de Atacama
 * - Instagram: @joyas_relmu
 * - Estilo: Joyería inspirada en el desierto de Atacama, diseños andinos,
 *   piedras naturales (turquesa, lapislázuli, cuarzo rosa)
 * - Materiales: Plata 925, piedras semipreciosas del altiplano
 * - Rango precios estimado: $15.000 - $120.000
 *
 * Este proveedor es amiga del fundador y será parte de la base de datos
 * de leads para enviarle una invitación.
 */

import {
  collection,
  addDoc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ProviderLead } from '@/types/provider';
import { Listing } from '@/types/marketplace';

const ADMIN_ID = 'admin-seed';

export async function seedJoyasRelmu() {
  console.log('💎 Seeding Joyas Relmu (Javi)...');

  try {
    // ========== 1. PROVIDER LEAD ==========
    console.log('Creating ProviderLead for Joyas Relmu...');

    const leadData: Omit<ProviderLead, 'id'> = {
      // Tipo de proveedor
      type: 'artisan',
      category: 'Joyería Artesanal en Plata',

      // Información de contacto
      contactInfo: {
        name: 'Javiera',
        businessName: 'Joyas Relmu',
        email: 'joyas.relmu@gmail.com', // Email estimado
        phone: '+56900000000', // Placeholder - actualizar con real
        whatsapp: '+56900000000', // Placeholder
        address: 'San Pedro de Atacama',
      },

      // Servicios ofrecidos
      servicesOffered: [
        'Joyería artesanal en plata 925',
        'Collares con piedras del desierto',
        'Aretes con diseños andinos',
        'Pulseras de plata',
        'Anillos con piedras naturales',
        'Dijes y colgantes',
        'Pedidos personalizados',
      ],

      // Estado y seguimiento
      status: 'new',
      priority: 'high', // Amiga del fundador
      source: 'referral', // Contacto directo/amiga
      isActive: true,

      // Metadata
      createdBy: ADMIN_ID,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,

      // Notas
      notes: 'Investigado el 2025-10-27. Javiera "la Javi" - amiga del fundador. Joyera artesanal que trabaja plata 925 con piedras semipreciosas del altiplano. Instagram: @joyas_relmu | "Relmu" significa "arcoíris" en mapuche. Diseños inspirados en el desierto de Atacama con turquesa, lapislázuli, cuarzo rosa. Estilo único que combina tradición andina con diseño contemporáneo.',

      // Tags
      tags: ['joyeria', 'plata', 'artesania', 'piedras-naturales', 'atacama', 'relmu', 'referral', 'friend'],
    };

    const leadRef = await addDoc(collection(db, 'providerLeads'), leadData);
    console.log(`✅ ProviderLead created with ID: ${leadRef.id}`);

    // ========== 2. MOCK MARKETPLACE LISTINGS ==========
    console.log('Creating Mock Marketplace Listings for Joyas Relmu...');

    const mockProviderId = `mock-${leadRef.id}`;

    // Definir productos de joyería con precios y márgenes
    const productos = [
      {
        name: 'Collar Relmu - Turquesa Natural',
        description: 'Collar de plata 925 con colgante de turquesa natural del altiplano. Piedra pulida a mano con tonos azul-verde característicos del desierto. Cadena de 45cm ajustable. Diseño inspirado en el arcoíris del desierto.',
        category: 'Collares',
        basePrice: 45000,
        sellingPrice: 52000, // +15% margen
        stock: 4,
        images: [
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop',
        ],
        tags: ['collar', 'turquesa', 'plata-925', 'piedra-natural', 'regalo'],
      },
      {
        name: 'Aretes Gota Lapislázuli',
        description: 'Aretes de plata 925 con incrustaciones de lapislázuli chileno. Forma de gota con cierre de presión. El lapislázuli representa el cielo del Atacama, con sus tonos azul profundo. Par único.',
        category: 'Aretes',
        basePrice: 28000,
        sellingPrice: 33000, // +18% margen
        stock: 6,
        images: [
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop',
        ],
        tags: ['aretes', 'lapislazuli', 'plata-925', 'gota', 'azul'],
      },
      {
        name: 'Pulsera Diseño Andino',
        description: 'Pulsera de plata 925 con diseño geométrico inspirado en textiles andinos. Trabajo en filigrana con símbolos de las culturas precolombinas del altiplano. Ajustable. Pieza statement.',
        category: 'Pulseras',
        basePrice: 38000,
        sellingPrice: 45000, // +18% margen
        stock: 5,
        images: [
          'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop',
        ],
        tags: ['pulsera', 'andino', 'plata-925', 'geometrico', 'filigrana'],
      },
      {
        name: 'Anillo Cuarzo Rosa',
        description: 'Anillo de plata 925 con cuarzo rosa del desierto. Piedra ovalada engastada en diseño minimalista. El cuarzo rosa representa el amor y la energía femenina. Disponible en diferentes tallas.',
        category: 'Anillos',
        basePrice: 32000,
        sellingPrice: 38000, // +18% margen
        stock: 8,
        images: [
          'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop',
        ],
        tags: ['anillo', 'cuarzo-rosa', 'plata-925', 'minimalista', 'rosa'],
      },
      {
        name: 'Dije Volcán Licancabur',
        description: 'Dije de plata 925 con forma del icónico volcán Licancabur. Diseño en relieve que captura la silueta perfecta del volcán sagrado. Incluye cadena de 40cm. Ideal para regalo o recuerdo del Atacama.',
        category: 'Dijes y Colgantes',
        basePrice: 22000,
        sellingPrice: 26000, // +18% margen
        stock: 10,
        images: [
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop',
        ],
        tags: ['dije', 'licancabur', 'volcan', 'plata-925', 'recuerdo'],
      },
      {
        name: 'Set Aretes + Collar Atacama',
        description: 'Set combinado de collar y aretes en plata 925 con turquesa. Diseño coordinado con piedras del mismo lote para garantizar tonalidad uniforme. Perfecto como regalo especial. Presentación en caja artesanal.',
        category: 'Sets',
        basePrice: 68000,
        sellingPrice: 78000, // +15% margen
        stock: 3,
        images: [
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop',
        ],
        tags: ['set', 'collar', 'aretes', 'turquesa', 'regalo', 'plata-925'],
      },
      {
        name: 'Pulsera Cascada Piedras',
        description: 'Pulsera de plata 925 con múltiples piedras semipreciosas del altiplano: turquesa, lapislázuli, cuarzo rosa y ónix. Diseño en cascada que representa las diferentes tonalidades del desierto. 18cm.',
        category: 'Pulseras',
        basePrice: 52000,
        sellingPrice: 60000, // +15% margen
        stock: 4,
        images: [
          'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop',
        ],
        tags: ['pulsera', 'multi-piedras', 'colorida', 'cascada', 'plata-925'],
      },
      {
        name: 'Aretes Circulares Filigrana',
        description: 'Aretes circulares de plata 925 con trabajo de filigrana tradicional. Diseño ligero inspirado en los mandalas andinos. Cierre tipo aro. Perfectos para uso diario o especial.',
        category: 'Aretes',
        basePrice: 24000,
        sellingPrice: 28000, // +16% margen
        stock: 7,
        images: [
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop',
        ],
        tags: ['aretes', 'circulares', 'filigrana', 'plata-925', 'mandala'],
      },
      {
        name: 'Anillo Ajustable Flor del Desierto',
        description: 'Anillo ajustable de plata 925 con diseño de flor del desierto. Pétalos trabajados en relieve con acabado mate y brillo. Se adapta a diferentes tallas. Inspirado en las flores que brotan tras las lluvias.',
        category: 'Anillos',
        basePrice: 26000,
        sellingPrice: 31000, // +19% margen
        stock: 9,
        images: [
          'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop',
        ],
        tags: ['anillo', 'ajustable', 'flor', 'desierto', 'plata-925'],
      },
      {
        name: 'Collar Statement Altiplano',
        description: 'Collar statement de plata 925 con diseño arquitectónico inspirado en las terrazas de cultivo del altiplano. Pieza grande y llamativa con múltiples niveles y texturas. 50cm. Edición limitada.',
        category: 'Collares',
        basePrice: 95000,
        sellingPrice: 110000, // +16% margen
        stock: 2,
        images: [
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop',
        ],
        tags: ['collar', 'statement', 'altiplano', 'arquitectonico', 'limited-edition'],
      },
    ];

    const listingIds: string[] = [];

    for (const producto of productos) {
      const listingData: Omit<Listing, 'id'> = {
        providerId: mockProviderId,
        baseType: 'marketplace',
        category: 'joyeria',

        name: producto.name,
        description: producto.description,
        price: producto.sellingPrice,
        currency: 'CLP',
        images: producto.images,
        rating: 0,
        reviewCount: 0,
        status: 'active',
        featured: producto.basePrice >= 60000,

        // Tags opcionales
        tags: {
          custom: producto.tags,
        },

        // Product info específico de marketplace
        productInfo: {
          stock: producto.stock,
          weight: 0.1,
          dimensions: 'Según pieza',
          shippingCost: 3500,
        },

        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };

      const listingRef = await addDoc(collection(db, 'marketplaceListings'), listingData);
      listingIds.push(listingRef.id);
      console.log(`  ✅ Created listing: ${producto.name} (ID: ${listingRef.id})`);
    }

    console.log(`✅ Created ${listingIds.length} marketplace listings`);

    // ========== 3. INVITATION ==========
    console.log('Creating Invitation for Joyas Relmu...');

    const invitationData = {
      code: `ATK-2025-RELMU-001`,

      // Link to lead
      linkedLeadId: leadRef.id,
      mockProviderId: mockProviderId,

      // Personalización
      recipientName: 'Javi',
      businessName: 'Joyas Relmu',
      category: 'joyera',
      email: 'joyas.relmu@gmail.com',
      customMessage: '¡Hola Javi! 💎 Nos encantaría que Joyas Relmu formara parte de Santurist, nuestra plataforma que conecta a viajeros con artesanos locales de San Pedro de Atacama. Tus joyas en plata con piedras del desierto son perfectas para nuestro marketplace. ¡El arcoíris de Relmu en Santurist!',

      type: 'artisan',
      status: 'pending',

      createdBy: ADMIN_ID,
      createdAt: serverTimestamp(),

      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 días

      metadata: {
        notes: 'Amiga del fundador (la Javi). Prioridad alta. Joyera artesanal con trabajo en plata 925 y piedras del altiplano.',
      },
    };

    const invitationRef = await addDoc(collection(db, 'invitations'), invitationData);
    console.log(`✅ Invitation created with ID: ${invitationRef.id}`);
    console.log(`   Code: ${invitationData.code}`);
    console.log(`   URL: /invite/${invitationData.code}`);

    // ========== SUMMARY ==========
    console.log('\n✨ Joyas Relmu (Javi) seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Provider Lead ID:', leadRef.id);
    console.log('💎 Mock Provider ID:', mockProviderId);
    console.log('📦 Marketplace Listings:', listingIds.length, 'productos');
    console.log('✉️  Invitation ID:', invitationRef.id);
    console.log('🔗 Invitation Code:', invitationData.code);
    console.log('📧 Contact Email:', 'joyas.relmu@gmail.com (verificar)');
    console.log('📷 Instagram:', '@joyas_relmu');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Calcular estadísticas
    const totalBaseValue = productos.reduce((sum, p) => sum + (p.basePrice * p.stock), 0);
    const totalSellingValue = productos.reduce((sum, p) => sum + (p.sellingPrice * p.stock), 0);
    const totalMargin = totalSellingValue - totalBaseValue;

    console.log('\n💰 Estadísticas de Inventario:');
    console.log(`   Valor base total: $${totalBaseValue.toLocaleString('es-CL')}`);
    console.log(`   Valor venta total: $${totalSellingValue.toLocaleString('es-CL')}`);
    console.log(`   Margen plataforma: $${totalMargin.toLocaleString('es-CL')} (${((totalMargin/totalBaseValue)*100).toFixed(1)}%)`);
    console.log(`   Stock total: ${productos.reduce((sum, p) => sum + p.stock, 0)} piezas`);

    return {
      leadId: leadRef.id,
      mockProviderId,
      listingIds,
      invitationId: invitationRef.id,
      invitationCode: invitationData.code,
      stats: {
        productos: productos.length,
        stockTotal: productos.reduce((sum, p) => sum + p.stock, 0),
        valorBase: totalBaseValue,
        valorVenta: totalSellingValue,
        margen: totalMargin,
      },
    };

  } catch (error) {
    console.error('❌ Error seeding Joyas Relmu:', error);
    throw error;
  }
}

// Para ejecutar manualmente desde consola del navegador:
// import { seedJoyasRelmu } from '@/lib/seeds/seedJoyasRelmu';
// seedJoyasRelmu().then(result => console.log('Done!', result));
