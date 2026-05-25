const API_BASE_URL = 'http://localhost:5000/api';

// Допоміжна функція для отримання заголовків з токеном авторизації
function getHeaders(isMultipart = false): HeadersInit {
  const token = localStorage.getItem('rentlocal_token');
  const headers: Record<string, string> = {};
  
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

// Обробка результату запиту
async function handleResponse(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Щось пішло не так');
  }
  return data;
}

export const authAPI = {
  async register(payload: any) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async login(payload: any) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getProfile() {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};

export const categoryAPI = {
  async getCategories() {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};

export interface ListingFilters {
  category?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  location?: string;
}

export const listingAPI = {
  async getListings(filters: ListingFilters = {}) {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.location) params.append('location', filters.location);

    const queryStr = params.toString();
    const url = `${API_BASE_URL}/listings${queryStr ? `?${queryStr}` : ''}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createListing(formData: FormData) {
    const res = await fetch(`${API_BASE_URL}/listings`, {
      method: 'POST',
      headers: getHeaders(true), // multipart headers shouldn't have Content-Type hardcoded (browser sets boundary)
      body: formData,
    });
    return handleResponse(res);
  },

  async getMyListings() {
    const res = await fetch(`${API_BASE_URL}/listings/my`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};

export const bookingAPI = {
  async createBooking(payload: { listingId: number; startDate: string; endDate: string }) {
    const res = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getMyRentals() {
    const res = await fetch(`${API_BASE_URL}/bookings/my-rentals`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getMyRequests() {
    const res = await fetch(`${API_BASE_URL}/bookings/my-requests`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async updateBookingStatus(id: number, status: 'CONFIRMED' | 'REJECTED' | 'CANCELLED') {
    const res = await fetch(`${API_BASE_URL}/bookings/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },
};
