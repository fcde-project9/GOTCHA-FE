export interface Shop {
  id: string;
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
