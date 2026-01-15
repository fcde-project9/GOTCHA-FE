# Shop Components

## Type Architecture

### Canonical Shop Type

The single source of truth for shop data is defined in `src/types/shop.ts`:

```typescript
export interface Shop {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description?: string;
  imageUrl?: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}
```

### ShopListView Type

For UI display purposes, we use `ShopListView` from `src/utils/shop.ts`:

```typescript
export interface ShopListView {
  id: number;
  name: string;
  distance: string; // Computed: "200m", "1.2km"
  isOpen: boolean; // Computed: based on opening hours
  imageUrl?: string;
}
```

**Why separate types?**

- **Shop**: Represents raw data from the API/database
- **ShopListView**: Represents computed/formatted data for UI display
- Keeps UI concerns separate from domain models
- Allows for different display formats without changing the core type

## Data Transformation

### Converting Shop to ShopListView

Use the utility functions in `src/utils/shop.ts`:

```typescript
import { Shop } from "@/types/shop";
import { toShopListView, toShopListViews } from "@/utils/shop";

// Single shop
const shop: Shop = await fetchShop(id);
const shopView = toShopListView(shop, userLat, userLon);

// Multiple shops
const shops: Shop[] = await fetchShops();
const shopViews = toShopListViews(shops, userLat, userLon);
```

### Computed Fields

#### Distance Calculation

- Uses Haversine formula for accurate geographical distance
- Formats output: `"200m"` for < 1km, `"1.2km"` for >= 1km

#### Open/Closed Status

- Currently returns `true` as placeholder
- TODO: Implement actual opening hours logic when API provides this data

## Components

### ShopListBottomSheet

Displays a scrollable list of shops in a bottom sheet.

**Props:**

```typescript
interface ShopListBottomSheetProps {
  shops: ShopListView[];
}
```

**Usage:**

```typescript
import { ShopListBottomSheet } from "@/components/features/shop";
import { toShopListViews } from "@/utils/shop";

// With API data
const shops = await fetchShops();
const shopViews = toShopListViews(shops, userLat, userLon);
<ShopListBottomSheet shops={shopViews} />

// With mock data (development)
import { mockShops } from "@/data/mockShops";
<ShopListBottomSheet shops={mockShops} />
```

### ShopListItem

Displays a single shop in the list with image, name, status, and distance.

**Props:**

```typescript
interface ShopListItemProps {
  name: string;
  distance: string;
  isOpen: boolean;
  imageUrl?: string;
}
```

### StatusBadge

Shows whether a shop is open or closed.

**Props:**

```typescript
interface StatusBadgeProps {
  isOpen: boolean;
}
```

## Migration Guide

### Before (Duplicate Types ❌)

```typescript
// ShopListBottomSheet.tsx
interface Shop {
  id: number; // Wrong type!
  name: string;
  distance: string;
  isOpen: boolean;
  imageUrl?: string;
}
```

### After (Canonical Types ✅)

```typescript
// ShopListBottomSheet.tsx
import { ShopListView } from "@/utils/shop";

interface ShopListBottomSheetProps {
  shops: ShopListView[];
}
```

### Key Changes

1. **ID Type**: Uses `number` type to match API response (ShopMapResponse.id is number)
2. **Type Location**: Moved from component-local to shared utility
3. **Type Name**: Clarified as `ShopListView` to distinguish from canonical `Shop`
4. **Documentation**: Added JSDoc comments explaining computed fields

## Best Practices

### DO ✅

- Import `Shop` from `@/types/shop` for API/database operations
- Import `ShopListView` from `@/utils/shop` for UI display
- Use transformation utilities (`toShopListView`, `toShopListViews`)
- Keep computed fields (distance, isOpen) in view types only

### DON'T ❌

- Create local Shop interfaces in components
- Mix domain types with view types
- Store computed fields in the canonical Shop type
- Use `number` for IDs (use `string` to match API)

## Future Improvements

### Opening Hours Logic

When API provides opening hours data, update `checkIsOpen()` in `src/utils/shop.ts`:

```typescript
function checkIsOpen(shop: Shop): boolean {
  // Parse shop.openingHours
  // Compare with current time
  // Return true if currently open
}
```

### Sorting/Filtering

Add utilities for common operations:

```typescript
export function sortShopsByDistance(shops: ShopListView[]): ShopListView[];
export function filterOpenShops(shops: ShopListView[]): ShopListView[];
export function filterByRadius(shops: ShopListView[], maxDistance: number): ShopListView[];
```

### Caching

Consider memoizing distance calculations for performance:

```typescript
// Use React.useMemo for computed shop lists
const shopViews = useMemo(
  () => toShopListViews(shops, userLat, userLon),
  [shops, userLat, userLon]
);
```
