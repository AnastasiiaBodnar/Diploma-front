import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { authAPI, categoryAPI, listingAPI, bookingAPI, notificationAPI, reviewAPI, favoriteAPI } from './services/api';
import type { ListingFilters } from './services/api';
import BrowseMap from './components/BrowseMap';
import MapSelector from './components/MapSelector';
import './App.css';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
}

interface Listing {
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
  instantBooking?: boolean; // Додано поле гібридного бронювання
  avgRating?: number | null;
  reviewCount?: number;
  reviews?: any[];
  bookings?: any[];
  checkInTime?: string;
  checkOutTime?: string;
  brokenUntil?: string | null;
}

interface Booking {
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

interface Notification {
  id: number;
  userId: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

type ViewType = 'listings' | 'create' | 'rentals' | 'requests' | 'mylistings' | 'favorites';
type AuthMode = 'login' | 'register';

const POPULAR_UKRAINIAN_LOCATIONS = [
  // Обласні центри та регіони
  { display_name: "Київ", lat: 50.4501, lng: 30.5234 },
  { display_name: "Київська область", lat: 50.4501, lng: 30.5234 },
  { display_name: "Хмельницький, Хмельницька область", lat: 49.4230, lng: 26.9871 },
  { display_name: "Хмельницька область", lat: 49.5393, lng: 26.8722 },
  { display_name: "Львів, Львівська область", lat: 49.8397, lng: 24.0297 },
  { display_name: "Львівська область", lat: 49.8397, lng: 24.0297 },
  { display_name: "Одеса, Одеська область", lat: 46.4825, lng: 30.7233 },
  { display_name: "Харків, Харківська область", lat: 50.0038, lng: 36.2304 },
  { display_name: "Дніпро, Дніпропетровська область", lat: 48.4647, lng: 35.0462 },
  { display_name: "Запоріжжя, Запорізька область", lat: 47.8388, lng: 35.1396 },
  { display_name: "Вінниця, Вінницька область", lat: 49.2331, lng: 28.4682 },
  { display_name: "Івано-Франківськ, Івано-Франківська область", lat: 48.9226, lng: 24.7111 },
  { display_name: "Тернопіль, Тернопільська область", lat: 49.5535, lng: 25.5948 },
  { display_name: "Чернівці, Чернівецька область", lat: 48.2908, lng: 25.9343 },
  { display_name: "Рівне, Рівненська область", lat: 50.6199, lng: 26.2516 },
  { display_name: "Луцьк, Волинська область", lat: 50.7472, lng: 25.3254 },
  { display_name: "Ужгород, Закарпатська область", lat: 48.6208, lng: 22.2879 },
  { display_name: "Житомир, Житомирська область", lat: 50.2547, lng: 28.6587 },
  { display_name: "Полтава, Полтавська область", lat: 49.5883, lng: 34.5514 },
  { display_name: "Черкаси, Черкаська область", lat: 49.4444, lng: 32.0598 },
  { display_name: "Суми, Сумська область", lat: 50.9077, lng: 34.7981 },
  { display_name: "Чернігів, Чернігівська область", lat: 51.4982, lng: 31.2893 },
  { display_name: "Кропивницький, Кіровоградська область", lat: 48.5079, lng: 32.2623 },
  { display_name: "Херсон, Херсонська область", lat: 46.6354, lng: 32.6169 },
  { display_name: "Миколаїв, Миколаївська область", lat: 46.9750, lng: 31.9950 },
  { display_name: "Донецьк, Донецька область", lat: 48.0159, lng: 37.8028 },
  { display_name: "Луганськ, Луганська область", lat: 48.5740, lng: 39.3078 },
  { display_name: "Сімферополь, АР Крим", lat: 44.9521, lng: 34.1024 },
  { display_name: "Севастополь", lat: 44.6166, lng: 33.5254 },
  
  // Міста на "Горо" (як на Airbnb!)
  { display_name: "Городок, Львівська область", lat: 49.7847, lng: 23.6489 },
  { display_name: "Городок, Хмельницька область", lat: 49.1672, lng: 26.5794 },
  { display_name: "Горохів, Волинська область", lat: 50.4994, lng: 24.7645 },
  { display_name: "Городенка, Івано-Франківська область", lat: 48.6678, lng: 25.5002 },
  { display_name: "Городище, Черкаська область", lat: 49.2889, lng: 31.4452 },
  { display_name: "Городня, Чернігівська область", lat: 51.8906, lng: 31.5794 },
  
  // Інші великі та районні міста України
  { display_name: "Кам'янець-Подільський, Хмельницька область", lat: 48.6780, lng: 26.5847 },
  { display_name: "Хмільник, Вінницька область", lat: 49.5574, lng: 27.9547 },
  { display_name: "Кривий Ріг, Дніпропетровська область", lat: 47.9105, lng: 33.3918 },
  { display_name: "Маріуполь, Донецька область", lat: 47.0971, lng: 37.5439 },
  { display_name: "Кременчук, Полтавська область", lat: 49.0630, lng: 33.4116 },
  { display_name: "Біла Церква, Київська область", lat: 49.8025, lng: 30.1167 },
  { display_name: "Бровари, Київська область", lat: 50.5108, lng: 30.7917 },
  { display_name: "Бориспіль, Київська область", lat: 50.3506, lng: 30.9528 },
  { display_name: "Ірпінь, Київська область", lat: 50.5217, lng: 30.2447 },
  { display_name: "Буча, Київська область", lat: 50.5489, lng: 30.2208 },
  { display_name: "Васильків, Київська область", lat: 50.1783, lng: 30.3158 },
  { display_name: "Фастів, Київська область", lat: 50.0789, lng: 29.9172 },
  { display_name: "Обухів, Київська область", lat: 50.1136, lng: 30.6231 },
  { display_name: "Вишгород, Київська область", lat: 50.5833, lng: 30.4833 },
  { display_name: "Дрогобич, Львівська область", lat: 49.3508, lng: 23.5061 },
  { display_name: "Стрий, Львівська область", lat: 49.2558, lng: 23.8458 },
  { display_name: "Самбір, Львівська область", lat: 49.5183, lng: 23.1975 },
  { display_name: "Трускавець, Львівська область", lat: 49.2789, lng: 23.5047 },
  { display_name: "Золочів, Львівська область", lat: 49.8064, lng: 24.8961 },
  { display_name: "Умань, Черкаська область", lat: 48.7483, lng: 30.2214 },
  { display_name: "Сміла, Черкаська область", lat: 49.2125, lng: 31.8742 },
  { display_name: "Бердичів, Житомирська область", lat: 49.8978, lng: 28.5839 },
  { display_name: "Коростень, Житомирська область", lat: 50.9489, lng: 28.6475 },
  { display_name: "Ковель, Волинська область", lat: 51.2167, lng: 24.7167 },
  { display_name: "Нововолинськ, Волинська область", lat: 50.7333, lng: 24.1667 },
  { display_name: "Мукачево, Закарпатська область", lat: 48.4414, lng: 22.7214 },
  { display_name: "Хуст, Закарпатська область", lat: 48.1764, lng: 23.2936 },
  { display_name: "Берегове, Закарпатська область", lat: 48.2039, lng: 22.6436 },
  { display_name: "Коломия, Івано-Франківська область", lat: 48.5283, lng: 25.0389 },
  { display_name: "Калуш, Івано-Франківська область", lat: 49.0275, lng: 24.3606 },
  { display_name: "Шепетівка, Хмельницька область", lat: 50.1856, lng: 27.0678 },
  { display_name: "Нетішин, Хмельницька область", lat: 50.3292, lng: 26.6508 },
  { display_name: "Славута, Хмельницька область", lat: 50.2989, lng: 26.8667 },
  { display_name: "Старокостянтинів, Хмельницька область", lat: 49.7544, lng: 27.2206 },
  { display_name: "Чортків, Тернопільська область", lat: 49.0125, lng: 25.7972 },
  { display_name: "Кременець, Тернопільська область", lat: 50.0967, lng: 25.7236 },
  { display_name: "Дубно, Рівненська область", lat: 50.4011, lng: 25.7369 },
  { display_name: "Сарни, Рівненська область", lat: 51.3328, lng: 26.6022 },
  { display_name: "Шостка, Сумська область", lat: 51.8619, lng: 33.4867 },
  { display_name: "Конотоп, Сумська область", lat: 51.2425, lng: 33.2036 },
  { display_name: "Олександрія, Кіровоградська область", lat: 48.6708, lng: 33.1189 },
  { display_name: "Горішні Плавні, Полтавська область", lat: 49.0089, lng: 33.6439 },
  { display_name: "Миргород, Полтавська область", lat: 49.9658, lng: 33.6128 }
];

const renderHighlightedText = (text: string, highlight: string) => {
  if (!highlight.trim()) return <span>{text}</span>;
  
  const lowerText = text.toLowerCase();
  const lowerHighlight = highlight.toLowerCase().trim();
  const index = lowerText.indexOf(lowerHighlight);
  
  if (index === -1) return <span>{text}</span>;
  
  const before = text.substring(0, index);
  const match = text.substring(index, index + lowerHighlight.length);
  const after = text.substring(index + lowerHighlight.length);
  
  return (
    <span>
      {before}
      <strong style={{ fontWeight: 800, color: '#222222' }}>{match}</strong>
      {after}
    </span>
  );

};

const CATEGORY_PHOTOS: Record<string, string[]> = {
  tools: [
    'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1534224039826-c7a0dea0e66a?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&q=80'
  ],
  electronics: [
    'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80'
  ],
  sport: [
    'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&w=600&q=80'
  ],
  tourism: [
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1486915309851-b0cc1f8a0084?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1533873984035-25970ab07461?auto=format&fit=crop&w=600&q=80'
  ],
  transport: [
    'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=600&q=80'
  ],
  'photo-video': [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=600&q=80'
  ],
  clothing: [
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=600&q=80'
  ],
  'home-garden': [
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1413977886085-3bbbf9a7cf6e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80'
  ],
  kids: [
    'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1515488042361-404e9250afef?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1555448248-2571daf6344b?auto=format&fit=crop&w=600&q=80'
  ],
  hobbies: [
    'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80'
  ]
};

const DEFAULT_PHOTOS = [
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=600&q=80'
];

function getGalleryPhotos(listing: Listing | null): string[] {
  if (!listing) return [];
  if (listing.imageUrls && listing.imageUrls.length > 0) {
    return listing.imageUrls;
  }
  const mainPhoto = listing.imageUrl || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80';
  const categorySlug = listing.category?.slug || '';
  const subPhotos = CATEGORY_PHOTOS[categorySlug] || DEFAULT_PHOTOS;
  return [mainPhoto, ...subPhotos].slice(0, 5);
}

function getCategorySvgIcon(slug: string) {
  const stroke = "currentColor";
  const fill = "none";
  const strokeWidth = 2;
  
  switch (slug) {
    case 'tools':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 1 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77Z" />
        </svg>
      );
    case 'electronics':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" strokeLinecap="round" />
        </svg>
      );
    case 'sport':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <path d="M6.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM17.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM12 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM6.5 15.5H12M12 15.5h5.5M12 5.5v10" />
        </svg>
      );
    case 'tourism':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <path d="m19 20-7-14-7 14M12 6v14M5 20h14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'transport':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 1 13v3c0 .6.4 1 1 1h2" />
          <circle cx="7" cy="17" r="2" />
          <circle cx="17" cy="17" r="2" />
        </svg>
      );
    case 'photo-video':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      );
    case 'clothing':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <path d="M12 2a2 2 0 0 1 2 2c0 .7-.3 1.3-.8 1.7L22 13.5a1 1 0 0 1-.5 1.5H2.5a1 1 0 0 1-.5-1.5l8.8-7.8c-.5-.4-.8-1-.8-1.7a2 2 0 0 1 2-2Z" />
        </svg>
      );
    case 'home-garden':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case 'kids':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <path d="M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM12 6V2M12 2H9M6 12H2M18 12h4" strokeLinecap="round" />
        </svg>
      );
    case 'hobbies':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="9" cy="9" r="1" fill="currentColor" />
          <circle cx="15" cy="15" r="1" fill="currentColor" />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <polyline points="16.5 9.4 7.55 4.24 3 6.82 12.5 12 21 7 16.5 9.4" />
          <line x1="12" y1="22" x2="12" y2="12" />
          <polyline points="12 12.02 3.5 7.1 3.5 16.5 12 22" />
          <polyline points="20.5 7.15 20.5 16.5 12 22" />
        </svg>
      );
  }
}

