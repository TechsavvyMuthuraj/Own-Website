"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { Resource, Coupon } from "@/types/database";

export interface CartItem {
  id: string;
  resource: Resource;
  price: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (resource: Resource) => boolean;
  removeItem: (resourceId: string) => void;
  clearCart: () => void;
  isInCart: (resourceId: string) => boolean;
  subtotal: number;
  discount: number;
  total: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "antigravity_cart_items_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load cart from storage", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage when items change
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error("Failed to save cart to storage", e);
      }
    }
  }, [items, isInitialized]);

  const addItem = (resource: Resource): boolean => {
    if (items.some((item) => item.resource.id === resource.id)) {
      return false; // Already in cart
    }
    const itemPrice = resource.sale_price !== null ? resource.sale_price : resource.price;
    setItems((prev) => [...prev, { id: resource.id, resource, price: Number(itemPrice) }]);
    return true;
  };

  const removeItem = (resourceId: string) => {
    setItems((prev) => prev.filter((item) => item.resource.id !== resourceId));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const isInCart = (resourceId: string) => {
    return items.some((item) => item.resource.id === resourceId);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);

  let discount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.min_order) {
    if (appliedCoupon.discount_type === "PERCENTAGE") {
      discount = (subtotal * appliedCoupon.discount_value) / 100;
      if (appliedCoupon.max_discount && discount > appliedCoupon.max_discount) {
        discount = appliedCoupon.max_discount;
      }
    } else {
      discount = appliedCoupon.discount_value;
    }
  }

  const total = Math.max(0, subtotal - discount);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearCart,
        isInCart,
        subtotal,
        discount,
        total,
        appliedCoupon,
        applyCoupon: (coupon) => setAppliedCoupon(coupon),
        removeCoupon: () => setAppliedCoupon(null),
        itemCount: items.length,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
