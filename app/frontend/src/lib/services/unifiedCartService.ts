import { MarketplaceService } from './marketplaceService';
import {
  UnifiedCart,
  CartItem,
  CartByProvider,
  DEFAULT_COMMISSIONS,
} from '@/types/marketplace';

const CART_STORAGE_KEY = 'santurist_unified_cart';

export class UnifiedCartService {
  /**
   * Obtiene el carrito actual del localStorage
   */
  static getCart(userId: string): UnifiedCart {
    const key = `${CART_STORAGE_KEY}_${userId}`;
    const saved = localStorage.getItem(key);

    if (!saved) {
      return this.createEmptyCart(userId);
    }

    try {
      const parsed = JSON.parse(saved);
      // Recalcular totales por si cambió algo
      return this.recalculateTotals(parsed);
    } catch (err) {
      console.error('Error parsing cart:', err);
      return this.createEmptyCart(userId);
    }
  }

  /**
   * Crea un carrito vacío
   */
  private static createEmptyCart(userId: string): UnifiedCart {
    return {
      userId,
      items: [],
      itemsByProvider: [],
      subtotal: 0,
      commission: 0,
      total: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Guarda el carrito en localStorage
   */
  static saveCart(userId: string, cart: UnifiedCart): void {
    const key = `${CART_STORAGE_KEY}_${userId}`;
    const toSave = {
      ...cart,
      createdAt: cart.createdAt instanceof Date
        ? cart.createdAt.toISOString()
        : cart.createdAt,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(toSave));
  }

  /**
   * Agrega un item al carrito
   */
  static async addToCart(
    userId: string,
    listingId: string,
    quantity: number = 1,
    serviceDate?: Date,
    serviceTime?: string
  ): Promise<UnifiedCart> {
    const cart = this.getCart(userId);

    // Obtener datos del listing
    const listing = await MarketplaceService.getById(listingId);
    if (!listing) {
      throw new Error('Listing no encontrado');
    }

    // Verificar si el item ya está en el carrito
    const existingIndex = cart.items.findIndex(i => i.listingId === listingId);

    if (existingIndex >= 0) {
      // Actualizar cantidad
      cart.items[existingIndex].quantity += quantity;
    } else {
      // Agregar nuevo item
      const newItem: CartItem = {
        listingId,
        providerId: listing.providerId,
        baseType: listing.baseType,
        quantity,
        price: listing.price,
        listingName: listing.name,
        image: listing.images[0] || '',
        serviceDate,
        serviceTime,
      };
      cart.items.push(newItem);
    }

    // Reagrupar por proveedor y recalcular
    const updated = this.recalculateTotals(cart);
    this.saveCart(userId, updated);

    return updated;
  }

  /**
   * Elimina un item del carrito
   */
  static removeFromCart(userId: string, listingId: string): UnifiedCart {
    const cart = this.getCart(userId);
    cart.items = cart.items.filter(i => i.listingId !== listingId);

    const updated = this.recalculateTotals(cart);
    this.saveCart(userId, updated);

    return updated;
  }

  /**
   * Actualiza cantidad de un item
   */
  static updateQuantity(
    userId: string,
    listingId: string,
    quantity: number
  ): UnifiedCart {
    const cart = this.getCart(userId);
    const item = cart.items.find(i => i.listingId === listingId);

    if (!item) {
      return cart;
    }

    if (quantity <= 0) {
      return this.removeFromCart(userId, listingId);
    }

    item.quantity = quantity;
    const updated = this.recalculateTotals(cart);
    this.saveCart(userId, updated);

    return updated;
  }

  /**
   * Limpia el carrito
   */
  static clearCart(userId: string): UnifiedCart {
    const empty = this.createEmptyCart(userId);
    this.saveCart(userId, empty);
    return empty;
  }

  /**
   * Recalcula totales del carrito
   */
  private static recalculateTotals(cart: UnifiedCart): UnifiedCart {
    // Reagrupar items por proveedor
    const groupedByProvider = new Map<string, CartItem[]>();

    cart.items.forEach(item => {
      const items = groupedByProvider.get(item.providerId) || [];
      items.push(item);
      groupedByProvider.set(item.providerId, items);
    });

    // Calcular subtotales y comisiones por proveedor
    const itemsByProvider: CartByProvider[] = [];
    let totalSubtotal = 0;
    let totalCommission = 0;

    groupedByProvider.forEach((items, providerId) => {
      const subtotal = items.reduce((acc, item) => {
        return acc + (item.price * item.quantity);
      }, 0);

      const commission = items.reduce((acc, item) => {
        // Usar default rate de comisión (15%)
        const rate = 15;
        return acc + (item.price * item.quantity * (rate / 100));
      }, 0);

      itemsByProvider.push({
        providerId,
        providerName: '', // Se llenarÃ¡ en el checkout
        items,
        subtotal,
      });

      totalSubtotal += subtotal;
      totalCommission += commission;
    });

    return {
      ...cart,
      items: cart.items,
      itemsByProvider,
      subtotal: totalSubtotal,
      commission: totalCommission,
      total: totalSubtotal + totalCommission,
      updatedAt: new Date(),
    };
  }

  /**
   * Obtiene el carrito agrupado por proveedor (para mostrar en UI)
   */
  static getCartGroupedByProvider(userId: string): CartByProvider[] {
    const cart = this.getCart(userId);
    return cart.itemsByProvider;
  }

  /**
   * Obtiene el total del carrito
   */
  static getCartTotal(userId: string): number {
    const cart = this.getCart(userId);
    return cart.total;
  }

  /**
   * Obtiene subtotal (sin comisión)
   */
  static getCartSubtotal(userId: string): number {
    const cart = this.getCart(userId);
    return cart.subtotal;
  }

  /**
   * Obtiene comisión total
   */
  static getCartCommission(userId: string): number {
    const cart = this.getCart(userId);
    return cart.commission;
  }

  /**
   * Obtiene cantidad de items
   */
  static getItemCount(userId: string): number {
    const cart = this.getCart(userId);
    return cart.items.reduce((acc, item) => acc + item.quantity, 0);
  }

  /**
   * Valida que el carrito tenga items
   */
  static hasItems(userId: string): boolean {
    const cart = this.getCart(userId);
    return cart.items.length > 0;
  }

  /**
   * Obtiene el carrito completo listo para checkout
   */
  static getCartForCheckout(userId: string): UnifiedCart {
    return this.getCart(userId);
  }
}
