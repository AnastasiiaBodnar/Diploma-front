export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
}

export interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  deposit: number;
  location: string;
  imageUrl?: string | null;
  imageUrls: string[];
  latitude?: number | null;
  longitude?: number | null;
  userId: number;
  categoryId: number;
  category: Category;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    ownerAvgRating?: number | null;
    ownerReviewCount?: number;
    createdAt?: string;
  };
  createdAt?: string;
  instantBooking?: boolean;
  avgRating?: number | null;
  reviewCount?: number;
  reviews?: any[];
  bookings?: any[];
  checkInTime?: string;
  checkOutTime?: string;
  brokenUntil?: string | null;
}

export interface Booking {
  id: number;
  listingId: number;
  listing: Listing;
  tenantId: number;
  tenant: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export type ViewType = 'listings' | 'create' | 'rentals' | 'requests' | 'mylistings' | 'favorites';
export type AuthMode = 'login' | 'register';

export interface PopularLocation {
  display_name: string;
  lat: number;
  lng: number;
}
