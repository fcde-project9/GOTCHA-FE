import { ShopMapResponse } from "@/types/api";
import { Shop } from "@/types/shop";

/**
 * ShopListView represents the subset of Shop data needed for list display
 * with computed fields for UI presentation
 */
export interface ShopListView {
  id: number;
  name: string;
  distance: string; // Computed field (e.g., "200m", "1.2km")
  isOpen: boolean; // Computed field based on opening hours
  imageUrl?: string;
}

/**
 * Calculate distance from user location to shop in meters
 * Uses Haversine formula for calculating distance between two coordinates
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Format distance in meters to human-readable string
 * @param meters - Distance in meters
 * @returns Formatted string (e.g., "200m", "1.2km")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Check if shop is currently open based on opening hours
 * TODO: Implement actual opening hours check when API provides this data
 * For now, returns true as placeholder
 */
function checkIsOpen(_shop: Shop): boolean {
  // TODO: Parse opening hours from shop data
  // For now, return true as placeholder
  return true;
}

/**
 * Transform canonical Shop to ShopListView for list display
 * Computes distance and opening status for UI
 *
 * @param shop - Canonical shop data from API
 * @param userLatitude - User's current latitude
 * @param userLongitude - User's current longitude
 * @returns ShopListView with computed display fields
 */
export function toShopListView(
  shop: Shop,
  userLatitude: number,
  userLongitude: number
): ShopListView {
  const distanceInMeters = calculateDistance(
    userLatitude,
    userLongitude,
    shop.latitude,
    shop.longitude
  );

  return {
    id: shop.id,
    name: shop.name,
    distance: formatDistance(distanceInMeters),
    isOpen: checkIsOpen(shop),
    imageUrl: shop.imageUrl,
  };
}

/**
 * Transform array of Shops to ShopListViews
 * Convenience wrapper for mapping multiple shops
 */
export function toShopListViews(
  shops: Shop[],
  userLatitude: number,
  userLongitude: number
): ShopListView[] {
  return shops.map((shop) => toShopListView(shop, userLatitude, userLongitude));
}

/**
 * Transform ShopMapResponse from API to ShopListView for display
 * @param shopResponse - API 응답 데이터
 * @returns ShopListView with display fields
 */
export function shopMapResponseToView(shopResponse: ShopMapResponse): ShopListView {
  return {
    id: shopResponse.id,
    name: shopResponse.name,
    distance: shopResponse.distance,
    isOpen: shopResponse.isOpen,
    imageUrl: shopResponse.mainImageUrl,
  };
}

/**
 * Transform array of ShopMapResponse to ShopListViews
 */
export function shopMapResponsesToViews(shopResponses: ShopMapResponse[]): ShopListView[] {
  return shopResponses.map((shop) => shopMapResponseToView(shop));
}
