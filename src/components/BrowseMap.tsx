import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Booking {
  id: number;
  status: string;
  startDate: string;
  endDate: string;
}

interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  deposit: number;
  location: string;
  imageUrl?: string | null;
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
  };
  bookings?: Booking[];
}

interface BrowseMapProps {
  listings: Listing[];
  onListingSelect: (listing: Listing) => void;
  selectedListing: Listing | null;
  mapCenter?: [number, number] | null;
}

export default function BrowseMap({ listings, onListingSelect, selectedListing, mapCenter }: BrowseMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: number]: L.Marker }>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Ініціалізація карти, якщо вона ще не ініціалізована
    if (!mapRef.current) {
      // За замовчуванням центруємо на Хмельницький, якщо немає координат
      const defaultCenter: L.LatLngExpression = [49.4230, 26.9871];
      
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false, // прибираємо стандартний зум, щоб зробити гарний кастомний
      }).setView(defaultCenter, 13);

      // Додаємо шар карти CartoDB Positron (сріблястий преміальний стиль у дусі Airbnb / Google Maps)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapRef.current);


    }

    return () => {
      // Очищення при розмонтуванні
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Оновлення маркерів при зміні списку оголошень
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Спочатку видаляємо всі старі маркери
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    const listingsWithCoords = listings.filter(
      item => item.latitude !== undefined && item.latitude !== null &&
              item.longitude !== undefined && item.longitude !== null
    );

    if (listingsWithCoords.length === 0) return;

    const bounds: L.LatLngExpression[] = [];

    listingsWithCoords.forEach(listing => {
      const lat = listing.latitude as number;
      const lng = listing.longitude as number;
      bounds.push([lat, lng]);

      const isSelected = selectedListing?.id === listing.id;

      // Обрізаємо назву речі, щоб мітка залишалася компактною
      const displayTitle = listing.title.length > 12 ? listing.title.slice(0, 12) + '...' : listing.title;

      const priceIcon = L.divIcon({
        html: `
          <div class="map-price-marker ${isSelected ? 'selected' : ''}">
            <div class="marker-title">${displayTitle}</div>
            <div class="marker-price">${listing.price} ₴</div>
          </div>
        `,
        className: 'map-price-marker-container',
        iconSize: [120, 44],
        iconAnchor: [60, 22],
        popupAnchor: [0, -22]
      });

      const marker = L.marker([lat, lng], { icon: priceIcon }).addTo(map);

      // Гарне спливаюче вікно з прев'ю товару/житла
      const popupContent = document.createElement('div');
      popupContent.className = 'map-popup-card';
      popupContent.innerHTML = `
        ${listing.imageUrl ? `<img src="${listing.imageUrl}" alt="${listing.title}" class="map-popup-image" />` : `<div class="map-popup-placeholder">Фото відсутнє</div>`}
        <div class="map-popup-title">${listing.title}</div>
        <div class="map-popup-category">${listing.category?.name || ''} • ${listing.location}</div>
        <div class="map-popup-price-row">
          <span class="map-popup-price">
            ${listing.price} ₴ <span class="map-popup-price-unit">/ ніч</span>
          </span>
          <button class="map-popup-btn" id="popup-btn-${listing.id}">Переглянути</button>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 240,
        className: 'custom-leaflet-popup'
      });

      // Обробка події кліку на кнопку всередині попупу
      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-btn-${listing.id}`);
        if (btn) {
          btn.onclick = (e) => {
            e.stopPropagation();
            onListingSelect(listing);
          };
        }
      });

      marker.on('click', () => {
        // Оновити виділене оголошення
        onListingSelect(listing);
      });

      marker.on('mouseover', () => {
        marker.openPopup();
      });

      markersRef.current[listing.id] = marker;
    });

    // Масштабуємо карту, щоб було видно всі маркери
    if (bounds.length > 0) {
      map.fitBounds(L.latLngBounds(bounds), {
        padding: [40, 40],
        maxZoom: 15
      });
    }
  }, [listings, selectedListing, onListingSelect]);

  // Сфокусувати на маркері, якщо оголошення вибрано ззовні
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedListing) return;

    const lat = selectedListing.latitude;
    const lng = selectedListing.longitude;

    if (lat !== undefined && lat !== null && lng !== undefined && lng !== null) {
      map.setView([lat, lng], 15, { animate: true });
      
      const marker = markersRef.current[selectedListing.id];
      if (marker && !marker.isPopupOpen()) {
        marker.openPopup();
      }
    }
  }, [selectedListing]);

  // Сфокусувати на вибраному центрі ззовні (наприклад, при виборі автокомпліту)
  useEffect(() => {
    const map = mapRef.current;
    if (map && mapCenter) {
      map.setView(mapCenter, 12, { animate: true });
    }
  }, [mapCenter]);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ 
        width: '100%', 
        height: '100%', 
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #e0e0e0',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
      }} 
    />
  );
}
