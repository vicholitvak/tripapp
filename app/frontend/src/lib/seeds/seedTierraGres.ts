/**
 * Seed script para Tierra Gres
 *
 * Información Real:
 * - Owner: Antonia del Pedregal
 * - Nombre: Tierra Gres
 * - Categoría: Cerámica gres artesanal hecha a mano
 * - Ubicación: San Pedro de Atacama (Showroom físico)
 * - Teléfono: +569 85934514
 * - Email: contacto@tierragres.cl
 * - Instagram: @tierra_gres
 * - Website: https://www.tierragres.cl
 * - Descripción: Cerámica gres modelada a mano inspirada en San Pedro de Atacama
 * - Historia: Aprendió cerámica en Santiago (2018), empezó en San Pedro (2020)
 * - Inspiración: Formas y colores del desierto, volcanes y valles
 * - Productos: Pocillos, fuentes, sets pisco sour, cucharas decorativas,
 *   collares, vasos, jarras, piezas personalizadas
 * - Rango precios: $12.000 - $660.000
 *
 * Este proveedor es amiga del fundador y será parte de la base de datos
 * de leads para eventualmente enviarle una invitación.
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

export async function seedTierraGres() {
  console.log('🏺 Seeding Tierra Gres (Antonia)...');

  try {
    // ========== 1. PROVIDER LEAD ==========
    console.log('Creating ProviderLead for Tierra Gres...');

    const leadData: Omit<ProviderLead, 'id'> = {
      // Tipo de proveedor
      type: 'artisan',
      category: 'Cerámica Gres Artesanal',

      // Información de contacto REAL
      contactInfo: {
        name: 'Antonia del Pedregal',
        businessName: 'Tierra Gres',
        email: 'contacto@tierragres.cl',
        phone: '+56985934514',
        whatsapp: '+56985934514',
        address: 'Showroom en San Pedro de Atacama',
      },

      // Servicios ofrecidos
      servicesOffered: [
        'Cerámica gres modelada a mano',
        'Pocillos y fuentes',
        'Sets para pisco sour',
        'Cucharas decorativas San Pedro',
        'Collares de cerámica',
        'Jarras y vasos artesanales',
        'Pedidos personalizados',
        'Tours de cerámica',
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
      notes: 'Investigado el 2025-10-27. Antonia del Pedregal - amiga del fundador. Ceramista que aprendió en Santiago (2018) y empezó en San Pedro de Atacama (2020). Cerámica gres inspirada en formas y colores del desierto atacameño, con diseños de volcanes y valles. Website: https://www.tierragres.cl | Instagram: @tierra_gres | Ofrece showroom físico + tours de cerámica. Productos desde $12.000 a $660.000.',

      // Tags
      tags: ['ceramica', 'artesania', 'gres', 'hecho-a-mano', 'desierto', 'arte', 'referral', 'friend'],
    };

    const leadRef = await addDoc(collection(db, 'providerLeads'), leadData);
    console.log(`✅ ProviderLead created with ID: ${leadRef.id}`);

    // ========== 2. MOCK MARKETPLACE LISTINGS ==========
    console.log('Creating Mock Marketplace Listings for Tierra Gres...');

    const mockProviderId = `mock-${leadRef.id}`;

    // Definir productos con precios reales y márgenes
    const productos = [
      {
        name: 'Pocillo Desierto',
        description: 'Bowl de cerámica gres modelado a mano con inspiración en las tonalidades del desierto de Atacama. Ideal para desayuno o postres. Cada pieza es única.',
        category: 'Pocillos y Fuentes',
        basePrice: 18000,
        sellingPrice: 21000, // +16% margen
        stock: 8,
        images: [
          'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&h=600&fit=crop',
        ],
        tags: ['bowl', 'desayuno', 'ceramica', 'hecho-a-mano'],
      },
      {
        name: 'Fuente Volcán',
        description: 'Fuente grande de cerámica gres con diseño inspirado en los volcanes del altiplano. Perfecta para servir ensaladas o platos principales. Textura única del gres.',
        category: 'Pocillos y Fuentes',
        basePrice: 35000,
        sellingPrice: 42000, // +20% margen
        stock: 5,
        images: [
          'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=600&h=600&fit=crop',
        ],
        tags: ['fuente', 'serving', 'volcan', 'grande'],
      },
      {
        name: 'Set Pisco Sour (4 piezas)',
        description: 'Set completo para disfrutar del pisco sour tradicional chileno. Incluye 4 vasos de cerámica gres con diseños del desierto. Tamaño ideal para cócteles.',
        category: 'Sets y Vasos',
        basePrice: 65000,
        sellingPrice: 75000, // +15% margen
        stock: 3,
        images: [
          'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&h=600&fit=crop',
        ],
        tags: ['set', 'pisco-sour', 'vasos', 'regalo', 'chile'],
      },
      {
        name: 'Cuchara Decorativa San Pedro',
        description: 'Cuchara decorativa de cerámica gres con mango largo y diseño inspirado en las formas del desierto. Ideal como pieza de arte o para servir.',
        category: 'Cucharas y Accesorios',
        basePrice: 12000,
        sellingPrice: 14000, // +16% margen
        stock: 12,
        images: [
          'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&h=600&fit=crop',
        ],
        tags: ['cuchara', 'decorativa', 'accesorio', 'regalo'],
      },
      {
        name: 'Jarra Atacama',
        description: 'Jarra de cerámica gres de 1 litro con asa ergonómica. Colores tierra inspirados en las salinas y lagunas del altiplano. Perfecta para agua, jugos o como florero.',
        category: 'Jarras y Vasos',
        basePrice: 28000,
        sellingPrice: 33000, // +18% margen
        stock: 6,
        images: [
          'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&h=600&fit=crop',
        ],
        tags: ['jarra', 'pitcher', 'agua', 'florero'],
      },
      {
        name: 'Collar Cerámica Tierra',
        description: 'Collar artesanal con colgante de cerámica gres. Diseño minimalista inspirado en las formas orgánicas del desierto. Cordón ajustable.',
        category: 'Joyería Cerámica',
        basePrice: 15000,
        sellingPrice: 18000, // +20% margen
        stock: 10,
        images: [
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop',
        ],
        tags: ['collar', 'joyeria', 'colgante', 'artesanal', 'regalo'],
      },
      {
        name: 'Vaso Gres Natural',
        description: 'Vaso de cerámica gres sin esmalte exterior, con interior esmaltado. Textura rugosa natural. Ideal para té, café o infusiones. 250ml.',
        category: 'Jarras y Vasos',
        basePrice: 16000,
        sellingPrice: 19000, // +18% margen
        stock: 15,
        images: [
          'https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=600&h=600&fit=crop',
        ],
        tags: ['vaso', 'taza', 'cafe', 'te', 'natural'],
      },
      {
        name: 'Fuente Ovalada Valles',
        description: 'Fuente ovalada mediana con diseño inspirado en los valles del desierto. Perfecta para aperitivos, frutos secos o como pieza decorativa. 30cm largo.',
        category: 'Pocillos y Fuentes',
        basePrice: 42000,
        sellingPrice: 49000, // +16% margen
        stock: 4,
        images: [
          'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&h=600&fit=crop',
        ],
        tags: ['fuente', 'ovalada', 'aperitivos', 'valles'],
      },
      {
        name: 'Set de 2 Pocillos Pareja',
        description: 'Par de pocillos de cerámica gres con diseños complementarios. Perfectos como regalo para parejas. Colores tierra y ocre del desierto.',
        category: 'Pocillos y Fuentes',
        basePrice: 32000,
        sellingPrice: 38000, // +18% margen
        stock: 6,
        images: [
          'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=600&h=600&fit=crop',
        ],
        tags: ['set', 'pocillos', 'pareja', 'regalo', 'bowl'],
      },
      {
        name: 'Pieza Escultural Licancabur',
        description: 'Pieza escultural grande inspirada en el volcán Licancabur. Obra de arte funcional que puede usarse como florero o pieza decorativa central. Edición limitada.',
        category: 'Piezas Escultóricas',
        basePrice: 180000,
        sellingPrice: 210000, // +16% margen
        stock: 2,
        images: [
          'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=600&fit=crop',
        ],
        tags: ['escultura', 'licancabur', 'arte', 'pieza-unica', 'limited-edition'],
      },
    ];

    const listingIds: string[] = [];

    for (const producto of productos) {
      const listingData: Omit<Listing, 'id'> = {
        providerId: mockProviderId,
        baseType: 'marketplace',
        category: 'ceramica',

        name: producto.name,
        description: producto.description,
        price: producto.sellingPrice,
        currency: 'CLP',
        images: producto.images,
        rating: 0,
        reviewCount: 0,
        status: 'active',
        featured: producto.basePrice >= 65000,

        // Tags opcionales
        tags: {
          custom: producto.tags,
        },

        // Product info específico de marketplace
        productInfo: {
          stock: producto.stock,
          weight: 0.8,
          dimensions: 'Según pieza',
          shippingCost: 5000,
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
    console.log('Creating Invitation for Tierra Gres...');

    const invitationData = {
      code: `ATK-2025-TIERRAGRES-001`,

      // Link to lead
      linkedLeadId: leadRef.id,
      mockProviderId: mockProviderId,

      // Personalización
      recipientName: 'Antonia',
      businessName: 'Tierra Gres',
      category: 'ceramista',
      email: 'contacto@tierragres.cl',
      customMessage: '¡Hola Antonia! 🏺 Nos encantaría que Tierra Gres formara parte de Santurist, nuestra plataforma que conecta a viajeros con artesanos locales de San Pedro de Atacama. Tu cerámica gres inspirada en el desierto es exactamente lo que buscamos para nuestro marketplace.',

      type: 'artisan',
      status: 'pending',

      createdBy: ADMIN_ID,
      createdAt: serverTimestamp(),

      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 días

      metadata: {
        notes: 'Amiga del fundador. Prioridad alta. Artesana con showroom físico y tours de cerámica.',
      },
    };

    const invitationRef = await addDoc(collection(db, 'invitations'), invitationData);
    console.log(`✅ Invitation created with ID: ${invitationRef.id}`);
    console.log(`   Code: ${invitationData.code}`);
    console.log(`   URL: /invite/${invitationData.code}`);

    // ========== SUMMARY ==========
    console.log('\n✨ Tierra Gres (Antonia) seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Provider Lead ID:', leadRef.id);
    console.log('🏺 Mock Provider ID:', mockProviderId);
    console.log('📦 Marketplace Listings:', listingIds.length, 'productos');
    console.log('✉️  Invitation ID:', invitationRef.id);
    console.log('🔗 Invitation Code:', invitationData.code);
    console.log('📧 Contact Email:', 'contacto@tierragres.cl');
    console.log('📱 WhatsApp:', '+56985934514');
    console.log('📷 Instagram:', '@tierra_gres');
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
    console.error('❌ Error seeding Tierra Gres:', error);
    throw error;
  }
}

// Para ejecutar manualmente desde consola del navegador:
// import { seedTierraGres } from '@/lib/seeds/seedTierraGres';
// seedTierraGres().then(result => console.log('Done!', result));
