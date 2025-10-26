/**
 * Mock data seed para el marketplace
 * Contiene cerámica gress y orfebrería local
 */

import { Listing, ListingStatus } from '@/types/marketplace';

export const marketplaceMockData = {
  ceramicaGress: {
    providerId: 'ceramica-gress-atacama',
    providerName: 'Cerámica Gress Atacama',
    type: 'product' as const,
    listings: [
      {
        providerId: 'ceramica-gress-atacama',
        type: 'product',
        category: 'ceramica',
        name: 'Macetero de Cerámica Gress - Diseño Tribal',
        description: 'Hermoso macetero hecho a mano con cerámica gress y detalles geométricos inspirados en la cultura atacameña. Perfecto para plantas interiores.',
        price: 45000,
        currency: 'CLP',
        images: [
          'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1566619635300-1bfe5b8db3d0?w=600&h=600&fit=crop'
        ],
        rating: 4.8,
        reviewCount: 24,
        status: 'active' as ListingStatus,
        featured: true,
        productInfo: {
          stock: 15,
          weight: 1.2,
          dimensions: '25cm x 25cm x 30cm',
          shippingCost: 5000
        }
      },
      {
        providerId: 'ceramica-gress-atacama',
        type: 'product',
        category: 'ceramica',
        name: 'Plato Decorativo de Cerámica - Motivos Andinos',
        description: 'Plato artesanal de cerámica con motivos andinos grabados a mano. Cada pieza es única. Ideal para decoración o como pieza funcional.',
        price: 32000,
        currency: 'CLP',
        images: [
          'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&h=600&fit=crop'
        ],
        rating: 4.9,
        reviewCount: 18,
        status: 'active' as ListingStatus,
        featured: true,
        productInfo: {
          stock: 20,
          weight: 0.8,
          dimensions: '30cm diámetro',
          shippingCost: 4000
        }
      },
      {
        providerId: 'ceramica-gress-atacama',
        type: 'product',
        category: 'ceramica',
        name: 'Jarra de Cerámica Artesanal',
        description: 'Jarra de cerámica gress hecha al torno, con acabado natural. Funcional y decorativa, perfecta para servir agua o como florero.',
        price: 38000,
        currency: 'CLP',
        images: [
          'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&h=600&fit=crop'
        ],
        rating: 4.7,
        reviewCount: 12,
        status: 'active' as ListingStatus,
        featured: false,
        productInfo: {
          stock: 10,
          weight: 1.5,
          dimensions: '15cm x 15cm x 25cm',
          shippingCost: 5000
        }
      },
      {
        providerId: 'ceramica-gress-atacama',
        type: 'product',
        category: 'ceramica',
        name: 'Taza de Cerámica Personalizada',
        description: 'Taza de cerámica hecha a mano, con diseños únicos. Ideal para regalar o para ti mismo. Apto para uso diario.',
        price: 18000,
        currency: 'CLP',
        images: [
          'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&h=600&fit=crop'
        ],
        rating: 4.6,
        reviewCount: 35,
        status: 'active' as ListingStatus,
        featured: false,
        productInfo: {
          stock: 50,
          weight: 0.4,
          dimensions: '10cm x 10cm x 12cm',
          shippingCost: 3000
        }
      },
      {
        providerId: 'ceramica-gress-atacama',
        type: 'product',
        category: 'ceramica',
        name: 'Set de Cuencos de Cerámica - 3 piezas',
        description: 'Set de 3 cuencos de diferentes tamaños, perfectos para servir comida o guardar objetos pequeños. Terminación mate natural.',
        price: 55000,
        currency: 'CLP',
        images: [
          'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=600&h=600&fit=crop'
        ],
        rating: 4.9,
        reviewCount: 28,
        status: 'active' as ListingStatus,
        featured: true,
        productInfo: {
          stock: 8,
          weight: 2.0,
          dimensions: 'Pequeño: 15cm, Mediano: 20cm, Grande: 25cm',
          shippingCost: 6000
        }
      },
      {
        providerId: 'ceramica-gress-atacama',
        type: 'product',
        category: 'ceramica',
        name: 'Espejo de Cerámica Marco Artesanal',
        description: 'Espejo decorativo con marco de cerámica elaborado. Excelente pieza para la decoración del hogar con estilo rústico moderno.',
        price: 72000,
        currency: 'CLP',
        images: [
          'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&h=600&fit=crop'
        ],
        rating: 4.8,
        reviewCount: 16,
        status: 'active' as ListingStatus,
        featured: false,
        productInfo: {
          stock: 5,
          weight: 2.5,
          dimensions: '40cm x 40cm',
          shippingCost: 8000
        }
      }
    ]
  },

  orfebreria: {
    providerId: 'orfeberia-atacama-autentica',
    providerName: 'Orfebrería Atacama Auténtica',
    type: 'product' as const,
    listings: [
      {
        providerId: 'orfeberia-atacama-autentica',
        type: 'product',
        category: 'joyeria',
        name: 'Collar de Plata Ley 925 - Piedra de Luna',
        description: 'Collar artesanal de plata ley 925 con piedra de luna natural. Hecho a mano por maestro orfebre. Incluye certificado de autenticidad.',
        price: 95000,
        currency: 'CLP',
        images: [
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop'
        ],
        rating: 4.9,
        reviewCount: 42,
        status: 'active' as ListingStatus,
        featured: true,
        productInfo: {
          stock: 8,
          weight: 0.15,
          dimensions: 'Largo de cadena: 50cm ajustable',
          shippingCost: 2000
        }
      },
      {
        providerId: 'orfeberia-atacama-autentica',
        type: 'product',
        category: 'joyeria',
        name: 'Anillo de Plata - Diseño Étnico',
        description: 'Anillo de plata ley 925 con diseño étnico inspirado en la cultura andina. Tallado a mano con detalles únicos. Tallas disponibles: 16-22.',
        price: 55000,
        currency: 'CLP',
        images: [
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop'
        ],
        rating: 4.8,
        reviewCount: 38,
        status: 'active' as ListingStatus,
        featured: true,
        productInfo: {
          stock: 12,
          weight: 0.08,
          dimensions: 'Ajustable a diferentes tallas',
          shippingCost: 1500
        }
      },
      {
        providerId: 'orfeberia-atacama-autentica',
        type: 'product',
        category: 'joyeria',
        name: 'Pulsera de Plata con Turquesa Natural',
        description: 'Hermosa pulsera de plata 925 con turquesa natural de Atacama. Cada piedra es única. Cierre de seguridad.',
        price: 120000,
        currency: 'CLP',
        images: [
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop'
        ],
        rating: 5.0,
        reviewCount: 31,
        status: 'active' as ListingStatus,
        featured: true,
        productInfo: {
          stock: 6,
          weight: 0.25,
          dimensions: 'Circunferencia ajustable: 17-21cm',
          shippingCost: 2000
        }
      },
      {
        providerId: 'orfeberia-atacama-autentica',
        type: 'product',
        category: 'joyeria',
        name: 'Aretes de Plata - Forma Gota',
        description: 'Aretes colgantes de plata ley 925 con forma de gota. Diseño minimalista y elegante, perfecto para uso diario.',
        price: 42000,
        currency: 'CLP',
        images: [
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop'
        ],
        rating: 4.7,
        reviewCount: 25,
        status: 'active' as ListingStatus,
        featured: false,
        productInfo: {
          stock: 20,
          weight: 0.05,
          dimensions: 'Largo: 3cm',
          shippingCost: 1500
        }
      },
      {
        providerId: 'orfeberia-atacama-autentica',
        type: 'product',
        category: 'joyeria',
        name: 'Diadema de Plata - Coronita Artesanal',
        description: 'Diadema artesanal de plata ley 925 con diseño de coronita delicada. Pieza única y especial para ocasiones especiales.',
        price: 185000,
        currency: 'CLP',
        images: [
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop'
        ],
        rating: 4.9,
        reviewCount: 19,
        status: 'active' as ListingStatus,
        featured: true,
        productInfo: {
          stock: 3,
          weight: 0.35,
          dimensions: 'Ajustable a diferentes cabezas',
          shippingCost: 3000
        }
      },
      {
        providerId: 'orfeberia-atacama-autentica',
        type: 'product',
        category: 'joyeria',
        name: 'Conjunto Collar + Aretes de Plata',
        description: 'Conjunto elegante de collar y aretes de plata ley 925 con acabado brillante. Perfecto como regalo. Incluye estuche de lujo.',
        price: 160000,
        currency: 'CLP',
        images: [
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop'
        ],
        rating: 4.9,
        reviewCount: 22,
        status: 'active' as ListingStatus,
        featured: true,
        productInfo: {
          stock: 5,
          weight: 0.20,
          dimensions: 'Collar 45cm ajustable + aretes',
          shippingCost: 2500
        }
      },
      {
        providerId: 'orfeberia-atacama-autentica',
        type: 'product',
        category: 'joyeria',
        name: 'Broche de Plata - Diseño Cactus',
        description: 'Broche decorativo de plata ley 925 con forma de cactus, símbolo del desierto de Atacama. Accesor único y original.',
        price: 38000,
        currency: 'CLP',
        images: [
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop'
        ],
        rating: 4.6,
        reviewCount: 14,
        status: 'active' as ListingStatus,
        featured: false,
        productInfo: {
          stock: 15,
          weight: 0.10,
          dimensions: '4cm x 3cm',
          shippingCost: 1500
        }
      }
    ]
  }
};

export const allListings = [
  ...marketplaceMockData.ceramicaGress.listings,
  ...marketplaceMockData.orfebreria.listings
] as Listing[];
