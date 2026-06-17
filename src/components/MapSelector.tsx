import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapSelectorProps {
  initialLatitude?: number | null;
  initialLongitude?: number | null;
  initialLocation?: string;
  onChange: (data: { latitude: number; longitude: number; address: string }) => void;
}

export default function MapSelector({ initialLatitude, initialLongitude, initialLocation = '', onChange }: MapSelectorProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  
  const [searchQuery, setSearchQuery] = useState<string>(initialLocation);
  const [searching, setSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Кастомна іконка у стилі Airbnb Rose
  const customPinIcon = L.divIcon({
    html: `
      <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        width: 38px;
        height: 38px;
        background-color: #FF385C;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        animation: markerBounce 0.3s ease-out;
      ">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
    `,
    className: 'custom-pin-marker-container',
    iconSize: [38, 38],
    iconAnchor: [19, 19]
  });

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Встановлення початкових координат
    const defaultCenter: L.LatLngExpression = 
      initialLatitude && initialLongitude 
        ? [initialLatitude, initialLongitude] 
        : [49.4230, 26.9871]; // Хмельницький за замовчуванням
    
    const zoomLevel = initialLatitude && initialLongitude ? 16 : 13;

    // Ініціалізація карти
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false
      }).setView(defaultCenter, zoomLevel);

      // Додаємо шар карти CartoDB Positron (сріблястий преміальний стиль у дусі Airbnb / Google Maps)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapRef.current);



      // Обробка кліку по карті для встановлення маркера
      mapRef.current.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        await updateMarkerPosition(lat, lng);
      });
    }

    // Додавання маркера на стартову позицію
    if (initialLatitude && initialLongitude && !markerRef.current) {
      markerRef.current = L.marker([initialLatitude, initialLongitude], {
        icon: customPinIcon,
        draggable: true
      }).addTo(mapRef.current);

      // Обробка перетягування маркера
      markerRef.current.on('dragend', async () => {
        const marker = markerRef.current;
        if (marker) {
          const position = marker.getLatLng();
          await updateMarkerPosition(position.lat, position.lng);
        }
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Оновлення позиції маркера та запит зворотного геокодування (lat,lng -> адреса)
  const updateMarkerPosition = async (lat: number, lng: number) => {
    const map = mapRef.current;
    if (!map) return;

    // Створюємо маркер або переміщуємо існуючий
    if (!markerRef.current) {
      markerRef.current = L.marker([lat, lng], {
        icon: customPinIcon,
        draggable: true
      }).addTo(map);

      markerRef.current.on('dragend', async () => {
        const marker = markerRef.current;
        if (marker) {
          const position = marker.getLatLng();
          await updateMarkerPosition(position.lat, position.lng);
        }
      });
    } else {
      markerRef.current.setLatLng([lat, lng]);
    }

    map.panTo([lat, lng]);

    // Робимо запит до Nominatim API для отримання назви адреси українською мовою
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=uk`
      );
      if (!response.ok) throw new Error('Помилка геокодування');
      const data = await response.json();
      
      // Створюємо гарну читабельну адресу
      let address = '';
      if (data.address) {
        const parts = [];
        if (data.address.city || data.address.town || data.address.village) {
          parts.push(data.address.city || data.address.town || data.address.village);
        }
        if (data.address.road) {
          parts.push(data.address.road);
        }
        if (data.address.house_number) {
          parts.push(data.address.house_number);
        }
        address = parts.join(', ');
      }
      
      if (!address) {
        address = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      }

      // Передаємо нові дані батьківському компоненту
      onChange({ latitude: lat, longitude: lng, address });
    } catch (error) {
      console.error('Помилка зворотного геокодування:', error);
      onChange({ latitude: lat, longitude: lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
    }
  };

  // Пошук адреси за текстом (геокодування)
  const handleSearch = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&accept-language=uk&limit=1`
      );
      if (!response.ok) throw new Error('Помилка пошуку');
      const results = await response.json();

      if (results && results.length > 0) {
        const { lat, lon } = results[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);

        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 16);
          await updateMarkerPosition(latitude, longitude);
        }
      } else {
        setSearchError('Адресу не знайдено. Будь ласка, уточніть пошуковий запит.');
      }
    } catch (error) {
      console.error('Помилка пошуку локації:', error);
      setSearchError('Не вдалося знайти адресу через технічну помилку.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '350px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #ccc', marginBottom: '20px' }}>
      {/* Рядок пошуку на карті (замінено на div для уникнення nested form) */}
      <div 
        style={{ 
          position: 'absolute', 
          top: '12px', 
          left: '12px', 
          right: '12px', 
          zIndex: 1000, 
          display: 'flex', 
          gap: '8px', 
          backgroundColor: 'white', 
          padding: '6px', 
          borderRadius: '24px', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
          alignItems: 'center'
        }}
      >
        <input 
          type="text" 
          placeholder="Введіть адресу для пошуку (напр. Львів, вул. Хрещатик)..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch();
            }
          }}
          style={{ 
            border: 'none', 
            outline: 'none', 
            padding: '8px 14px', 
            fontSize: '13px', 
            flex: 1, 
            borderRadius: '20px',
            boxShadow: 'none'
          }}
        />
        <button 
          type="button" 
          disabled={searching}
          onClick={() => handleSearch()}
          style={{ 
            backgroundColor: '#FF385C', 
            color: 'white', 
            border: 'none', 
            borderRadius: '20px', 
            padding: '8px 16px', 
            fontSize: '13px', 
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          {searching ? 'Шукаю...' : 'Знайти'}
        </button>
      </div>

      {/* Повідомлення про помилку пошуку */}
      {searchError && (
        <div 
          style={{ 
            position: 'absolute', 
            top: '68px', 
            left: '12px', 
            right: '12px', 
            zIndex: 1000, 
            backgroundColor: '#fff0f0', 
            color: '#c13515', 
            border: '1px solid #fec7c7', 
            padding: '8px 12px', 
            borderRadius: '8px', 
            fontSize: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          {searchError}
        </div>
      )}

      {/* Контейнер карти */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Підказка знизу */}
      <div 
        style={{ 
          position: 'absolute', 
          bottom: '12px', 
          left: '12px', 
          zIndex: 1000, 
          backgroundColor: 'rgba(0,0,0,0.7)', 
          color: 'white', 
          padding: '6px 12px', 
          borderRadius: '16px', 
          fontSize: '11px',
          pointerEvents: 'none'
        }}
      >
        Клікніть на карті або перетягніть маркер, щоб вибрати точне місце
      </div>
    </div>
  );
}