function App() {
  // Користувач та авторизація
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');

  // Основний контент
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeView, setActiveView] = useState<ViewType>('listings');
  
  // Фільтрація
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [locationQuery, setLocationQuery] = useState<string>('');
  const [minPriceQuery, setMinPriceQuery] = useState<string>('');
  const [maxPriceQuery, setMaxPriceQuery] = useState<string>('');

  // Фільтрація для "Мої оголошення"
  const [mySearchQuery, setMySearchQuery] = useState<string>('');
  const [myCategoryFilter, setMyCategoryFilter] = useState<string>('');
  const [myStatusFilter, setMyStatusFilter] = useState<string>('all'); // all, active, repair
  const [showMyCategoryDropdown, setShowMyCategoryDropdown] = useState<boolean>(false);
  const [showMyStatusDropdown, setShowMyStatusDropdown] = useState<boolean>(false);

  // Фільтрація для "Мої оренди"
  const [rentalsSearchQuery, setRentalsSearchQuery] = useState<string>('');

  // Модалка перегляду
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [bookedDates, setBookedDates] = useState<{ startDate: string; endDate: string }[]>([]); // Зайняті дати речі

  // Створення оголошення
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newPrice, setNewPrice] = useState<string>('');
  const [newDeposit, setNewDeposit] = useState<string>('');
  const [newLocation, setNewLocation] = useState<string>('');
  const [newCategoryId, setNewCategoryId] = useState<string>('');
  const [newLatitude, setNewLatitude] = useState<number | null>(null);
  const [newLongitude, setNewLongitude] = useState<number | null>(null);
  const [newInstantBooking, setNewInstantBooking] = useState<boolean>(false); // Поле миттєвого бронювання
  const [newCheckInTime, setNewCheckInTime] = useState<string>('14:00');
  const [newCheckOutTime, setNewCheckOutTime] = useState<string>('12:00');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Редагування оголошення
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editPrice, setEditPrice] = useState<string>('');
  const [editDeposit, setEditDeposit] = useState<string>('');
  const [editLocation, setEditLocation] = useState<string>('');
  const [editCategoryId, setEditCategoryId] = useState<string>('');
  const [editLatitude, setEditLatitude] = useState<number | null>(null);
  const [editLongitude, setEditLongitude] = useState<number | null>(null);
  const [editInstantBooking, setEditInstantBooking] = useState<boolean>(false);
  const [editCheckInTime, setEditCheckInTime] = useState<string>('14:00');
  const [editCheckOutTime, setEditCheckOutTime] = useState<string>('12:00');
  const [editImageFiles, setEditImageFiles] = useState<File[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);
  const [shouldReplaceImages, setShouldReplaceImages] = useState<boolean>(false);

  // Сповіщення (Notification Bell)
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Стан для модального вікна повідомлення про поломку (Ремонт)
  const [isRepairModalOpen, setIsRepairModalOpen] = useState<boolean>(false);
  const [repairListingId, setRepairListingId] = useState<number | null>(null);
  const [repairUntilDate, setRepairUntilDate] = useState<string>('');
  const [repairReason, setRepairReason] = useState<string>('');

  // Стан для кастомного діалогу підтвердження дій
  const [confirmAction, setConfirmAction] = useState<{ message: string; onConfirm: () => void } | null>(null);

  // Кастомний інтерактивний календар
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  // Стейт-змінні для форми відгуків
  const [reviewRating, setReviewRating] = useState<number>(0);
  const [reviewHoverRating, setReviewHoverRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>('');

  // Перемикач карти на мобільних пристроях
  const [isMobileMapOpen, setIsMobileMapOpen] = useState<boolean>(false);

  // Чи показувати карту на головній сторінці (тільки при фільтрі локації)
  const [showMap, setShowMap] = useState<boolean>(false);

  interface LocationSuggestion {
    display_name: string;
    lat: number;
    lng: number;
  }

  // Стейт-змінні для автозаповнення локацій (як на Airbnb)
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

  // Кабінети
  const [myRentals, setMyRentals] = useState<Booking[]>([]);
  const [myRequests, setMyRequests] = useState<Booking[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);

  // Системні сповіщення та завантаження
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Airbnb Редизайн Стейт-Змінні
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState<boolean>(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [lightboxPhotoIndex, setLightboxPhotoIndex] = useState<number>(0);
  const [isMobileView, setIsMobileView] = useState<boolean>(window.innerWidth <= 768);

  // Обране (Збережені оголошення)
  const [savedListingIds, setSavedListingIds] = useState<number[]>([]);
  const [favoriteListings, setFavoriteListings] = useState<Listing[]>([]);

  const handleGuestAction = () => {
    setAuthMode('login');
    setIsAuthOpen(true);
  };

  const loadFavoritesList = async (showLoading = false) => {
    if (!currentUser) return;
    if (showLoading) setLoading(true);
    try {
      const items = await favoriteAPI.getFavorites();
      setFavoriteListings(items);
      setSavedListingIds(items.map((item: any) => item.id));
    } catch (err: any) {
      console.error('Failed to load favorites list', err);
      if (showLoading) setErrorMsg(err.message || 'Не вдалося завантажити обрані оголошення');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadFavoritesList();
    } else {
      setSavedListingIds([]);
      setFavoriteListings([]);
    }
  }, [currentUser]);

  useEffect(() => {
    if (activeView === 'favorites' && currentUser) {
      loadFavoritesList(true);
    }
  }, [activeView]);

  const toggleSaveListing = async (id: number) => {
    if (!currentUser) {
      handleGuestAction();
      return;
    }
    
    // Optimistic UI update
    const isCurrentlySaved = savedListingIds.includes(id);
    setSavedListingIds(prev => 
      isCurrentlySaved ? prev.filter(item => item !== id) : [...prev, id]
    );
    
    try {
      const res = await favoriteAPI.toggleFavorite(id);
      setSuccessMsg(res.message);
      loadFavoritesList();
    } catch (err: any) {
      setErrorMsg(err.message || 'Не вдалося змінити список обраного');
      // Rollback
      setSavedListingIds(prev => 
        isCurrentlySaved ? [...prev, id] : prev.filter(item => item !== id)
      );
    }
  };

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // Ініціалізація даних (завантаження профілю та категорій)
  useEffect(() => {
    const token = localStorage.getItem('rentlocal_token');
    if (token) {
      loadUserProfile();
    }
    loadCategories();

    // Перевірка query-параметра для відкриття конкретного оголошення
    const params = new URLSearchParams(window.location.search);
    const listingIdStr = params.get('listing');
    if (listingIdStr) {
      const listingId = parseInt(listingIdStr, 10);
      if (!isNaN(listingId)) {
        loadListingDetails(listingId);
      }
    }
  }, []);

  // Перевантаження списків при зміні вкладок, користувача або фільтру категорії (миттєвий пошук)
  useEffect(() => {
    if (activeView === 'listings') {
      loadListings();
    } else if (activeView === 'rentals' && currentUser) {
      loadMyRentals();
    } else if (activeView === 'requests' && currentUser) {
      loadMyRequests();
    } else if (activeView === 'mylistings' && currentUser) {
      loadMyListings();
    }
  }, [activeView, currentUser, selectedCategory]);

  // Очищення сповіщень через кілька секунд
  useEffect(() => {
    if (errorMsg || successMsg) {
      const timer = setTimeout(() => {
        setErrorMsg(null);
        setSuccessMsg(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg, successMsg]);

  // Завантаження сповіщень та періодичне опитування (кожні 15 секунд)
  useEffect(() => {
    if (currentUser) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 15000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [currentUser]);

  // Завантаження зайнятих дат при зміні обраного оголошення
  useEffect(() => {
    if (selectedListing) {
      loadListingAvailability(selectedListing.id);
    } else {
      setBookedDates([]);
    }
  }, [selectedListing]);

  // Ефект автозаповнення локацій з дебаунсом (миттєві пропозиції на основі локального списку + фоновий пошук Nominatim)
  useEffect(() => {
    const query = locationQuery.trim().toLowerCase();

    // Якщо поле пусте, відразу пропонуємо перші 5 популярних міст України
    if (!query) {
      setLocationSuggestions(POPULAR_UKRAINIAN_LOCATIONS.slice(0, 5));
      return;
    }

    // 1. МИТТЄВИЙ ЛОКАЛЬНИЙ ПОШУК (0ms затримки)
    const localMatches = POPULAR_UKRAINIAN_LOCATIONS.filter(loc => {
      const displayName = loc.display_name.toLowerCase();
      const nameParts = displayName.split(',').map(p => p.trim());
      // Перевіряємо префіксний пошук по частинах назви
      return displayName.startsWith(query) || nameParts.some(part => part.startsWith(query));
    });

    // Оновлюємо список пропозицій миттєво!
    setLocationSuggestions(localMatches.slice(0, 5));

    // 2. ДЕБАУНСОВАНИЙ ФОНОВИЙ ЗАПИТ ДО NOMINATIM для пошуку інших міст
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}&accept-language=uk&countrycodes=ua&limit=30`
        );
        if (response.ok) {
          const results = await response.json();
          
          // Розумна фільтрація: залишаємо лише населені пункти та області України
          const settlements = results.filter((item: any) => {
            const isPlaceOrBoundary = item.class === 'place' || item.class === 'boundary';
            const forbiddenTypes = ['postcode', 'railway', 'station', 'bus_stop', 'highway', 'street', 'house'];
            if (!isPlaceOrBoundary || forbiddenTypes.includes(item.type)) return false;

            const displayName = item.display_name.toLowerCase();
            const nameParts = displayName.split(',').map((p: string) => p.trim());
            const cityName = nameParts[0];

            return cityName.startsWith(query) || nameParts.some((part: string) => part.startsWith(query));
          });

          // Форматуємо назви
          const parsed = settlements.map((item: any) => {
            const parts = item.display_name.split(',');
            const display = parts.slice(0, 3).map((p: string) => p.trim()).join(', ');
            return {
              display_name: display,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon)
            };
          });

          // Об'єднуємо миттєві локальні результати із новими серверними без дублікатів
          setLocationSuggestions(prev => {
            const seen = new Set(prev.map(s => s.display_name));
            const newSuggestions = [...prev];
            for (const sug of parsed) {
              if (!seen.has(sug.display_name)) {
                seen.add(sug.display_name);
                newSuggestions.push(sug);
              }
            }
            return newSuggestions.slice(0, 5);
          });
        }
      } catch (error) {
        console.error('Помилка автокомпліту локацій:', error);
      }
    }, 150); // 150ms debounce для API

    return () => clearTimeout(delayDebounceFn);
  }, [locationQuery]);

  // Закриття підказок та випадних меню при кліку ззовні
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.filter-segment')) {
        setShowSuggestions(false);
      }
      if (!target.closest('.profile-menu-container')) {
        setIsProfileMenuOpen(false);
      }
      if (!target.closest('.notifications-container')) {
        setIsNotificationsOpen(false);
      }
      if (!target.closest('.rozetka-filter-segment')) {
        setShowMyCategoryDropdown(false);
        setShowMyStatusDropdown(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Завантаження профілю користувача
  const loadUserProfile = async () => {
    try {
      const profile = await authAPI.getProfile();
      setCurrentUser(profile);
    } catch (err: any) {
      console.error('Не вдалося завантажити профіль:', err.message);
      localStorage.removeItem('rentlocal_token');
      setCurrentUser(null);
    }
  };

  // Завантаження сповіщень
  const loadNotifications = async () => {
    try {
      const data = await notificationAPI.getMyNotifications();
      setNotifications(data);
    } catch (err: any) {
      console.error('Не вдалося завантажити сповіщення:', err.message);
    }
  };

  // Позначення сповіщення як прочитаного
  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err: any) {
      console.error('Помилка позначення сповіщення як прочитаного:', err.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length === 0) return;
    try {
      await Promise.all(unread.map(n => notificationAPI.markAsRead(n.id)));
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err: any) {
      console.error('Помилка позначення всіх сповіщень як прочитаних:', err.message);
    }
  };

  // Завантаження зайнятих дат речі
  const loadListingAvailability = async (listingId: number) => {
    try {
      const dates = await listingAPI.getListingAvailability(listingId);
      setBookedDates(dates);
    } catch (err: any) {
      console.error('Помилка завантаження зайнятих дат:', err.message);
    }
  };

  // Завантаження деталей конкретного оголошення
  const loadListingDetails = async (id: number) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const item = await listingAPI.getListingById(id);
      setSelectedListing(item);
    } catch (err: any) {
      setErrorMsg(err.message || 'Не вдалося завантажити деталі оголошення');
    } finally {
      setLoading(false);
    }
  };


  // Допоміжна функція отримання дати без часових зсувів
  const getLocalDateString = (dateObjOrStr: Date | string) => {
    const d = new Date(dateObjOrStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Перевірка зайнятості для заїзду (Check-in)
  const isDateBusyForCheckIn = (dateStr: string) => {
    return bookedDates.some(bd => {
      const startStr = getLocalDateString(bd.startDate);
      const endStr = getLocalDateString(bd.endDate);
      return dateStr >= startStr && dateStr < endStr;
    });
  };

  // Перевірка зайнятості для виїзду (Check-out)
  const isDateBusyForCheckOut = (dateStr: string) => {
    return bookedDates.some(bd => {
      const startStr = getLocalDateString(bd.startDate);
      const endStr = getLocalDateString(bd.endDate);
      return dateStr > startStr && dateStr <= endStr;
    });
  };

  // Клік на день у кастомному календарі
  const handleDayClick = (dateStr: string) => {
    if (isDateInPast(dateStr)) return;

    if (!startDate || (startDate && endDate)) {
      if (isDateBusyForCheckIn(dateStr)) return;
      setStartDate(dateStr);
      setEndDate('');
    } else {
      if (dateStr < startDate) {
        if (isDateBusyForCheckIn(dateStr)) return;
        setStartDate(dateStr);
        setEndDate('');
      } else if (dateStr === startDate) {
        setStartDate('');
        setEndDate('');
      } else {
        // Перевіряємо, чи немає зайнятих дат всередині діапазону
        const hasOverlap = bookedDates.some(bd => {
          const startStr = getLocalDateString(bd.startDate);
          const endStr = getLocalDateString(bd.endDate);
          return startDate < endStr && dateStr > startStr;
        });

        const isEndBusy = isDateBusyForCheckOut(dateStr);

        if (hasOverlap || isEndBusy) {
          if (isDateBusyForCheckIn(dateStr)) return;
          setStartDate(dateStr);
          setEndDate('');
        } else {
          setEndDate(dateStr);
        }
      }
    }
  };

  const isDateInPast = (dateStr: string) => {
    const d = new Date(dateStr);
    d.setHours(0,0,0,0);
    const today = new Date();
    today.setHours(0,0,0,0);
    return d < today;
  };

  const calculateSelectedNights = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) return 0;
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatCalendarDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Розрахунок масиву днів для рендерингу місяця
  const getMonthDays = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    
    // Перший день місяця (0 - Пн, ..., 6 - Нд)
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
    // Кількість днів у місяці
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const daysArray = [];
    
    // Додаємо пусті комірки перед 1-м числом
    for (let i = 0; i < firstDayIndex; i++) {
      daysArray.push({ type: 'empty', key: `empty-${i}` });
    }
    
    // Додаємо дні місяця
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      daysArray.push({
        type: 'day',
        day,
        dateStr,
        key: `day-${dateStr}`
      });
    }
    
    return daysArray;
  };

  // Рендеринг конкретного місяця
  const renderMonthView = (monthDate: Date, showPrev: boolean, showNext: boolean) => {
    const monthLabel = monthDate.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' });
    const capitalizedMonth = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
    const days = getMonthDays(monthDate);
    
    return (
      <div className="calendar-month-view">
        <div className="calendar-month-header">
          {showPrev ? (
            <button 
              type="button" 
              className="calendar-nav-btn"
              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
            >
              &lt;
            </button>
          ) : <div style={{ width: '32px' }} />}
          
          <div className="calendar-month-name">{capitalizedMonth}</div>
          
          {showNext ? (
            <button 
              type="button" 
              className="calendar-nav-btn"
              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
            >
              &gt;
            </button>
          ) : <div style={{ width: '32px' }} />}
        </div>
        
        <div className="calendar-weekdays">
          <span>Пн</span>
          <span>Вт</span>
          <span>Ср</span>
          <span>Чт</span>
          <span>Пт</span>
          <span>Сб</span>
          <span>Нд</span>
        </div>
        
        <div className="calendar-days-grid">
          {days.map(d => {
            if (d.type === 'empty') {
              return <div key={d.key} />;;
            }
            
            const { day, dateStr } = d;
            const isPast = isDateInPast(dateStr!);
            const isBusyIn = isDateBusyForCheckIn(dateStr!);
            const isBusyOut = isDateBusyForCheckOut(dateStr!);
            
            // Визначаємо, чи зайнятий цей день для кліку
            const isBusy = (() => {
              if (isPast) return false;
              if (!startDate) {
                return isBusyIn;
              } else {
                if (dateStr! < startDate) return isBusyIn;
                if (dateStr! === startDate) return false;
                const hasOverlap = bookedDates.some(bd => {
                  const startStr = getLocalDateString(bd.startDate);
                  const endStr = getLocalDateString(bd.endDate);
                  return startDate < endStr && dateStr! > startStr;
                });
                return hasOverlap || isBusyOut;
              }
            })();

            const isSelStart = startDate === dateStr;
            const isSelEnd = endDate === dateStr;
            const isInRange = startDate && endDate && dateStr! > startDate && dateStr! < endDate;
            const isHoverRange = startDate && !endDate && hoverDate && dateStr! > startDate && dateStr! <= hoverDate;
            const isSingle = isSelStart && !endDate;
            
            let classes = 'calendar-day-cell';
            if (isPast) classes += ' disabled';
            else if (isBusy) classes += ' busy';
            else if (isSelStart) classes += ' selected-start';
            else if (isSelEnd) classes += ' selected-end';
            else if (isInRange || isHoverRange) classes += ' in-range';
            
            if (isSingle) classes += ' single-day';
            
            return (
              <div 
                key={d.key} 
                className={classes}
                onClick={() => handleDayClick(dateStr!)}
                onMouseEnter={() => startDate && !endDate && setHoverDate(dateStr!)}
              >
                <span className="calendar-day-number">{day}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Завантаження категорій
  const loadCategories = async () => {
    try {
      const cats = await categoryAPI.getCategories();
      setCategories(cats);
    } catch (err: any) {
      console.error('Помилка завантаження категорій:', err.message);
    }
  };

  // Завантаження оголошень з фільтрами
  const loadListings = async () => {
    setLoading(true);
    try {
      const filters: ListingFilters = {};
      if (selectedCategory) filters.category = selectedCategory;
      if (searchQuery) filters.search = searchQuery;
      if (locationQuery) filters.location = locationQuery;
      if (minPriceQuery) filters.minPrice = minPriceQuery;
      if (maxPriceQuery) filters.maxPrice = maxPriceQuery;

      const items = await listingAPI.getListings(filters);
      setListings(items);
    } catch (err: any) {
      setErrorMsg(err.message || 'Не вдалося завантажити оголошення');
    } finally {
      setLoading(false);
    }
  };

  // Завантаження моїх оголошень
  const loadMyListings = async () => {
    setLoading(true);
    try {
      const items = await listingAPI.getMyListings();
      setMyListings(items);
    } catch (err: any) {
      setErrorMsg(err.message || 'Не вдалося завантажити ваші оголошення');
    } finally {
      setLoading(false);
    }
  };

  // Завантаження моїх оренд
  const loadMyRentals = async () => {
    setLoading(true);
    try {
      const items = await bookingAPI.getMyRentals();
      setMyRentals(items);
    } catch (err: any) {
      setErrorMsg(err.message || 'Не вдалося завантажити ваші оренди');
    } finally {
      setLoading(false);
    }
  };

  // Завантаження вхідних запитів на мої речі
  const loadMyRequests = async () => {
    setLoading(true);
    try {
      const items = await bookingAPI.getMyRequests();
      setMyRequests(items);
    } catch (err: any) {
      setErrorMsg(err.message || 'Не вдалося завантажити запити');
    } finally {
      setLoading(false);
    }
  };

  // Обробка пошуку
  const handleSearchSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (locationQuery.trim()) {
      setShowMap(true);
      
      // Геокодуємо введений запит для фокусування карти
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}&limit=1`
        );
        if (response.ok) {
          const results = await response.json();
          if (results && results.length > 0) {
            const first = results[0];
            setMapCenter([parseFloat(first.lat), parseFloat(first.lon)]);
          }
        }
      } catch (err) {
        console.error('Помилка геокодування при пошуку:', err);
      }
    } else {
      setShowMap(false);
    }
    loadListings();
  };

  // Очищення фільтрів
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setLocationQuery('');
    setMinPriceQuery('');
    setMaxPriceQuery('');
    setShowMap(false); // Ховаємо карту
    setTimeout(() => {
      // Потрібно зробити запит з пустими значеннями
      setLoading(true);
      listingAPI.getListings({}).then(items => {
        setListings(items);
        setLoading(false);
      }).catch(err => {
        setErrorMsg(err.message);
        setLoading(false);
      });
    }, 50);
  };

  // Реєстрація / Вхід
  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      if (authMode === 'register') {
        const data = await authAPI.register({ email, password, firstName, lastName });
        localStorage.setItem('rentlocal_token', data.token);
        setCurrentUser(data.user);
        setSuccessMsg('Реєстрація успішна!');
      } else {
        const data = await authAPI.login({ email, password });
        localStorage.setItem('rentlocal_token', data.token);
        setCurrentUser(data.user);
        setSuccessMsg('Вхід виконано успішно!');
      }
      setIsAuthOpen(false);
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Помилка авторизації');
    } finally {
      setLoading(false);
    }
  };

  // Вхід через Google
  const handleGoogleCredentialResponse = async (response: any) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await authAPI.googleLogin(response.credential);
      localStorage.setItem('rentlocal_token', data.token);
      setCurrentUser(data.user);
      setSuccessMsg('Вхід через Google успішний!');
      setIsAuthOpen(false);
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Помилка Google авторизації');
    } finally {
      setLoading(false);
    }
  };

  // Ініціалізація кнопки Google Login
  useEffect(() => {
    if (isAuthOpen && (window as any).google) {
      (window as any).google.accounts.id.initialize({
        client_id: '1050001244321-9n1id40e9uafiie3p1jqtgqhom60idjd.apps.googleusercontent.com',
        callback: handleGoogleCredentialResponse,
      });
      setTimeout(() => {
        const btnContainer = document.getElementById('google-login-btn');
        if (btnContainer && (window as any).google) {
          (window as any).google.accounts.id.renderButton(
            btnContainer,
            { theme: 'outline', size: 'large', width: '360' }
          );
        }
      }, 50);
    }
  }, [isAuthOpen, authMode]);

  // Вихід з акаунту
  const handleLogout = () => {
    localStorage.removeItem('rentlocal_token');
    setCurrentUser(null);
    setSuccessMsg('Ви вийшли з акаунту');
    setActiveView('listings');
  };

  // Обробка зміни фото
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const combinedFiles = [...imageFiles, ...selectedFiles].slice(0, 3);
      setImageFiles(combinedFiles);
      
      // Анулюємо старі об'єктні URL для очищення пам'яті
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      
      const previews = combinedFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedFiles = imageFiles.filter((_, i) => i !== index);
    setImageFiles(updatedFiles);
    
    URL.revokeObjectURL(imagePreviews[index]);
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(updatedPreviews);
  };

  // Створення оголошення
  const handleCreateListingSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    if (!newTitle || !newDescription || !newPrice || !newDeposit || !newLocation || !newCategoryId) {
      setErrorMsg('Будь ласка, заповніть усі поля');
      return;
    }

    if (imageFiles.length < 2 || imageFiles.length > 3) {
      setErrorMsg('Будь ласка, завантажте 2 або 3 обов’язкові фотографії');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('title', newTitle);
      formData.append('description', newDescription);
      formData.append('price', newPrice);
      formData.append('deposit', newDeposit);
      formData.append('location', newLocation);
      formData.append('categoryId', newCategoryId);
      formData.append('instantBooking', newInstantBooking ? 'true' : 'false');
      formData.append('checkInTime', newCheckInTime);
      formData.append('checkOutTime', newCheckOutTime);
      if (newLatitude !== null) {
        formData.append('latitude', newLatitude.toString());
      }
      if (newLongitude !== null) {
        formData.append('longitude', newLongitude.toString());
      }
      
      // Додаємо всі 2 або 3 файли фотографій
      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      await listingAPI.createListing(formData);
      setSuccessMsg('Оголошення успішно додано!');
      
      // Очищення форми
      setNewTitle('');
      setNewDescription('');
      setNewPrice('');
      setNewDeposit('');
      setNewLocation('');
      setNewCategoryId('');
      setNewLatitude(null);
      setNewLongitude(null);
      setNewInstantBooking(false);
      setNewCheckInTime('14:00');
      setNewCheckOutTime('12:00');
      setImageFiles([]);
      setImagePreviews([]);
      
      setActiveView('listings');
    } catch (err: any) {
      setErrorMsg(err.message || 'Не вдалося створити оголошення');
    } finally {
      setLoading(false);
    }
  };

  // Видалення власного оголошення
  const handleDeleteListing = (id: number) => {
    setConfirmAction({
      message: 'Ви впевнені, що хочете видалити це оголошення? Решта замовлень на цей предмет також будуть скасовані.',
      onConfirm: async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
          await listingAPI.deleteListing(id);
          setSuccessMsg('Оголошення успішно видалено!');
          loadMyListings();
          loadListings();
        } catch (err: any) {
          setErrorMsg(err.message || 'Не вдалося видалити оголошення');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Маркування оголошення як зламаного
  const handleReportBroken = (id: number) => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7); // За замовчуванням 7 днів
    const defaultDateStr = getLocalDateString(defaultDate);

    setRepairUntilDate(defaultDateStr);
    setRepairReason('');
    setRepairListingId(id);
    setIsRepairModalOpen(true);
  };

  // Обробник відправки форми ремонту
  const handleRepairSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (repairListingId === null) return;
    if (!repairUntilDate.trim()) {
      setErrorMsg("Будь ласка, вкажіть коректну дату.");
      return;
    }
    const selectedDate = new Date(repairUntilDate);
    if (isNaN(selectedDate.getTime()) || selectedDate < new Date(new Date().setHours(0,0,0,0))) {
      setErrorMsg("Дата повинна бути коректною та вказувати на сьогодні або майбутній день.");
      return;
    }
    if (!repairReason.trim()) {
      setErrorMsg("Будь ласка, вкажіть причину ремонту.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await listingAPI.reportBroken(repairListingId, repairUntilDate, repairReason);
      setSuccessMsg(res.message);
      setIsRepairModalOpen(false);
      setRepairListingId(null);
      loadMyListings();
      loadListings();
    } catch (err: any) {
      setErrorMsg(err.message || 'Не вдалося позначити товар як зламаний');
    } finally {
      setLoading(false);
    }
  };

  // Позначення оголошення як справного (завершення ремонту)
  const handleResolveBroken = (id: number) => {
    setConfirmAction({
      message: 'Ви впевнені, що хочете позначити цей товар як справний та завершити ремонт раніше?',
      onConfirm: async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
          const res = await listingAPI.resolveBroken(id);
          setSuccessMsg(res.message);
          loadMyListings();
          loadListings();
        } catch (err: any) {
          setErrorMsg(err.message || 'Не вдалося позначити товар як справний');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Відкрити модалку редагування оголошення
  const openEditModal = (listing: Listing) => {
    setEditingListing(listing);
    setEditTitle(listing.title);
    setEditDescription(listing.description);
    setEditPrice(listing.price.toString());
    setEditDeposit(listing.deposit.toString());
    setEditLocation(listing.location);
    setEditCategoryId(listing.categoryId.toString());
    setEditLatitude(listing.latitude || null);
    setEditLongitude(listing.longitude || null);
    setEditInstantBooking(listing.instantBooking || false);
    setEditCheckInTime(listing.checkInTime || '14:00');
    setEditCheckOutTime(listing.checkOutTime || '12:00');
    setEditImageFiles([]);
    setEditImagePreviews(listing.imageUrls || []);
    setShouldReplaceImages(false);
    setIsEditOpen(true);
  };

  // Обробка зміни фото при редагуванні
  const handleEditImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const combinedFiles = [...editImageFiles, ...selectedFiles].slice(0, 3);
      setEditImageFiles(combinedFiles);
      
      // Revoke only local object URLs to avoid memory leaks
      editImagePreviews.forEach(url => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
      
      const previews = combinedFiles.map(file => URL.createObjectURL(file));
      setEditImagePreviews(previews);
    }
  };

  const handleRemoveEditImage = (index: number) => {
    const updatedFiles = editImageFiles.filter((_, i) => i !== index);
    setEditImageFiles(updatedFiles);
    
    if (editImagePreviews[index].startsWith('blob:')) {
      URL.revokeObjectURL(editImagePreviews[index]);
    }
    const updatedPreviews = editImagePreviews.filter((_, i) => i !== index);
    setEditImagePreviews(updatedPreviews);
  };

  // Збереження оновленого оголошення
  const handleEditListingSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!editingListing) return;

    if (!editTitle || !editDescription || !editPrice || !editDeposit || !editLocation || !editCategoryId) {
      setErrorMsg('Будь ласка, заповніть усі обов’язкові поля');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('title', editTitle);
      formData.append('description', editDescription);
      formData.append('price', editPrice);
      formData.append('deposit', editDeposit);
      formData.append('location', editLocation);
      formData.append('categoryId', editCategoryId);
      formData.append('instantBooking', editInstantBooking ? 'true' : 'false');
      formData.append('checkInTime', editCheckInTime);
      formData.append('checkOutTime', editCheckOutTime);
      if (editLatitude !== null) {
        formData.append('latitude', editLatitude.toString());
      }
      if (editLongitude !== null) {
        formData.append('longitude', editLongitude.toString());
      }
      if (shouldReplaceImages) {
        if (editImageFiles.length < 2 || editImageFiles.length > 3) {
          setErrorMsg('Будь ласка, завантажте 2 або 3 обов’язкові фотографії для заміни');
          setLoading(false);
          return;
        }
        editImageFiles.forEach(file => {
          formData.append('images', file);
        });
      }

      await listingAPI.updateListing(editingListing.id, formData);
      setSuccessMsg('Оголошення успішно оновлено!');
      
      setIsEditOpen(false);
      setEditingListing(null);
      loadMyListings();
      loadListings();
    } catch (err: any) {
      setErrorMsg(err.message || 'Не вдалося оновити оголошення');
    } finally {
      setLoading(false);
    }
  };

  // Створення бронювання
  const handleBookingSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    if (!selectedListing) return;
    if (!startDate || !endDate) {
      setErrorMsg('Оберіть дати початку та завершення оренди');
      return;
    }

    // Перевірка на перетин дат на клієнті з урахуванням часу заїзду/виїзду
    const checkInTime = selectedListing.checkInTime || '14:00';
    const checkOutTime = selectedListing.checkOutTime || '12:00';
    const start = new Date(`${startDate}T${checkInTime}:00`);
    const end = new Date(`${endDate}T${checkOutTime}:00`);
    const hasOverlap = bookedDates.some(bd => {
      const bStart = new Date(bd.startDate);
      const bEnd = new Date(bd.endDate);
      return start < bEnd && end > bStart;
    });

    if (hasOverlap) {
      setErrorMsg('На жаль, ці дати вже зайняті або перетинаються з існуючим бронюванням. Будь ласка, оберіть інші.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await bookingAPI.createBooking({
        listingId: selectedListing.id,
        startDate,
        endDate,
      });
      setSuccessMsg(selectedListing.instantBooking ? 'Оренду успішно підтверджено миттєво!' : 'Запит на оренду успішно надіслано!');
      setSelectedListing(null);
      setStartDate('');
      setEndDate('');
      // Очищаємо URL параметр, щоб при перезавантаженні не відкривалася модалка знову
      const params = new URLSearchParams(window.location.search);
      if (params.get('listing')) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Помилка бронювання');
    } finally {
      setLoading(false);
    }
  };

  // Надіслати відгук про річ
  const handleReviewSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!currentUser || !selectedListing) return;
    if (reviewRating === 0) {
      setErrorMsg('Будь ласка, оберіть оцінку від 1 до 5 зірок');
      return;
    }
    if (!reviewComment.trim()) {
      setErrorMsg('Будь ласка, напишіть текстовий коментар');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      await reviewAPI.createReview({
        listingId: selectedListing.id,
        rating: reviewRating,
        comment: reviewComment,
      });
      setSuccessMsg('Дякуємо за ваш відгук! Він успішно доданий.');
      setReviewRating(0);
      setReviewHoverRating(0);
      setReviewComment('');
      
      // Перезавантажуємо деталі речі, щоб оновити середній рейтинг та список відгуків на сторінці
      await loadListingDetails(selectedListing.id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Не вдалося надіслати відгук');
    } finally {
      setLoading(false);
    }
  };

  // Скасування бронювання (орендарем) - тимчасово вимкнено, оскільки дії прибрано з таблиці
  /*
  const handleCancelBooking = (id: number) => {
    setConfirmAction({
      message: 'Ви впевнені, що хочете скасувати цей запит на оренду?',
      onConfirm: async () => {
        setLoading(true);
        try {
          await bookingAPI.updateBookingStatus(id, 'CANCELLED');
          setSuccessMsg('Запит успішно скасовано');
          loadMyRentals();
        } catch (err: any) {
          setErrorMsg(err.message || 'Не вдалося скасувати запит');
        } finally {
          setLoading(false);
        }
      }
    });
  };
  */

  // Скасування оренди власником (через поломку / форс-мажор)
  const handleOwnerCancelBooking = async (id: number) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await bookingAPI.updateBookingStatus(id, 'CANCELLED', 'скасовано власником');
      setSuccessMsg('Бронювання скасовано.');
      loadMyRequests();
    } catch (err: any) {
      setErrorMsg(err.message || 'Не вдалося скасувати оренду');
    } finally {
      setLoading(false);
    }
  };

  // Оновлення статусу власником (CONFIRMED, REJECTED або COMPLETED)
  const handleStatusUpdate = (id: number, status: 'CONFIRMED' | 'REJECTED' | 'COMPLETED') => {
    let text = '';
    if (status === 'CONFIRMED') text = 'підтвердити';
    else if (status === 'REJECTED') text = 'відхилити';
    else if (status === 'COMPLETED') text = 'підтвердити повернення речі для';

    setConfirmAction({
      message: `Ви впевнені, що хочете ${text} цей запит?`,
      onConfirm: async () => {
        setLoading(true);
        try {
          await bookingAPI.updateBookingStatus(id, status);
          let successMsgText = '';
          if (status === 'CONFIRMED') successMsgText = 'підтверджено';
          else if (status === 'REJECTED') successMsgText = 'відхилено';
          else if (status === 'COMPLETED') successMsgText = 'завершено (повернення підтверджено)';
          
          setSuccessMsg(`Запит успішно ${successMsgText}`);
          loadMyRequests();
        } catch (err: any) {
          setErrorMsg(err.message || 'Не вдалося змінити статус запиту');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Розрахунок вартості бронювання в реальному часі
  const calculateTotal = () => {
    if (!selectedListing || !startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) return null;

    const diffTime = end.getTime() - start.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const rentalPrice = selectedListing.price * days;
    const deposit = selectedListing.deposit;
    const total = rentalPrice + deposit;

    return { days, rentalPrice, deposit, total };
  };

  const bookingDetails = calculateTotal();

  return (
    <div className="app-container">
      <div className="sticky-header-wrapper">
        {/* Шапка сайту в стилі Airbnb */}
        <header className="app-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        borderBottom: '1px solid #ebebeb',
        backgroundColor: '#ffffff',
      }}>
        {/* Логотип */}
        <div 
          className="app-logo" 
          onClick={() => { setActiveView('listings'); setSelectedListing(null); }}
          style={{
            fontSize: '24px',
            fontWeight: 800,
            color: '#10B981',
            cursor: 'pointer',
            letterSpacing: '-0.8px',
            userSelect: 'none'
          }}
        >
          RentLocal
        </div>
        
        {/* Пошукова форма */}
        {activeView === 'listings' && !selectedListing && (
            <form 
              onSubmit={handleSearchSubmit}
              className="filter-section"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid #dddddd',
                borderRadius: '32px',
                padding: '4px 4px 4px 24px',
                backgroundColor: '#ffffff',
                boxShadow: '0 3px 12px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0,0,0,0.05)',
                width: '100%',
                maxWidth: '850px',
                margin: 0,
                boxSizing: 'border-box',
                position: 'relative',
                zIndex: 1030
              }}
            >
              <div className="filter-grid" style={{ display: 'flex', alignItems: 'center', width: '100%', flexWrap: 'nowrap' }}>
                
                {/* Локація */}
                <div className="filter-segment" style={{ flex: 1.5, minWidth: '120px', borderRight: '1px solid #ebebeb', paddingRight: '12px', marginRight: '8px', position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '9px', fontWeight: 800, color: '#222222', textTransform: 'uppercase', marginBottom: '2px', letterSpacing: '0.8px' }}>
                    Де орендувати
                  </label>
                  <input 
                    type="text"
                    placeholder="Пошук місць"
                    value={locationQuery}
                    onChange={(e) => {
                      setLocationQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    style={{ border: 'none', padding: '4px 0', fontSize: '13px', fontWeight: 500, background: 'transparent', color: '#222222', width: '100%', outline: 'none' }}
                  />
                  
                  {/* Підказки автокомпліту */}
                  {showSuggestions && locationSuggestions.length > 0 && (
                    <ul 
                      className="autocomplete-dropdown"
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: '-24px',
                        minWidth: '350px',
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.15)',
                        border: '1px solid #dddddd',
                        marginTop: '12px',
                        padding: '8px 0',
                        listStyle: 'none',
                        zIndex: 1030,
                        maxHeight: '260px',
                        overflowY: 'auto'
                      }}
                    >
                      {locationSuggestions.map((sug, idx) => (
                        <li 
                          key={idx}
                          onClick={() => {
                            setLocationQuery(sug.display_name);
                            setMapCenter([sug.lat, sug.lng]);
                            setShowSuggestions(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px 16px',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s',
                            fontSize: '14px',
                            color: '#222222'
                          }}
                        >
                          <div className="suggestion-icon-circle" style={{ width: '30px', height: '30px', backgroundColor: '#f1f1f1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', flexShrink: 0 }}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                          </div>
                          <span className="suggestion-text" style={{ fontSize: '13px', fontWeight: 500 }}>
                            {renderHighlightedText(sug.display_name, locationQuery)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Категорія */}
                <div className="filter-segment" style={{ flex: 1.2, minWidth: '100px', borderRight: '1px solid #ebebeb', paddingRight: '12px', marginRight: '8px' }}>
                  <label style={{ display: 'block', fontSize: '9px', fontWeight: 800, color: '#222222', textTransform: 'uppercase', marginBottom: '2px', letterSpacing: '0.8px' }}>
                    Категорія
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{ border: 'none', padding: '4px 0', fontSize: '13px', fontWeight: 500, background: 'transparent', color: '#222222', width: '100%', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="">Усі категорії</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Ціна від і до */}
                <div className="filter-segment" style={{ flex: 1.5, minWidth: '120px', borderRight: '1px solid #ebebeb', paddingRight: '12px', marginRight: '8px' }}>
                  <label style={{ display: 'block', fontSize: '9px', fontWeight: 800, color: '#222222', textTransform: 'uppercase', marginBottom: '2px', letterSpacing: '0.8px' }}>
                    Ціна (грн)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input 
                      type="number"
                      placeholder="від"
                      value={minPriceQuery}
                      onChange={(e) => setMinPriceQuery(e.target.value)}
                      style={{ border: 'none', padding: '4px 0', fontSize: '13px', fontWeight: 500, background: 'transparent', color: '#222222', width: '45%', outline: 'none' }}
                    />
                    <span style={{ color: '#ebebeb', fontSize: '12px' }}>|</span>
                    <input 
                      type="number"
                      placeholder="до"
                      value={maxPriceQuery}
                      onChange={(e) => setMaxPriceQuery(e.target.value)}
                      style={{ border: 'none', padding: '4px 0', fontSize: '13px', fontWeight: 500, background: 'transparent', color: '#222222', width: '45%', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Що шукаєте (Опис/назва) */}
                <div className="filter-segment" style={{ flex: 1.5, minWidth: '120px', marginRight: '8px' }}>
                  <label style={{ display: 'block', fontSize: '9px', fontWeight: 800, color: '#222222', textTransform: 'uppercase', marginBottom: '2px', letterSpacing: '0.8px' }}>
                    Опис або назва
                  </label>
                  <input 
                    type="text"
                    placeholder="Пошук речей"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ border: 'none', padding: '4px 0', fontSize: '13px', fontWeight: 500, background: 'transparent', color: '#222222', width: '100%', outline: 'none' }}
                  />
                </div>

                {/* Кнопки дії */}
                <div className="filter-actions" style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '8px' }}>
                  <button 
                    type="button"
                    onClick={handleClearFilters}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#717171',
                      fontWeight: 600,
                      fontSize: '13px',
                      padding: '10px 16px',
                      borderRadius: '24px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7f7f7'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Очистити
                  </button>
                  <button 
                    type="submit"
                    style={{
                      background: '#10B981',
                      border: 'none',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '14px',
                      padding: '10px 20px',
                      borderRadius: '24px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10B981'}
                  >
                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', fill: 'none', height: '14px', width: '14px', stroke: 'currentColor', strokeWidth: 4, overflow: 'visible' }}>
                      <g fill="none">
                        <path d="m13 24c6.0751322 0 11-4.9248678 11-11 0-6.0751322-4.9248678-11-11-11-6.0751322 0-11 4.9248678-11 11 0 6.0751322 4.9248678 11 11 21zm8-3 9 9"></path>
                      </g>
                    </svg>
                    Шукати
                  </button>
                </div>

              </div>
            </form>
        )}

        {/* Права частина шапки */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {currentUser && (
            <>
              <button 
                onClick={() => { setActiveView('create'); setSelectedListing(null); }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#222222',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f7f7f7'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                Здати річ в оренду
              </button>

              {/* Дзвоник сповіщень */}
              <div className="notifications-container" style={{ position: 'relative' }}>
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  style={{
                    background: 'none',
                    border: 'none',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#222222',
                    transition: 'background-color 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f7f7f7'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <svg 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg" 
                    aria-hidden="true" 
                    role="presentation" 
                    focusable="false" 
                    style={{ display: 'block', fill: 'none', height: '20px', width: '20px', stroke: 'currentColor', strokeWidth: 2, overflow: 'visible' }}
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>

                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      backgroundColor: '#10B981',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: 700,
                      borderRadius: '50%',
                      padding: '2px 6px',
                      minWidth: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #ffffff',
                      boxSizing: 'border-box'
                    }}>
                      {notifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div 
                    className="notifications-dropdown"
                    style={{
                      position: 'absolute',
                      top: '45px',
                      right: '0',
                      backgroundColor: '#ffffff',
                      border: 'none',
                      borderRadius: '16px',
                      width: '360px',
                      boxShadow: '0 8px 28px rgba(0, 0, 0, 0.15)',
                      zIndex: 1010,
                      display: 'flex',
                      flexDirection: 'column',
                      maxHeight: '400px',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px 20px',
                      borderBottom: '1px solid #f0f0f0'
                    }}>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: '#222222' }}>Сповіщення</span>
                      {notifications.filter(n => !n.isRead).length > 0 && (
                        <button 
                          onClick={handleMarkAllAsRead}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#10B981',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: '0'
                          }}
                        >
                          Позначити всі як прочитані
                        </button>
                      )}
                    </div>

                    <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '24px 20px', textAlign: 'center', color: '#717171', fontSize: '14px' }}>
                          Немає нових сповіщень
                        </div>
                      ) : (
                        notifications.map((item) => (
                          <div 
                            key={item.id}
                            onClick={() => {
                              if (!item.isRead) handleMarkAsRead(item.id);
                            }}
                            style={{
                              padding: '12px 20px',
                              borderBottom: '1px solid #f7f7f7',
                              backgroundColor: item.isRead ? '#ffffff' : '#fff5f6',
                              cursor: item.isRead ? 'default' : 'pointer',
                              transition: 'background-color 0.2s',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                              textAlign: 'left'
                            }}
                          >
                            <div style={{ 
                              fontSize: '13px', 
                              color: '#222222', 
                              fontWeight: item.isRead ? 400 : 600,
                              lineHeight: '1.4'
                            }}>
                              {item.message}
                            </div>
                            <div style={{ 
                              fontSize: '11px', 
                              color: '#717171',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <span>{new Date(item.createdAt).toLocaleDateString('uk-UA', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</span>
                              {!item.isRead && (
                                <span style={{
                                  width: '6px',
                                  height: '6px',
                                  backgroundColor: '#10B981',
                                  borderRadius: '50%',
                                  display: 'inline-block'
                                }} />
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Кнопка "Обране" (Сердечко) */}
          <button 
            onClick={() => {
              if (currentUser) {
                setActiveView('favorites');
                setSelectedListing(null);
              } else {
                handleGuestAction();
              }
            }}
            style={{
              background: 'none',
              border: 'none',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: activeView === 'favorites' ? '#10B981' : '#222222',
              transition: 'background-color 0.2s',
              position: 'relative',
              marginRight: '4px',
              padding: '0'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f7f7f7'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            title="Обране"
          >
            <svg 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg" 
              aria-hidden="true" 
              role="presentation" 
              focusable="false" 
              style={{ display: 'block', fill: activeView === 'favorites' ? '#10B981' : 'none', height: '20px', width: '20px', stroke: 'currentColor', strokeWidth: 2, overflow: 'visible' }}
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            {savedListingIds.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                backgroundColor: '#10B981',
                color: '#ffffff',
                fontSize: '10px',
                fontWeight: 700,
                borderRadius: '50%',
                padding: '2px 6px',
                minWidth: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #ffffff',
                boxSizing: 'border-box'
              }}>
                {savedListingIds.length}
              </span>
            )}
          </button>

          {/* Контейнер випадаючого меню профілю */}
          <div className="profile-menu-container" style={{ position: 'relative' }}>
            <button 
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                border: '1px solid #dddddd',
                borderRadius: '24px',
                padding: '5px 5px 5px 12px',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                boxShadow: 'none',
                transition: 'box-shadow 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
            >
              <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', fill: 'none', height: '16px', width: '16px', stroke: '#222222', strokeWidth: 3, overflow: 'visible' }}>
                <g fill="none">
                  <path d="m2 16h28m-28-10h28m-28 20h28"></path>
                </g>
              </svg>
              
              <div 
                className="avatar-placeholder" 
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: '#717171',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 700,
                  overflow: 'hidden'
                }}
              >
                {currentUser?.firstName ? currentUser.firstName.charAt(0).toUpperCase() : (
                  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', fill: '#ffffff', height: '100%', width: '100%', overflow: 'visible' }}>
                    <path d="m16 .7c-8.437 0-15.3 6.863-15.3 15.3s6.863 15.3 15.3 15.3 15.3-6.863 15.3-15.3-6.863-15.3-15.3-15.3zm0 29c-3.541 0-6.757-1.393-9.155-3.66 1.488-3.045 4.542-5.14 8.08-5.14h2.15c3.538 0 6.592 2.095 8.08 5.14-2.398 2.267-5.614 3.66-9.155 3.66zm0-10.7h-2.15c-4.492 0-8.243 3.161-9.176 7.394-2.583-2.617-4.174-6.233-4.174-10.194 0-7.885 6.415-14.3 14.3-14.3s14.3 6.415 14.3 14.3c0 3.961-1.591 7.577-4.174 10.194-.933-4.233-4.684-7.394-9.176-7.394zm5.55-5.8c0-3.061-2.489-5.55-5.55-5.55s-5.55 2.489-5.55 5.55 2.489 5.55 5.55 5.55 5.55-2.489 5.55-5.55z"></path>
                  </svg>
                )}
              </div>
              
            </button>

            {/* Випадаюче вікно меню користувача */}
            {isProfileMenuOpen && (
              <div 
                className="profile-dropdown" 
                onClick={() => setIsProfileMenuOpen(false)}
                style={{
                  position: 'absolute',
                  top: '45px',
                  right: '0',
                  backgroundColor: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  width: '240px',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '8px 0',
                  textAlign: 'left'
                }}
              >
                {currentUser ? (
                  <>
                    <div style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 700, color: '#222222', borderBottom: '1px solid #f0f0f0', marginBottom: '4px' }}>
                      Вітаємо, {currentUser.firstName}!
                    </div>
                    <button 
                      onClick={() => { setActiveView('mylistings'); setSelectedListing(null); }}
                      style={{ background: 'none', border: 'none', padding: '10px 16px', fontSize: '13px', textAlign: 'left', width: '100%', cursor: 'pointer', fontWeight: 500 }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f7f7f7'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      Мої оголошення
                    </button>
                    <button 
                      onClick={() => { setActiveView('rentals'); setSelectedListing(null); }}
                      style={{ background: 'none', border: 'none', padding: '10px 16px', fontSize: '13px', textAlign: 'left', width: '100%', cursor: 'pointer', fontWeight: 500 }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f7f7f7'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      Мої оренди
                    </button>
                    <button 
                      onClick={() => { setActiveView('requests'); setSelectedListing(null); }}
                      style={{ background: 'none', border: 'none', padding: '10px 16px', fontSize: '13px', textAlign: 'left', width: '100%', cursor: 'pointer', fontWeight: 500 }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f7f7f7'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      Запити на оренду
                    </button>
                    <button 
                      onClick={handleLogout}
                      style={{ background: 'none', border: 'none', padding: '10px 16px', fontSize: '13px', textAlign: 'left', width: '100%', cursor: 'pointer', fontWeight: 500, color: '#10B981', borderTop: '1px solid #f0f0f0', marginTop: '4px' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f7f7f7'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      Вийти
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }}
                      style={{ background: 'none', border: 'none', padding: '10px 16px', fontSize: '13px', textAlign: 'left', width: '100%', cursor: 'pointer', fontWeight: 600 }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f7f7f7'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      Увійти
                    </button>
                    <button 
                      onClick={() => { setAuthMode('register'); setIsAuthOpen(true); }}
                      style={{ background: 'none', border: 'none', padding: '10px 16px', fontSize: '13px', textAlign: 'left', width: '100%', cursor: 'pointer', fontWeight: 500 }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f7f7f7'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      Зареєструватися
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>



      {/* Стрічка категорій Airbnb */}
      {activeView === 'listings' && !selectedListing && (
        <div 
          className="categories-bar" 
          style={{
            display: 'flex',
            gap: '24px',
            padding: '12px 24px 8px',
            borderBottom: '1px solid #ebebeb',
            overflowX: 'auto',
            backgroundColor: '#ffffff',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            marginBottom: '24px'
          }}
        >
          {/* Категорія "Усі" */}
          <button 
            onClick={() => setSelectedCategory('')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              padding: '4px 0 10px',
              cursor: 'pointer',
              color: selectedCategory === '' ? '#10B981' : '#717171',
              borderBottom: selectedCategory === '' ? '2px solid #10B981' : '2px solid transparent',
              minWidth: '64px',
              transition: 'color 0.2s, border-bottom-color 0.2s',
              borderRadius: 0
            }}
          >
            <div className="category-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>Усі речі</span>
          </button>

          {categories.map(c => {
            const isSelected = selectedCategory === c.slug;
            return (
              <button 
                key={c.id}
                onClick={() => setSelectedCategory(c.slug)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  padding: '4px 0 10px',
                  cursor: 'pointer',
                  color: isSelected ? '#10B981' : '#717171',
                  borderBottom: isSelected ? '2px solid #10B981' : '2px solid transparent',
                  minWidth: '64px',
                  transition: 'color 0.2s, border-bottom-color 0.2s',
                  borderRadius: 0
                }}
              >
                <div className="category-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {getCategorySvgIcon(c.slug)}
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>{c.name}</span>
              </button>
            );
          })}
        </div>
      )}
      </div>


      {/* Системні сповіщення (у вигляді неінвазивних плаваючих тостів, що не зсувають контент) */}
      {(successMsg || errorMsg) && (
        <div 
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
            borderLeft: `6px solid ${successMsg ? '#10B981' : '#EF4444'}`,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '350px',
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          {successMsg ? (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#10B981" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#EF4444" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
          <span style={{ fontSize: '14px', fontWeight: 500, color: '#222222' }}>
            {successMsg || errorMsg}
          </span>
          <button 
            type="button"
            onClick={() => {
              setSuccessMsg(null);
              setErrorMsg(null);
            }}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              color: '#717171',
              cursor: 'pointer',
              marginLeft: 'auto',
              padding: '0 4px',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>
      )}

      {loading && (
        <div 
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
            borderLeft: '6px solid #3B82F6',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '350px',
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          <div style={{
            width: '20px',
            height: '20px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #3B82F6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            flexShrink: 0
          }} />
          <span style={{ fontSize: '14px', fontWeight: 500, color: '#222222' }}>
            Завантаження...
          </span>
        </div>
      )}

      <main className="main-content">
        {!selectedListing ? (
        <>
          {/* Вкладка: Усі оголошення (Головна) */}
          {activeView === 'listings' && (
        <div>


          {/* Список оголошень (Повноширокий за замовчуванням, або Спліт з Картою, якщо вибрано локацію) */}
          {!showMap ? (
            <div className="full-width-layout">
              {listings.length === 0 ? (
                <p style={{ textAlign: 'center', margin: '40px 0', color: '#666' }}>
                  Оголошень не знайдено за вказаними фільтрами.
                </p>
              ) : (
                <section className="listings-grid full-grid">
                  {listings.map(item => (
                    <div 
                      key={item.id} 
                      className="listing-card"
                      onClick={() => {
                        window.open(`/?listing=${item.id}`, '_blank');
                      }}
                    >
                      <button 
                        className="card-favorite-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveListing(item.id);
                        }}
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: 'rgba(255, 255, 255, 0.9)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          zIndex: 10,
                          transition: 'transform 0.15s ease',
                          padding: '0'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                        title="Зберегти"
                      >
                        <svg viewBox="0 0 24 24" width="18" height="18" 
                          fill={savedListingIds.includes(item.id) ? '#10B981' : 'none'} 
                          stroke={savedListingIds.includes(item.id) ? '#10B981' : '#222222'} 
                          strokeWidth="2.5"
                        >
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </button>
                      {item.imageUrls?.[0] || item.imageUrl ? (
                        <img src={item.imageUrls?.[0] || item.imageUrl || ''} alt={item.title} className="listing-card-image" />
                      ) : (
                        <div className="listing-card-placeholder">Фото відсутнє</div>
                      )}
                      <div className="listing-card-title">{item.title}</div>
                      <div className="listing-card-meta">
                        {item.category?.name} • {item.location}
                      </div>
                      <div className="listing-card-price-row">
                        <span className="listing-card-price">{item.price} грн</span>
                        <span className="listing-card-rating">
                          ★ {item.avgRating !== null && item.avgRating !== undefined ? `${item.avgRating} (${item.reviewCount})` : 'Нове'}
                        </span>
                      </div>
                    </div>
                  ))}
                </section>
              )}
            </div>
          ) : (
            <>
              {/* Контейнер спліт-екрану: Список зліва, Карта справа */}
              <div className="main-layout-container">
                <div className={`listings-side ${isMobileMapOpen ? 'inactive' : ''}`}>
                  {listings.length === 0 ? (
                    <p style={{ textAlign: 'center', margin: '40px 0', color: '#666' }}>
                      Оголошень не знайдено за вказаними фільтрами.
                    </p>
                  ) : (
                    <section className="listings-grid">
                      {listings.map(item => (
                        <div 
                          key={item.id} 
                          className="listing-card"
                          onClick={() => {
                            window.open(`/?listing=${item.id}`, '_blank');
                          }}
                        >
                          <button 
                            className="card-favorite-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSaveListing(item.id);
                            }}
                            style={{
                              position: 'absolute',
                              top: '12px',
                              right: '12px',
                              background: 'rgba(255, 255, 255, 0.9)',
                              border: 'none',
                              borderRadius: '50%',
                              width: '32px',
                              height: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              zIndex: 10,
                              transition: 'transform 0.15s ease',
                              padding: '0'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                            title="Зберегти"
                          >
                            <svg viewBox="0 0 24 24" width="18" height="18" 
                              fill={savedListingIds.includes(item.id) ? '#10B981' : 'none'} 
                              stroke={savedListingIds.includes(item.id) ? '#10B981' : '#222222'} 
                              strokeWidth="2.5"
                            >
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                          </button>
                          {item.imageUrls?.[0] || item.imageUrl ? (
                            <img src={item.imageUrls?.[0] || item.imageUrl || ''} alt={item.title} className="listing-card-image" />
                          ) : (
                            <div className="listing-card-placeholder">Фото відсутнє</div>
                          )}
                          <div className="listing-card-title">{item.title}</div>
                          <div className="listing-card-meta">
                            {item.category?.name} • {item.location}
                          </div>
                          <div className="listing-card-price-row">
                            <span className="listing-card-price">{item.price} грн</span>
                            <span className="listing-card-rating">
                              ★ {item.avgRating !== null && item.avgRating !== undefined ? `${item.avgRating} (${item.reviewCount})` : 'Нове'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </section>
                  )}
                </div>

                <div className={`map-side ${isMobileMapOpen ? 'active' : ''}`}>
                  <BrowseMap 
                    listings={listings}
                    onListingSelect={(item) => {
                      window.open(`/?listing=${item.id}`, '_blank');
                    }}
                    selectedListing={selectedListing}
                    mapCenter={mapCenter}
                  />
                </div>
              </div>

              {/* Плаваюча кнопка для мобільних пристроїв */}
              <button 
                className="mobile-map-toggle-btn"
                onClick={() => setIsMobileMapOpen(!isMobileMapOpen)}
              >
                {isMobileMapOpen ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="8" y1="6" x2="21" y2="6" />
                      <line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="3" y1="12" x2="3.01" y2="12" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="3" y1="18" x2="3.01" y2="18" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Список
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                      <line x1="9" y1="3" x2="9" y2="18" />
                      <line x1="15" y1="6" x2="15" y2="21" />
                    </svg>
                    Карта
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      )}

      {/* Вкладка: Створити оголошення */}
      {activeView === 'create' && (
        <section className="form-layout">
          <h2>Додати нову річ для оренди</h2>
          <form onSubmit={handleCreateListingSubmit}>
            <div className="form-group">
              <label htmlFor="title">Назва речі *</label>
              <input 
                type="text" 
                id="title"
                required 
                value={newTitle}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTitle(e.target.value)}
                placeholder="Наприклад: Перфоратор Bosch"
              />
            </div>

            <div className="form-group">
              <label htmlFor="categoryId">Категорія *</label>
              <select 
                id="categoryId"
                required
                value={newCategoryId}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setNewCategoryId(e.target.value)}
              >
                <option value="">Оберіть категорію</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">Опис речі *</label>
              <textarea 
                id="description"
                required
                rows={4}
                value={newDescription}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewDescription(e.target.value)}
                placeholder="Опишіть технічний стан, характеристики, комплектацію..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label htmlFor="price">Ціна за добу (грн) *</label>
                <input 
                  type="number" 
                  id="price"
                  required 
                  min="0"
                  value={newPrice}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPrice(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="deposit">Застава (грн) *</label>
                <input 
                  type="number" 
                  id="deposit"
                  required 
                  min="0"
                  value={newDeposit}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewDeposit(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location">Локація (Місто, Район) *</label>
              <input 
                type="text" 
                id="location"
                required 
                value={newLocation}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewLocation(e.target.value)}
                placeholder="Введіть адресу або виберіть місце на карті..."
              />
            </div>

            <div className="form-group">
              <label>Позначте розташування на карті</label>
              <MapSelector 
                initialLatitude={newLatitude}
                initialLongitude={newLongitude}
                initialLocation={newLocation}
                onChange={(data) => {
                  setNewLatitude(data.latitude);
                  setNewLongitude(data.longitude);
                  setNewLocation(data.address);
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="image">Фотографії речі (завантажте від 2 до 3 обов'язкових фото) *</label>
              <input 
                type="file" 
                id="image"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                disabled={imageFiles.length >= 3}
              />
              {imagePreviews.length > 0 && (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                  {imagePreviews.map((url, index) => (
                    <div key={index} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ccc' }}>
                      <img src={url} alt={`Попередній перегляд ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button 
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(0, 0, 0, 0.6)',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          lineHeight: '1',
                          padding: 0
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {imageFiles.length < 2 && (
                <span style={{ color: '#10b981', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                  Потрібно завантажити щонайменше 2 фотографії (вибрано: {imageFiles.length})
                </span>
              )}
              {imageFiles.length > 0 && (
                <span style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                  Вибрано {imageFiles.length} з 3 фотографій
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '15px', margin: '15px 0' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="newCheckInTime">Час отримання (Check-in)</label>
                <select 
                  id="newCheckInTime"
                  value={newCheckInTime}
                  onChange={(e) => setNewCheckInTime(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                >
                  {Array.from({ length: 24 }).map((_, h) => {
                    const time = `${String(h).padStart(2, '0')}:00`;
                    return <option key={time} value={time}>{time}</option>;
                  })}
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="newCheckOutTime">Час повернення (Check-out)</label>
                <select 
                  id="newCheckOutTime"
                  value={newCheckOutTime}
                  onChange={(e) => setNewCheckOutTime(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                >
                  {Array.from({ length: 24 }).map((_, h) => {
                    const time = `${String(h).padStart(2, '0')}:00`;
                    return <option key={time} value={time}>{time}</option>;
                  })}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '15px 0' }}>
              <input 
                type="checkbox" 
                id="instantBooking" 
                checked={newInstantBooking}
                onChange={(e) => setNewInstantBooking(e.target.checked)}
                style={{ width: 'auto', margin: 0, cursor: 'pointer' }}
              />
              <label htmlFor="instantBooking" style={{ marginBottom: 0, fontWeight: 500, cursor: 'pointer' }}>
                Миттєве бронювання (схвалювати оренду автоматично, якщо дати вільні)
              </label>
            </div>

            <button type="submit" className="primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
              {loading ? 'Опублікування...' : 'Опублікувати оголошення'}
            </button>
          </form>
        </section>
      )}

      {/* Вкладка: Обране (Збережені оголошення) */}
      {activeView === 'favorites' && (
        <div>
          <h2>Збережені оголошення</h2>
          <p className="text-muted" style={{ marginBottom: '24px' }}>
            Тут відображаються оголошення, які ви зберегли в обране.
          </p>

          {favoriteListings.length === 0 ? (
            <div style={{ textAlign: 'center', margin: '60px 0', color: '#717171' }}>
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#b0b0b0" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 16px' }}>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px' }}>Список обраного порожній</p>
              <p style={{ fontSize: '14px', margin: 0 }}>Зберігайте речі, які вас зацікавили, щоб не загубити їх.</p>
              <button 
                className="primary" 
                onClick={() => setActiveView('listings')} 
                style={{ marginTop: '20px', borderRadius: '20px', padding: '10px 24px' }}
              >
                Перейти до оголошень
              </button>
            </div>
          ) : (
            <section className="listings-grid full-grid">
              {favoriteListings.map(item => (
                <div 
                  key={item.id} 
                  className="listing-card"
                  onClick={() => {
                    window.open(`/?listing=${item.id}`, '_blank');
                  }}
                  style={{ position: 'relative' }}
                >
                  <button 
                    className="card-favorite-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaveListing(item.id);
                    }}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      zIndex: 10,
                      transition: 'transform 0.15s ease',
                      padding: '0'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                    title="Зберегти"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" 
                      fill="#10B981" 
                      stroke="#10B981" 
                      strokeWidth="2.5"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>

                  {item.imageUrls?.[0] || item.imageUrl ? (
                    <img src={item.imageUrls?.[0] || item.imageUrl || ''} alt={item.title} className="listing-card-image" />
                  ) : (
                    <div className="listing-card-placeholder">Фото відсутнє</div>
                  )}
                  <div className="listing-card-title">{item.title}</div>
                  <div className="listing-card-meta">
                    {item.category?.name} • {item.location}
                  </div>
                  <div className="listing-card-price-row">
                    <span className="listing-card-price">{item.price} грн</span>
                    <span className="listing-card-rating">
                      ★ {item.avgRating !== null && item.avgRating !== undefined ? `${item.avgRating} (${item.reviewCount})` : 'Нове'}
                    </span>
                  </div>
                </div>
              ))}
            </section>
          )}
        </div>
      )}

      {/* Вкладка: Мої оренди (як орендар) */}
      {activeView === 'rentals' && (
        <div>
          <h2>Мої оренди</h2>
          <p className="text-muted" style={{ marginBottom: '15px' }}>
            Тут відображається список речей, які ви надіслали запит на оренду.
          </p>

          {myRentals.length === 0 ? (
            <p style={{ margin: '30px 0', color: '#666' }}>Ви ще не орендували жодної речі.</p>
          ) : (
            (() => {
              const filtered = myRentals.filter(booking => {
                if (!rentalsSearchQuery.trim()) return true;
                const query = rentalsSearchQuery.toLowerCase();
                const titleMatch = booking.listing?.title?.toLowerCase().includes(query);
                const locationMatch = booking.listing?.location?.toLowerCase().includes(query);
                const ownerMatch = (booking.listing?.user ? `${booking.listing.user.firstName || ''} ${booking.listing.user.lastName || ''}` : '').toLowerCase().includes(query);
                return titleMatch || locationMatch || ownerMatch;
              });

              return (
                <>
                  <div style={{ marginBottom: '20px', maxWidth: '350px' }}>
                    <input 
                      type="text"
                      placeholder="Пошук орендованих речей..."
                      value={rentalsSearchQuery}
                      onChange={(e) => setRentalsSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #dddddd',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {filtered.length === 0 ? (
                    <p style={{ margin: '30px 0', color: '#666' }}>Нічого не знайдено за вашим запитом.</p>
                  ) : (
                    <div className="table-wrapper">
                      <table className="simple-table">
                        <thead>
                          <tr>
                            <th>Річ</th>
                            <th>Власник</th>
                            <th>Період оренди</th>
                            <th>Ціна</th>
                            <th>Статус</th>
                            <th style={{ width: '80px', textAlign: 'center' }}>Перегляд</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map(booking => {
                            const startStr = new Date(booking.startDate).toLocaleDateString('uk-UA');
                            const endStr = new Date(booking.endDate).toLocaleDateString('uk-UA');
                            let statusClass = 'status-pending';
                            let statusText = 'Очікує підтвердження';

                            if (booking.status === 'CONFIRMED') {
                              statusClass = 'status-confirmed';
                              statusText = 'Підтверджено';
                            } else if (booking.status === 'REJECTED') {
                              statusClass = 'status-rejected';
                              statusText = 'Відхилено';
                            } else if (booking.status === 'CANCELLED') {
                              statusClass = 'status-cancelled';
                              statusText = 'Скасовано';
                            } else if (booking.status === 'COMPLETED') {
                              statusClass = 'status-completed';
                              statusText = 'Завершено (повернуто)';
                            }

                            return (
                              <tr key={booking.id}>
                                <td>
                                  <a 
                                    href={`/?listing=${booking.listingId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ 
                                      fontWeight: 700, 
                                      color: 'var(--primary-color)', 
                                      textDecoration: 'none' 
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                                  >
                                    {booking.listing?.title}
                                  </a>
                                  <br />
                                  <span className="text-muted">Локація: {booking.listing?.location}</span>
                                </td>
                                <td>
                                  {booking.listing?.user ? (
                                    <>
                                      <strong>{`${booking.listing.user.firstName || ''} ${booking.listing.user.lastName || ''}`.trim()}</strong>
                                      <br />
                                      <span className="text-muted" style={{ fontSize: '12px' }}>
                                        {booking.listing.user.email}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-muted">Власник</span>
                                  )}
                                </td>
                                <td>{startStr} — {endStr}</td>
                                <td>
                                  <strong>{booking.totalPrice} грн</strong><br />
                                  <span className="text-muted">Застава: {booking.listing?.deposit} грн</span>
                                </td>
                                <td>
                                  <span className={`status-tag ${statusClass}`}>{statusText}</span>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <button
                                    onClick={() => {
                                      window.open(`/?listing=${booking.listingId}`, '_blank');
                                    }}
                                    title="Переглянути оголошення"
                                    className="rozetka-action-btn btn-view"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                      <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              );
            })()
          )}
        </div>
      )}

      {/* Вкладка: Мої оголошення (власні речі для оренди) */}
      {activeView === 'mylistings' && (
        <div>
          <h2>Мої оголошення</h2>
          <p className="text-muted" style={{ marginBottom: '15px' }}>
            Тут відображається список речей, які ви додали для оренди на платформі.
          </p>

          {myListings.length === 0 ? (
            <p style={{ margin: '30px 0', color: '#666' }}>
              Ви ще не додали жодного оголошення. Скористайтеся вкладкою «Додати оголошення».
            </p>
          ) : (
            (() => {
              const filtered = myListings.filter(item => {
                if (mySearchQuery.trim()) {
                  const q = mySearchQuery.toLowerCase();
                  const matchTitle = item.title.toLowerCase().includes(q);
                  const matchDesc = item.description.toLowerCase().includes(q);
                  if (!matchTitle && !matchDesc) return false;
                }
                if (myCategoryFilter) {
                  if (item.categoryId !== parseInt(myCategoryFilter, 10)) return false;
                }
                if (myStatusFilter !== 'all') {
                  const isUnderRepair = !!(item.brokenUntil && new Date(item.brokenUntil) > new Date());
                  if (myStatusFilter === 'repair' && !isUnderRepair) return false;
                  if (myStatusFilter === 'active' && isUnderRepair) return false;
                }
                return true;
              });

              const filterBar = (
                <div className="rozetka-filter-bar">
                  <div style={{ flex: '2', minWidth: '200px' }}>
                    <input 
                      type="text" 
                      placeholder="Пошук за назвою або описом..." 
                      value={mySearchQuery} 
                      onChange={(e) => setMySearchQuery(e.target.value)}
                      className="rozetka-filter-input"
                    />
                  </div>
                  <div 
                    className="rozetka-filter-segment" 
                    style={{ flex: '1', minWidth: '150px', position: 'relative', cursor: 'pointer' }}
                    onClick={() => setShowMyCategoryDropdown(!showMyCategoryDropdown)}
                  >
                    <div 
                      className="rozetka-filter-input"
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        borderColor: showMyCategoryDropdown ? '#00a046' : '#d2d2d2',
                        boxShadow: showMyCategoryDropdown ? '0 0 0 1px #00a046' : 'none'
                      }}
                    >
                      <span>
                        {myCategoryFilter ? (categories.find(c => String(c.id) === String(myCategoryFilter))?.name || 'Всі категорії') : 'Всі категорії'}
                      </span>
                      <svg 
                        viewBox="0 0 24 24" 
                        width="14" 
                        height="14" 
                        fill="none" 
                        stroke="#717171" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        style={{ 
                          transform: showMyCategoryDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s'
                        }}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>

                    {showMyCategoryDropdown && (
                      <ul 
                        className="rozetka-custom-dropdown"
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          backgroundColor: '#ffffff',
                          borderRadius: '4px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          border: '1px solid #d2d2d2',
                          marginTop: '4px',
                          padding: '4px 0',
                          listStyle: 'none',
                          zIndex: 1030,
                          maxHeight: '260px',
                          overflowY: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <li 
                          onClick={() => {
                            setMyCategoryFilter('');
                            setShowMyCategoryDropdown(false);
                          }}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            backgroundColor: myCategoryFilter === '' ? '#f5f5f5' : 'transparent',
                            fontWeight: myCategoryFilter === '' ? 600 : 500,
                            fontSize: '13px',
                            color: myCategoryFilter === '' ? '#00a046' : '#221f1f',
                            transition: 'background-color 0.1s'
                          }}
                          onMouseEnter={(e) => { if (myCategoryFilter !== '') e.currentTarget.style.backgroundColor = '#f5f5f5'; }}
                          onMouseLeave={(e) => { if (myCategoryFilter !== '') e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          Всі категорії
                        </li>
                        {categories.map((cat) => {
                          const isSelected = String(myCategoryFilter) === String(cat.id);
                          return (
                            <li 
                              key={cat.id}
                              onClick={() => {
                                setMyCategoryFilter(String(cat.id));
                                setShowMyCategoryDropdown(false);
                              }}
                              style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                backgroundColor: isSelected ? '#f5f5f5' : 'transparent',
                                fontWeight: isSelected ? 600 : 500,
                                fontSize: '13px',
                                color: isSelected ? '#00a046' : '#221f1f',
                                transition: 'background-color 0.1s'
                              }}
                              onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#f5f5f5'; }}
                              onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                            >
                              {cat.name}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                  <div 
                    className="rozetka-filter-segment" 
                    style={{ flex: '1', minWidth: '150px', position: 'relative', cursor: 'pointer' }}
                    onClick={() => setShowMyStatusDropdown(!showMyStatusDropdown)}
                  >
                    <div 
                      className="rozetka-filter-input"
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        borderColor: showMyStatusDropdown ? '#00a046' : '#d2d2d2',
                        boxShadow: showMyStatusDropdown ? '0 0 0 1px #00a046' : 'none'
                      }}
                    >
                      <span>
                        {myStatusFilter === 'all' && 'Будь-який статус'}
                        {myStatusFilter === 'active' && 'Справний (Активний)'}
                        {myStatusFilter === 'repair' && 'На ремонті'}
                      </span>
                      <svg 
                        viewBox="0 0 24 24" 
                        width="14" 
                        height="14" 
                        fill="none" 
                        stroke="#717171" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        style={{ 
                          transform: showMyStatusDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s'
                        }}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>

                    {showMyStatusDropdown && (
                      <ul 
                        className="rozetka-custom-dropdown"
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          backgroundColor: '#ffffff',
                          borderRadius: '4px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          border: '1px solid #d2d2d2',
                          marginTop: '4px',
                          padding: '4px 0',
                          listStyle: 'none',
                          zIndex: 1030,
                          maxHeight: '200px',
                          overflowY: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {[
                          { value: 'all', label: 'Будь-який статус' },
                          { value: 'active', label: 'Справний (Активний)' },
                          { value: 'repair', label: 'На ремонті' }
                        ].map((status) => {
                          const isSelected = myStatusFilter === status.value;
                          return (
                            <li 
                              key={status.value}
                              onClick={() => {
                                setMyStatusFilter(status.value);
                                setShowMyStatusDropdown(false);
                              }}
                              style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                backgroundColor: isSelected ? '#f5f5f5' : 'transparent',
                                fontWeight: isSelected ? 600 : 500,
                                fontSize: '13px',
                                color: isSelected ? '#00a046' : '#221f1f',
                                transition: 'background-color 0.1s'
                              }}
                              onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#f5f5f5'; }}
                              onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                            >
                              {status.label}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              );

              return (
                <>
                  {filterBar}
                  {filtered.length === 0 ? (
                    <p style={{ margin: '30px 0', color: '#666', textAlign: 'center' }}>
                      Нічого не знайдено за вибраними фільтрами.
                    </p>
                  ) : (
                    <div className="table-wrapper">
                      <table className="simple-table">
                        <thead>
                          <tr>
                            <th>Оголошення</th>
                            <th>Категорія</th>
                            <th>Ціна за добу</th>
                            <th>Застава</th>
                            <th>Дата додавання</th>
                            <th>Дії</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map(item => {
                            const dateStr = new Date(item.createdAt || '').toLocaleDateString('uk-UA');
                            const isUnderRepair = !!(item.brokenUntil && new Date(item.brokenUntil) > new Date());
                            return (
                              <tr key={item.id}>
                                <td>
                                  <a 
                                    href={`/?listing=${item.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ 
                                      fontWeight: 700, 
                                      color: 'var(--primary-color)', 
                                      textDecoration: 'none' 
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                                  >
                                    {item.title}
                                  </a>
                                  {isUnderRepair && (
                                    <span style={{ color: '#ef4444', fontWeight: 600, fontSize: '12px', marginLeft: '6px' }}>
                                      (На ремонті до {new Date(item.brokenUntil!).toLocaleDateString('uk-UA')})
                                    </span>
                                  )}
                                  <br />
                                  <span className="text-muted">Локація: {item.location}</span>
                                </td>
                                <td>{item.category?.name || 'Інше'}</td>
                                <td><strong>{item.price} грн</strong></td>
                                <td>{item.deposit} грн</td>
                                <td>{dateStr}</td>
                                <td>
                                  <div className="action-buttons">
                                    <button 
                                      onClick={() => {
                                        window.open(`/?listing=${item.id}`, '_blank');
                                      }}
                                      title="Переглянути"
                                      className="rozetka-action-btn btn-view"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                      </svg>
                                    </button>
                                    <button 
                                      onClick={() => openEditModal(item)}
                                      title="Редагувати"
                                      className="rozetka-action-btn btn-edit"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                                      </svg>
                                    </button>
                                    {isUnderRepair ? (
                                      <>
                                        <button 
                                          onClick={() => handleResolveBroken(item.id)}
                                          title="Полагодити"
                                          className="rozetka-action-btn btn-fix"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                            <polyline points="22 4 12 14.01 9 11.01"/>
                                          </svg>
                                        </button>
                                        <button 
                                          onClick={() => handleReportBroken(item.id)}
                                          title="Продовжити ремонт"
                                          className="rozetka-action-btn btn-extend"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                            <line x1="16" y1="2" x2="16" y2="6"/>
                                            <line x1="8" y1="2" x2="8" y2="6"/>
                                            <line x1="3" y1="10" x2="21" y2="10"/>
                                          </svg>
                                        </button>
                                      </>
                                    ) : (
                                      <button 
                                        onClick={() => handleReportBroken(item.id)}
                                        title="Повідомити про поломку"
                                        className="rozetka-action-btn btn-broken"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                          <line x1="12" y1="9" x2="12" y2="13"/>
                                          <line x1="12" y1="17" x2="12.01" y2="17"/>
                                        </svg>
                                      </button>
                                    )}
                                    <button 
                                      onClick={() => handleDeleteListing(item.id)}
                                      title="Видалити"
                                      className="rozetka-action-btn btn-delete"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                        <polyline points="3 6 5 6 21 6"/>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                        <line x1="10" y1="11" x2="10" y2="17"/>
                                        <line x1="14" y1="11" x2="14" y2="17"/>
                                      </svg>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              );
            })()
          )}
        </div>
      )}

      {/* Вкладка: Запити мені (як власник) */}
      {activeView === 'requests' && (
        <div>
          <h2>Запити на мої речі</h2>
          <p className="text-muted" style={{ marginBottom: '15px' }}>
            Тут відображаються запити від інших користувачів на оренду ваших речей.
          </p>

          {myRequests.length === 0 ? (
            <p style={{ margin: '30px 0', color: '#666' }}>На ваші речі ще не надходило запитів.</p>
          ) : (
            <div className="table-wrapper">
              <table className="simple-table">
                <thead>
                  <tr>
                    <th>Річ</th>
                    <th>Орендар</th>
                    <th>Період оренди</th>
                    <th>Вартість</th>
                    <th>Статус</th>
                    <th>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {myRequests.map(booking => {
                    const startStr = new Date(booking.startDate).toLocaleDateString('uk-UA');
                    const endStr = new Date(booking.endDate).toLocaleDateString('uk-UA');
                    let statusClass = 'status-pending';
                    let statusText = 'Очікує відповіді';

                    if (booking.status === 'CONFIRMED') {
                      statusClass = 'status-confirmed';
                      statusText = 'Схвалено вами';
                    } else if (booking.status === 'REJECTED') {
                      statusClass = 'status-rejected';
                      statusText = 'Відхилено вами';
                    } else if (booking.status === 'CANCELLED') {
                      statusClass = 'status-cancelled';
                      statusText = 'Скасовано орендарем';
                    } else if (booking.status === 'COMPLETED') {
                      statusClass = 'status-completed';
                      statusText = 'Завершено';
                    }

                    return (
                      <tr key={booking.id}>
                        <td>
                          <a 
                            href={`/?listing=${booking.listingId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ 
                              fontWeight: 700, 
                              color: 'var(--primary-color)', 
                              textDecoration: 'none' 
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                          >
                            {booking.listing?.title}
                          </a>
                        </td>
                        <td>
                          {booking.tenant ? `${booking.tenant.firstName || ''} ${booking.tenant.lastName || ''}`.trim() : 'Анонім'}<br />
                          <span className="text-muted">{booking.tenant?.email}</span>
                        </td>
                        <td>{startStr} — {endStr}</td>
                        <td>
                          <strong>{booking.totalPrice} грн</strong><br />
                          <span className="text-muted">Застава: {booking.listing?.deposit} грн</span>
                        </td>
                        <td>
                          <span className={`status-tag ${statusClass}`}>{statusText}</span>
                        </td>
                        <td>
                          {booking.status === 'PENDING' && (
                            <div className="action-buttons">
                              <button 
                                className="primary"
                                onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}
                              >
                                Підтвердити
                              </button>
                              <button 
                                className="danger"
                                onClick={() => handleStatusUpdate(booking.id, 'REJECTED')}
                              >
                                Відхилити
                              </button>
                            </div>
                          )}
                          {booking.status === 'CONFIRMED' && (
                            <div className="action-buttons">
                              <button 
                                className="primary"
                                onClick={() => handleStatusUpdate(booking.id, 'COMPLETED')}
                              >
                                Підтвердити повернення
                              </button>
                              <button 
                                className="danger"
                                onClick={() => handleOwnerCancelBooking(booking.id)}
                              >
                                Скасувати оренду (форс-мажор)
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
        </>
      ) : (
        <section className="listing-detail-page-container">

          {/* Airbnb Title & Meta Row */}
          <div className="listing-detail-header">
            <div className="listing-detail-header-left">
              <h1>{selectedListing.title}</h1>
              <div className="listing-detail-header-meta">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  ★ {selectedListing.avgRating !== null && selectedListing.avgRating !== undefined ? (
                    <>
                      {selectedListing.avgRating} •{' '}
                      <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => {
                        document.querySelector('.reviews-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}>
                        {selectedListing.reviewCount}{' '}
                        {(() => {
                          const rCount = selectedListing.reviewCount || 0;
                          return rCount % 10 === 1 && rCount % 100 !== 11
                            ? 'відгук'
                            : [2, 3, 4].includes(rCount % 10) && ![12, 13, 14].includes(rCount % 100)
                            ? 'відгуки'
                            : 'відгуків';
                        })()}
                      </span>
                    </>
                  ) : (
                    'Нове оголошення'
                  )}
                </span>
                <span>•</span>
                <span>Категорія: {selectedListing.category?.name}</span>
                <span>•</span>
                <a className="meta-location-link" onClick={() => {
                  document.querySelector('.map-section')?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  {selectedListing.location}
                </a>
              </div>
            </div>

            <div className="listing-detail-header-actions">
              <button className="listing-action-btn" onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setSuccessMsg('Посилання скопійовано в буфер обміну!');
              }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
                  <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round" />
                </svg>{' '}
                Поділитись
              </button>
              <button 
                className={`listing-action-btn ${savedListingIds.includes(selectedListing.id) ? 'saved' : ''}`} 
                onClick={() => toggleSaveListing(selectedListing.id)}
              >
                {savedListingIds.includes(selectedListing.id) ? (
                  <>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ display: 'inline-block', color: '#10B981', verticalAlign: 'middle', marginRight: '4px' }}>
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>{' '}
                    Збережено
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ display: 'inline-block', color: '#222222', verticalAlign: 'middle', marginRight: '4px' }}>
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>{' '}
                    Зберегти
                  </>
                )}
              </button>
            </div>
          </div>

          <div className={`listing-photo-grid photo-count-${getGalleryPhotos(selectedListing).length}`}>
            <div 
              className="photo-grid-main" 
              style={{ '--bg-image': `url(${getGalleryPhotos(selectedListing)[0]})` } as React.CSSProperties}
              onClick={() => {
                setLightboxPhotoIndex(0);
                setIsLightboxOpen(true);
              }}
            >
              <img src={getGalleryPhotos(selectedListing)[0]} alt={selectedListing.title} />
            </div>
            {getGalleryPhotos(selectedListing).slice(1).map((url, index) => (
              <div 
                key={index} 
                className="photo-grid-sub" 
                onClick={() => {
                  setLightboxPhotoIndex(index + 1);
                  setIsLightboxOpen(true);
                }}
              >
                <img src={url} alt={`${selectedListing.title} detail ${index + 1}`} />
              </div>
            ))}
            <button className="show-all-photos-btn" onClick={() => {
              setLightboxPhotoIndex(0);
              setIsLightboxOpen(true);
            }}>
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
                <path d="M2 2a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1V3a1 1 0 00-1-1H2zM2 6a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1V7a1 1 0 00-1-1H2zM1 11a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1H2a1 1 0 01-1-1v-1zM6 2a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1V3a1 1 0 00-1-1H6zM6 6a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1V7a1 1 0 00-1-1H6zM5 11a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1H6a1 1 0 01-1-1v-1zM10 2a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1V3a1 1 0 00-1-1h-1zM10 6a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1V7a1 1 0 00-1-1h-1zM9 11a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1z" />
              </svg>{' '}
              Показати всі фото
            </button>
          </div>

          {/* Core Content Layout */}
          <div className="listing-detail-layout">
            {/* Left Column */}
            <div>
              {/* Host Profile Card */}
              <div className="host-profile-card">
                <div className="host-info-text">
                  <h3>
                    Орендодавець:{' '}
                    {selectedListing.user
                      ? `${selectedListing.user.firstName || ''} ${selectedListing.user.lastName || ''}`.trim()
                      : 'Анонімний користувач'}
                  </h3>
                  <p>
                    Контактний email: {selectedListing.user?.email || 'не вказано'}
                    {selectedListing.user?.createdAt && (
                      <span> • на платформі з {new Date(selectedListing.user.createdAt).getFullYear()} року</span>
                    )}
                  </p>
                </div>
                <div className={`host-avatar-circle ${currentUser?.id === selectedListing.userId ? 'owner' : ''}`}>
                  {selectedListing.user?.firstName ? selectedListing.user.firstName.charAt(0).toUpperCase() : 'U'}
                </div>
              </div>

              {/* Bullet highlights */}
              <div className="listing-highlights">
                {selectedListing.instantBooking && (
                  <div className="highlight-item">
                    <div className="highlight-icon">
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" style={{ color: '#1890ff' }}>
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                    </div>
                    <div className="highlight-text">
                      <h4>Миттєве бронювання</h4>
                      <p>Власник схвалює запити автоматично, якщо обрані дати вільні.</p>
                    </div>
                  </div>
                )}
                
                {selectedListing.user?.ownerAvgRating !== undefined && selectedListing.user?.ownerAvgRating !== null && selectedListing.user.ownerAvgRating >= 4.5 && (
                  <div className="highlight-item">
                    <div className="highlight-icon">
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#10B981' }}>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="highlight-text">
                      <h4>Досвідчений власник</h4>
                      <p>Користувачі високо оцінюють роботу з цим орендодавцем (★ {selectedListing.user.ownerAvgRating}).</p>
                    </div>
                  </div>
                )}

                <div className="highlight-item">
                  <div className="highlight-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  </div>
                  <div className="highlight-text">
                    <h4>Повернення застави</h4>
                    <p>Застава у розмірі {selectedListing.deposit} грн повертається вам після безпечного завершення оренди.</p>
                  </div>
                </div>

                <div className="highlight-item">
                  <div className="highlight-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#222222' }}>
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div className="highlight-text">
                    <h4>Час отримання та повернення</h4>
                    <p>Отримання товару: <strong>з {selectedListing.checkInTime || '14:00'}</strong> • Повернення: <strong>до {selectedListing.checkOutTime || '12:00'}</strong> у вибрані дати.</p>
                  </div>
                </div>
              </div>

              {/* Expandable description */}
              <div className="expandable-description">
                <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>Опис речі</h3>
                <p 
                  className={`description-text ${selectedListing.description.length > 350 && !isDescriptionExpanded ? 'collapsed' : ''}`}
                  style={{ whiteSpace: 'pre-wrap', margin: 0 }}
                >
                  {selectedListing.description}
                </p>
                {selectedListing.description.length > 350 && (
                  <button 
                    className="description-expand-btn"
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  >
                    {isDescriptionExpanded ? (
                      <>
                        Згорнути опис{' '}
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" style={{ transform: 'rotate(180deg)', display: 'inline-block' }}>
                          <path d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        Читати далі{' '}
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" style={{ display: 'inline-block' }}>
                          <path d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Inline Double Calendar Section */}
              <div className="inline-calendar-section">
                <h3>Оберіть дати оренди</h3>
                <p className="text-muted">
                  {calculateSelectedNights() > 0 ? (
                    <>
                      Тривалість оренди:{' '}
                      <strong>
                        {(() => {
                          const n = calculateSelectedNights();
                          if (n % 10 === 1 && n % 100 !== 11) return `${n} доба`;
                          if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return `${n} доби`;
                          return `${n} діб`;
                        })()}
                      </strong>{' '}
                      ({formatCalendarDate(startDate)} — {formatCalendarDate(endDate)})
                    </>
                  ) : (
                    'Вкажіть період, щоб побачити точний розрахунок вартості'
                  )}
                </p>
                <div className="calendar-grid-container inline-calendar">
                  {renderMonthView(calendarMonth, true, false)}
                  {renderMonthView(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1), false, true)}
                </div>
                <div className="calendar-actions-row">
                  {(startDate || endDate) && (
                    <button 
                      type="button" 
                      className="calendar-clear-btn"
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                        setHoverDate(null);
                      }}
                    >
                      Очистити дати
                    </button>
                  )}
                </div>
              </div>

              {/* Leaflet Map Section */}
              {selectedListing.latitude !== undefined && selectedListing.latitude !== null &&
               selectedListing.longitude !== undefined && selectedListing.longitude !== null && (
                <div className="map-section" style={{ padding: '24px 0', borderBottom: '1px solid #ebebeb' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>Де ви будете</h3>
                  <p className="text-muted" style={{ marginBottom: '16px' }}>Локація: {selectedListing.location}</p>
                  <div style={{ height: '350px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #ebebeb' }}>
                    <BrowseMap 
                      listings={[selectedListing]} 
                      onListingSelect={() => {}} 
                      selectedListing={selectedListing} 
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Column Sticky Booking Box */}
            <div>
              <div className="booking-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '22px', fontWeight: 800 }}>{selectedListing.price} грн</span>
                    <span style={{ fontSize: '14px', color: '#717171' }}> / доба</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>
                    ★ {selectedListing.avgRating !== null && selectedListing.avgRating !== undefined ? (
                      `${selectedListing.avgRating} (${selectedListing.reviewCount})`
                    ) : (
                      'Нове'
                    )}
                  </div>
                </div>




                <p className="text-muted" style={{ marginBottom: '15px' }}>
                  Сума застави: <strong>{selectedListing.deposit} грн</strong> (повертається після завершення оренди)
                </p>

                {currentUser?.id === selectedListing.userId ? (
                  <div className="alert alert-info" style={{ fontSize: '13px', margin: 0 }}>
                    Це ваше оголошення. Ви не можете орендувати власну річ.
                  </div>
                ) : (
                  <form onSubmit={handleBookingSubmit}>
                    <div className="date-picker-relative-container">
                      <div className="airbnb-date-picker-trigger" onClick={() => setIsCalendarOpen(true)}>
                        <div className="airbnb-date-seg">
                          <span className="label">ДАТА ПОЧАТКУ</span>
                          <span className="value">{startDate ? new Date(startDate).toLocaleDateString('uk-UA') : 'Оберіть дату'}</span>
                        </div>
                        <div className="airbnb-date-divider"></div>
                        <div className="airbnb-date-seg">
                          <span className="label">ДАТА ЗАВЕРШЕННЯ</span>
                          <span className="value">{endDate ? new Date(endDate).toLocaleDateString('uk-UA') : 'Оберіть дату'}</span>
                        </div>
                      </div>

                      {isCalendarOpen && (
                        <>
                          <div className="calendar-dropdown-overlay" onClick={() => setIsCalendarOpen(false)} />
                          <div className="calendar-dropdown-content" onClick={(e) => e.stopPropagation()}>
                            <div className="calendar-modal-header" style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div className="calendar-nights-info" style={{ textAlign: 'left' }}>
                                {calculateSelectedNights() > 0 ? (
                                  <>
                                    <h2 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: 700 }}>
                                      {(() => {
                                        const n = calculateSelectedNights();
                                        if (n % 10 === 1 && n % 100 !== 11) return `${n} доба`;
                                        if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return `${n} доби`;
                                        return `${n} діб`;
                                      })()}
                                    </h2>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#717171' }}>
                                      {formatCalendarDate(startDate)} — {formatCalendarDate(endDate)}
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <h2 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: 700 }}>Оберіть дати</h2>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#717171' }}>Вкажіть період оренди</p>
                                  </>
                                )}
                              </div>

                              <div style={{ width: '310px' }}>
                                <div className="calendar-inputs-double-box">
                                  <div 
                                    className={`calendar-input-segment ${(!startDate || (startDate && endDate)) ? 'active' : ''}`}
                                    onClick={() => {
                                      setStartDate('');
                                      setEndDate('');
                                    }}
                                  >
                                    <span className="label">ПРИБУТТЯ</span>
                                    <div className="value-row">
                                      <span className="value" style={{ color: startDate ? '#222' : '#717171' }}>
                                        {startDate ? formatCalendarDate(startDate) : 'дд.мм.рррр'}
                                      </span>
                                      {startDate && (
                                        <button 
                                          type="button" 
                                          className="clear-date-icon"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setStartDate('');
                                            setEndDate('');
                                            setHoverDate(null);
                                          }}
                                        >
                                          ×
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <div 
                                    className={`calendar-input-segment ${(startDate && !endDate) ? 'active' : ''}`}
                                    onClick={() => {
                                      if (startDate) {
                                        setEndDate('');
                                      }
                                    }}
                                  >
                                    <span className="label">ВИЇЗД</span>
                                    <div className="value-row">
                                      <span className="value" style={{ color: endDate ? '#222' : '#717171' }}>
                                        {endDate ? formatCalendarDate(endDate) : 'дд.мм.рррр'}
                                      </span>
                                      {endDate && (
                                        <button 
                                          type="button" 
                                          className="clear-date-icon"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEndDate('');
                                            setHoverDate(null);
                                          }}
                                        >
                                          ×
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="calendar-grid-container" style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
                              {isMobileView ? (
                                renderMonthView(calendarMonth, true, true)
                              ) : (
                                <>
                                  {renderMonthView(calendarMonth, true, false)}
                                  {renderMonthView(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1), false, true)}
                                </>
                              )}
                            </div>

                            <div className="calendar-modal-footer" style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #ebebeb', paddingTop: '12px' }}>
                              <div>
                                {(startDate || endDate) && (
                                  <button 
                                    type="button" 
                                    className="calendar-clear-btn"
                                    onClick={() => {
                                      setStartDate('');
                                      setEndDate('');
                                      setHoverDate(null);
                                    }}
                                    style={{ padding: 0 }}
                                  >
                                    Очистити дати
                                  </button>
                                )}
                              </div>
                              <button 
                                type="button" 
                                className="calendar-close-btn"
                                onClick={() => setIsCalendarOpen(false)}
                                style={{ borderRadius: '24px', padding: '8px 16px', backgroundColor: '#222222', color: '#ffffff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                              >
                                Закрити
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {bookingDetails && (
                      <div className="booking-calculation">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{selectedListing.price} грн x {bookingDetails.days} діб</span>
                          <span>{bookingDetails.rentalPrice} грн</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Застава (завдаток)</span>
                          <span>{bookingDetails.deposit} грн</span>
                        </div>
                        <div className="booking-total-row">
                          <span>Разом</span>
                          <span>{bookingDetails.total} грн</span>
                        </div>
                      </div>
                    )}

                    <button 
                      type="submit" 
                      className="primary" 
                      style={{ width: '100%', marginTop: '15px', padding: '14px', fontSize: '16px', fontWeight: 700 }}
                      disabled={loading}
                    >
                      {loading ? 'Обробка...' : (selectedListing.instantBooking ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                          </svg>
                          Забронювати миттєво
                        </span>
                      ) : (
                        'Надіслати запит на оренду'
                      ))}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="reviews-section" style={{ marginTop: '48px', borderTop: '1px solid #ebebeb', paddingTop: '48px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', fontSize: '22px', fontWeight: 700 }}>
              <span style={{ color: '#ffc107' }}>★</span>
              <span>
                {(() => {
                  if (selectedListing.avgRating !== null && selectedListing.avgRating !== undefined) {
                    const rCount = selectedListing.reviewCount || 0;
                    const declension = rCount % 10 === 1 && rCount % 100 !== 11
                      ? 'відгук'
                      : [2, 3, 4].includes(rCount % 10) && ![12, 13, 14].includes(rCount % 100)
                      ? 'відгуки'
                      : 'відгуків';
                    return `${selectedListing.avgRating} • ${rCount} ${declension}`;
                  }
                  return 'Немає відгуків (Нове)';
                })()}
              </span>
            </h3>

            {/* Ratings Dashboard Progress Bars (only if reviews exist) */}
            {selectedListing.reviews && selectedListing.reviews.length > 0 && (
              <div className="reviews-dashboard">
                {[
                  { label: 'Точність опису', score: (selectedListing.avgRating || 5.0) },
                  { label: 'Спілкування', score: selectedListing.avgRating ? Math.min(5.0, selectedListing.avgRating + 0.1) : 5.0 },
                  { label: 'Чистота речі', score: selectedListing.avgRating ? Math.max(4.0, selectedListing.avgRating - 0.1) : 5.0 },
                  { label: 'Зручність отримання', score: (selectedListing.avgRating || 5.0) },
                  { label: 'Розташування', score: 5.0 },
                  { label: 'Співвідношення ціна/якість', score: (selectedListing.avgRating || 5.0) }
                ].map((item, idx) => (
                  <div key={idx} className="review-metric-row">
                    <span className="review-metric-label">{item.label}</span>
                    <div className="review-metric-progress-container">
                      <div className="metric-bar-bg">
                        <div className="metric-bar-fill" style={{ width: `${(item.score / 5.0) * 100}%` }}></div>
                      </div>
                      <span className="review-metric-score">{item.score.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reviews list */}
            {selectedListing.reviews && selectedListing.reviews.length > 0 ? (
              <div className="reviews-list-grid">
                {selectedListing.reviews.map((rev: any) => (
                  <div key={rev.id} className="review-card">
                    <div className="review-card-header">
                      <div className="review-card-avatar">
                        {rev.user?.firstName ? rev.user.firstName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <h4 className="review-card-name">
                          {rev.user ? `${rev.user.firstName || ''} ${rev.user.lastName || ''}`.trim() || rev.user.email : 'Користувач'}
                        </h4>
                        <p className="review-card-date">
                          {new Date(rev.createdAt).toLocaleDateString('uk-UA', { year: 'numeric', month: 'long' })}
                        </p>
                      </div>
                      <div className="review-card-rating">
                        {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                      </div>
                    </div>
                    <p className="review-card-comment">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#717171', fontSize: '16px', marginBottom: '40px' }}>
                Для цієї речі ще немає відгуків. Будьте першим, хто орендує та оцінить її!
              </p>
            )}

            {/* Leave a review form */}
            {currentUser && currentUser.id !== selectedListing.userId && 
             selectedListing.bookings?.some((b: any) => 
               b.tenantId === currentUser.id && 
               (b.status === 'COMPLETED' || (b.status === 'CONFIRMED' && new Date(b.endDate) <= new Date()))
             ) &&
             !selectedListing.reviews?.some((r: any) => r.userId === currentUser.id) && (
              <div className="add-review-box" style={{ 
                backgroundColor: '#f7f7f7', 
                borderRadius: '12px', 
                padding: '24px', 
                border: '1px solid #ebebeb',
                marginTop: '32px'
              }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Залишити відгук про річ</h4>
                
                <form onSubmit={handleReviewSubmit}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#222', letterSpacing: '0.5px' }}>
                      ВАША ОЦІНКА *
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = star <= (reviewHoverRating || reviewRating);
                        return (
                          <span
                            key={star}
                            onClick={() => setReviewRating(star)}
                            onMouseEnter={() => setReviewHoverRating(star)}
                            onMouseLeave={() => setReviewHoverRating(0)}
                            style={{
                              fontSize: '32px',
                              cursor: 'pointer',
                              color: isFilled ? '#ffc107' : '#dddddd',
                              transition: 'color 0.15s, transform 0.1s',
                              display: 'inline-block'
                            }}
                            className="star-icon"
                          >
                            ★
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label htmlFor="review-comment" style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#222', letterSpacing: '0.5px' }}>
                      ВАШ КОМЕНТАР *
                    </label>
                    <textarea
                      id="review-comment"
                      required
                      rows={4}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Поділіться враженнями від оренди цієї речі (стан, якість, робота з власником)..."
                      style={{ 
                        width: '100%', 
                        borderRadius: '8px', 
                        border: '1px solid #b0b0b0', 
                        padding: '12px',
                        fontSize: '14px',
                        backgroundColor: '#ffffff',
                        lineHeight: '1.4'
                      }}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="primary" 
                    disabled={loading || reviewRating === 0}
                    style={{ width: 'auto', padding: '10px 24px', fontSize: '14px' }}
                  >
                    {loading ? 'Надсилання...' : 'Надіслати відгук'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </section>
      )}

      {/* МОДАЛЬНЕ ВІКНО: Авторизація (Вхід / Реєстрація) */}
      {isAuthOpen && (
        <div className="modal-overlay" onClick={() => setIsAuthOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsAuthOpen(false)}>×</button>
            
            <div className="auth-tabs">
              <button 
                className={`auth-tab-btn ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => setAuthMode('login')}
              >
                Вхід
              </button>
              <button 
                className={`auth-tab-btn ${authMode === 'register' ? 'active' : ''}`}
                onClick={() => setAuthMode('register')}
              >
                Реєстрація
              </button>
            </div>

            <form onSubmit={handleAuthSubmit}>
              {authMode === 'register' && (
                <>
                  <div className="form-group">
                    <label htmlFor="firstName-input">Ім'я *</label>
                    <input 
                      type="text" 
                      id="firstName-input"
                      required
                      value={firstName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                      placeholder="Ваше ім'я..."
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName-input">Прізвище *</label>
                    <input 
                      type="text" 
                      id="lastName-input"
                      required
                      value={lastName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
                      placeholder="Ваше прізвище..."
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label htmlFor="email-input">Електронна пошта *</label>
                <input 
                  type="email" 
                  id="email-input"
                  required
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password-input">Пароль *</label>
                <input 
                  type="password" 
                  id="password-input"
                  required
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder="Мін. 6 символів"
                />
              </div>

              <button type="submit" className="primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
                {loading ? 'Завантаження...' : (authMode === 'login' ? 'Увійти' : 'Зареєструватися')}
              </button>
            </form>

            <div style={{ margin: '15px 0', textAlign: 'center', color: '#666', fontSize: '14px' }}>або</div>
            <div id="google-login-btn" style={{ display: 'flex', justifyContent: 'center' }}></div>
          </div>
        </div>
      )}

      {/* МОДАЛЬНЕ ВІКНО: Детальний перегляд речі та бронювання видалено для повносторінкового відображення вище */}

      {/* МОДАЛЬНЕ ВІКНО: Редагування оголошення */}
      {isEditOpen && editingListing && (
        <div className="modal-overlay" onClick={() => { setIsEditOpen(false); setEditingListing(null); }}>
          <div className="modal-content" style={{ maxWidth: '600px', overflowY: 'auto', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => { setIsEditOpen(false); setEditingListing(null); }}>×</button>
            
            <h2>Редагувати оголошення</h2>
            <form onSubmit={handleEditListingSubmit} style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label htmlFor="edit-title">Назва речі *</label>
                <input 
                  type="text" 
                  id="edit-title"
                  required 
                  value={editTitle}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEditTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-categoryId">Категорія *</label>
                <select 
                  id="edit-categoryId"
                  required
                  value={editCategoryId}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setEditCategoryId(e.target.value)}
                >
                  <option value="">Оберіть категорію</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edit-description">Опис речі *</label>
                <textarea 
                  id="edit-description"
                  required
                  rows={4}
                  value={editDescription}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEditDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label htmlFor="edit-price">Ціна за добу (грн) *</label>
                  <input 
                    type="number" 
                    id="edit-price"
                    required 
                    min="0"
                    value={editPrice}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEditPrice(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-deposit">Застава (грн) *</label>
                  <input 
                    type="number" 
                    id="edit-deposit"
                    required 
                    min="0"
                    value={editDeposit}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEditDeposit(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="edit-location">Локація (Місто, Район) *</label>
                <input 
                  type="text" 
                  id="edit-location"
                  required 
                  value={editLocation}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEditLocation(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Позначте розташування на карті</label>
                <MapSelector 
                  initialLatitude={editLatitude}
                  initialLongitude={editLongitude}
                  initialLocation={editLocation}
                  onChange={(data) => {
                    setEditLatitude(data.latitude);
                    setEditLongitude(data.longitude);
                    setEditLocation(data.address);
                  }}
                />
              </div>

            <div className="form-group">
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Фотографії речі</label>
              
              {!shouldReplaceImages ? (
                <div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    {editImagePreviews.map((url, index) => (
                      <div key={index} style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ccc' }}>
                        <img src={url} alt={`Поточне фото ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    onClick={() => {
                      setShouldReplaceImages(true);
                      setEditImageFiles([]);
                      setEditImagePreviews([]);
                    }}
                    style={{ fontSize: '13px', padding: '6px 12px', border: '1px solid #ccc', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}
                  >
                    Замінити всі фотографії
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#666' }}>Завантажте від 2 до 3 нових обов'язкових фото:</span>
                    <button 
                      type="button" 
                      onClick={() => {
                        setShouldReplaceImages(false);
                        setEditImageFiles([]);
                        setEditImagePreviews(editingListing?.imageUrls || []);
                      }}
                      style={{ fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0, color: '#666' }}
                    >
                      Скасувати заміну
                    </button>
                  </div>
                  <input 
                    type="file" 
                    id="edit-image"
                    accept="image/*"
                    multiple
                    onChange={handleEditImageChange}
                    disabled={editImageFiles.length >= 3}
                  />
                  {editImagePreviews.length > 0 && (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                      {editImagePreviews.map((url, index) => (
                        <div key={index} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ccc' }}>
                          <img src={url} alt={`Нове фото ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button 
                            type="button"
                            onClick={() => handleRemoveEditImage(index)}
                            style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(0, 0, 0, 0.6)',
                              color: '#fff',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              padding: 0
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {editImageFiles.length < 2 && (
                    <span style={{ color: '#10b981', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                      Потрібно завантажити щонайменше 2 фотографії (зараз: {editImageFiles.length})
                    </span>
                  )}
                  {editImageFiles.length > 0 && (
                    <span style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                      Вибрано {editImageFiles.length} з 3 фотографій
                    </span>
                  )}
                </div>
              )}
            </div>

              <div style={{ display: 'flex', gap: '15px', margin: '15px 0' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="editCheckInTime">Час отримання (Check-in)</label>
                  <select 
                    id="editCheckInTime"
                    value={editCheckInTime}
                    onChange={(e) => setEditCheckInTime(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                  >
                    {Array.from({ length: 24 }).map((_, h) => {
                      const time = `${String(h).padStart(2, '0')}:00`;
                      return <option key={time} value={time}>{time}</option>;
                    })}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="editCheckOutTime">Час повернення (Check-out)</label>
                  <select 
                    id="editCheckOutTime"
                    value={editCheckOutTime}
                    onChange={(e) => setEditCheckOutTime(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                  >
                    {Array.from({ length: 24 }).map((_, h) => {
                      const time = `${String(h).padStart(2, '0')}:00`;
                      return <option key={time} value={time}>{time}</option>;
                    })}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '15px 0' }}>
                <input 
                  type="checkbox" 
                  id="edit-instantBooking" 
                  checked={editInstantBooking}
                  onChange={(e) => setEditInstantBooking(e.target.checked)}
                  style={{ width: 'auto', margin: 0, cursor: 'pointer' }}
                />
                <label htmlFor="edit-instantBooking" style={{ marginBottom: 0, fontWeight: 500, cursor: 'pointer' }}>
                  Миттєве бронювання (схвалювати оренду автоматично, якщо дати вільні)
                </label>
              </div>

              <button type="submit" className="primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
                {loading ? 'Збереження...' : 'Зберегти зміни'}
              </button>
            </form>
          </div>
        </div>
      )}


      {/* МОДАЛЬНЕ ВІКНО: Слайдер фотографій (Lightbox) */}
      {isLightboxOpen && selectedListing && (
        <div className="lightbox-modal" onClick={() => setIsLightboxOpen(false)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close-btn" onClick={() => setIsLightboxOpen(false)}>×</button>
            <img 
              src={getGalleryPhotos(selectedListing)[lightboxPhotoIndex]} 
              alt={`${selectedListing.title} full view ${lightboxPhotoIndex}`} 
              className="lightbox-img"
            />
            {getGalleryPhotos(selectedListing).length > 1 && (
              <>
                <button 
                  className="lightbox-nav-btn prev" 
                  onClick={() => setLightboxPhotoIndex((prev) => (prev === 0 ? getGalleryPhotos(selectedListing).length - 1 : prev - 1))}
                >
                  ‹
                </button>
                <button 
                  className="lightbox-nav-btn next" 
                  onClick={() => setLightboxPhotoIndex((prev) => (prev === getGalleryPhotos(selectedListing).length - 1 ? 0 : prev + 1))}
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {isRepairModalOpen && (
        <div className="modal-overlay" onClick={() => { setIsRepairModalOpen(false); setRepairListingId(null); }}>
          <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => { setIsRepairModalOpen(false); setRepairListingId(null); }}>×</button>
            <h2 style={{ marginBottom: '10px' }}>Повідомити про поломку</h2>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px', lineHeight: '1.4' }}>
              Вкажіть дату, до якої товар буде в ремонті. Всі бронювання, які перетинаються з цим періодом, будуть скасовані автоматично, а орендарі отримають сповіщення з вашим коментарем.
            </p>
            <form onSubmit={handleRepairSubmit}>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label htmlFor="repair-until-date" style={{ fontWeight: 500, display: 'block', marginBottom: '6px' }}>Ремонт до (включно) *</label>
                <input 
                  type="date" 
                  id="repair-until-date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={repairUntilDate}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setRepairUntilDate(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label htmlFor="repair-reason" style={{ fontWeight: 500, display: 'block', marginBottom: '6px' }}>Причина скасування бронювань *</label>
                <textarea 
                  id="repair-reason"
                  required
                  rows={4}
                  value={repairReason}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setRepairReason(e.target.value)}
                  placeholder="Опишіть причину поломки/ремонту, яка буде надіслана орендарям..."
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', resize: 'vertical', minHeight: '100px' }}
                />
              </div>

              <button type="submit" className="primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
                {loading ? 'Надіслання...' : 'Підтвердити та скасувати бронювання'}
              </button>
            </form>
          </div>
        </div>
      )}

      {confirmAction && (
        <div className="modal-overlay" onClick={() => setConfirmAction(null)}>
          <div className="modal-content" style={{ maxWidth: '440px', padding: '24px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setConfirmAction(null)}>×</button>
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#222' }}>Підтвердження дії</h3>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>
              {confirmAction.message}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setConfirmAction(null)}
                style={{ 
                  flex: 1, 
                  padding: '12px', 
                  borderRadius: '8px', 
                  border: '1px solid #ccc', 
                  background: '#fff', 
                  color: '#222', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                Скасувати
              </button>
              <button 
                className="primary" 
                onClick={() => {
                  confirmAction.onConfirm();
                  setConfirmAction(null);
                }}
                style={{ 
                  flex: 1, 
                  padding: '12px', 
                  borderRadius: '8px', 
                  fontWeight: 600, 
                  cursor: 'pointer' 
                }}
              >
                Підтвердити
              </button>
            </div>
          </div>
        </div>
      )}
      </main>

      {/* Багатий футер у стилі Airbnb */}
      <footer className="app-footer">
        <div className="footer-grid">
          <div className="footer-column">
            <h4>RentLocal</h4>
            <a href="#about">Про нас</a>
            <a href="#careers">Кар'єра</a>
            <a href="#news">Новини RentLocal</a>
            <a href="#features">Особливості сервісу</a>
          </div>
          <div className="footer-column">
            <h4>Оренда речей</h4>
            <a href="#how-it-works">Як орендувати</a>
            <a href="#safety">Безпечна оренда</a>
            <a href="#rules">Правила спільноти</a>
            <a href="#insurance">Страхування та застава</a>
          </div>
          <div className="footer-column">
            <h4>Підтримка</h4>
            <a href="mailto:bodnar.anastasiia.2007@gmail.com" style={{ fontWeight: 600, color: '#10B981' }}>
              bodnar.anastasiia.2007@gmail.com
            </a>
            <a href="#help-center">Центр допомоги</a>
            <a href="#report">Повідомити про проблему</a>
            <a href="#trust">Довіра та безпека</a>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-left">
            <span>© {new Date().getFullYear()} RentLocal, Inc.</span>
            <span className="footer-dot">•</span>
            <a href="#privacy">Конфіденційність</a>
            <span className="footer-dot">•</span>
            <a href="#terms">Умови</a>
            <span className="footer-dot">•</span>
            <a href="#sitemap">Карта сайту</a>
          </div>
          <div className="footer-right">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', height: '16px', width: '16px', fill: 'currentColor' }}>
                <path d="m8.002.25a7.77 7.77 0 0 1 7.748 7.776 7.75 7.75 0 0 1 -7.521 7.72l-.246.004a7.75 7.75 0 0 1 -7.73-7.502l-.018-.274a7.75 7.75 0 0 1 7.747-7.724zm0 1.5a6.25 6.25 0 1 0 0 12.5 6.25 6.25 0 0 0 0-12.5zm0 1a4.93 4.93 0 0 1 1.75 3.75h-3.5a4.93 4.93 0 0 1 1.75-3.75zm1.75 5.25h-3.5a4.93 4.93 0 0 1 1.75 3.75 4.93 4.93 0 0 1 -1.75-3.75zm3.72-1.5c-.29-1.57-.96-2.95-1.92-3.93a6.2 6.2 0 0 1 1.92 3.93zm-9.04 0h-1.68a6.2 6.2 0 0 1 1.68-3.93 6.22 6.22 0 0 0 -1.68 3.93zm9.04 1.5a6.2 6.2 0 0 1 -1.92 3.93c.96-.98 1.63-2.36 1.92-3.93zm-9.04 0a6.22 6.22 0 0 0 1.68 3.93 6.2 6.2 0 0 1 -1.68-3.93z"></path>
              </svg>
              Українська (UA)
            </span>
            <span style={{ fontWeight: 600 }}>₴ UAH</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
