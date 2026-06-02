import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { authAPI, categoryAPI, listingAPI, bookingAPI, notificationAPI, reviewAPI } from './services/api';
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
  };
  createdAt?: string;
  instantBooking?: boolean; // Додано поле гібридного бронювання
  avgRating?: number | null;
  reviewCount?: number;
  reviews?: any[];
  bookings?: any[];
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

type ViewType = 'listings' | 'create' | 'rentals' | 'requests' | 'mylistings';
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
  const [locationQuery, setLocationQuery] = useState<string>('Хмельницький');
  const [minPriceQuery, setMinPriceQuery] = useState<string>('');
  const [maxPriceQuery, setMaxPriceQuery] = useState<string>('');

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

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
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>('');

  // Сповіщення (Notification Bell)
  const [notifications, setNotifications] = useState<Notification[]>([]);

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
  const [showMap, setShowMap] = useState<boolean>(true);

  interface LocationSuggestion {
    display_name: string;
    lat: number;
    lng: number;
  }

  // Стейт-змінні для автозаповнення локацій (як на Airbnb)
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>([49.4229, 26.9871]);

  // Кабінети
  const [myRentals, setMyRentals] = useState<Booking[]>([]);
  const [myRequests, setMyRequests] = useState<Booking[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);

  // Системні сповіщення та завантаження
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

  // Закриття підказок при кліку поза полем локації
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.filter-segment')) {
        setShowSuggestions(false);
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
  /*
  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err: any) {
      console.error('Помилка позначення сповіщення як прочитаного:', err.message);
    }
  };
  */

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

  // Закриття детального перегляду речі
  const handleCloseDetails = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('listing')) {
      // Спробуємо закрити вкладку, якщо вона була відкрита у новому вікні
      window.close();
      // Якщо закриття не спрацювало, просто очищаємо стейт та URL
      setSelectedListing(null);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      setSelectedListing(null);
    }
  };

  // Клік на день у кастомному календарі
  const handleDayClick = (dateStr: string) => {
    if (isDateInPast(dateStr) || isDateBusy(dateStr)) return;

    if (!startDate || (startDate && endDate)) {
      setStartDate(dateStr);
      setEndDate('');
    } else {
      const start = new Date(startDate);
      const end = new Date(dateStr);

      if (end < start) {
        setStartDate(dateStr);
        setEndDate('');
      } else {
        // Перевіряємо, чи немає зайнятих дат всередині діапазону
        const hasOverlap = bookedDates.some(bd => {
          const bStart = new Date(bd.startDate);
          const bEnd = new Date(bd.endDate);
          return start <= bEnd && end >= bStart;
        });

        if (hasOverlap) {
          // Якщо є накладання, робимо клікнуту дату новою початковою
          setStartDate(dateStr);
          setEndDate('');
        } else {
          setEndDate(dateStr);
        }
      }
    }
  };

  const isDateBusy = (dateStr: string) => {
    const d = new Date(dateStr);
    d.setHours(0,0,0,0);
    return bookedDates.some(bd => {
      const start = new Date(bd.startDate);
      const end = new Date(bd.endDate);
      start.setHours(0,0,0,0);
      end.setHours(0,0,0,0);
      return d >= start && d <= end;
    });
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
            const isBusy = isDateBusy(dateStr!);
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
  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (locationQuery.trim()) {
      setShowMap(true);
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
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Створення оголошення
  const handleCreateListingSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    if (!newTitle || !newDescription || !newPrice || !newDeposit || !newLocation || !newCategoryId) {
      setErrorMsg('Будь ласка, заповніть усі поля');
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
      if (newLatitude !== null) {
        formData.append('latitude', newLatitude.toString());
      }
      if (newLongitude !== null) {
        formData.append('longitude', newLongitude.toString());
      }
      if (imageFile) {
        formData.append('image', imageFile);
      }

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
      setImageFile(null);
      setImagePreview('');
      
      setActiveView('listings');
    } catch (err: any) {
      setErrorMsg(err.message || 'Не вдалося створити оголошення');
    } finally {
      setLoading(false);
    }
  };

  // Видалення власного оголошення
  const handleDeleteListing = async (id: number) => {
    if (!confirm('Ви впевнені, що хочете видалити це оголошення? Решта замовлень на цей предмет також будуть скасовані.')) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      await listingAPI.deleteListing(id);
      setSuccessMsg('Оголошення успішно видалено!');
      
      // Оновлюємо списки оголошень на екранах
      loadMyListings();
      loadListings();
    } catch (err: any) {
      setErrorMsg(err.message || 'Не вдалося видалити оголошення');
    } finally {
      setLoading(false);
    }
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
    setEditImageFile(null);
    setEditImagePreview(listing.imageUrl || '');
    setIsEditOpen(true);
  };

  // Обробка зміни фото при редагуванні
  const handleEditImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditImageFile(file);
      setEditImagePreview(URL.createObjectURL(file));
    }
  };

  // Збереження оновленого оголошення
  const handleEditListingSubmit = async (e: FormEvent) => {
    e.preventDefault();
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
      if (editLatitude !== null) {
        formData.append('latitude', editLatitude.toString());
      }
      if (editLongitude !== null) {
        formData.append('longitude', editLongitude.toString());
      }
      if (editImageFile) {
        formData.append('image', editImageFile);
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
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    if (!selectedListing) return;
    if (!startDate || !endDate) {
      setErrorMsg('Оберіть дати початку та завершення оренди');
      return;
    }

    // Перевірка на перетин дат на клієнті
    const start = new Date(startDate);
    const end = new Date(endDate);
    const hasOverlap = bookedDates.some(bd => {
      const bStart = new Date(bd.startDate);
      const bEnd = new Date(bd.endDate);
      return start <= bEnd && end >= bStart;
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
      setActiveView('rentals');
    } catch (err: any) {
      setErrorMsg(err.message || 'Помилка бронювання');
    } finally {
      setLoading(false);
    }
  };

  // Надіслати відгук про річ
  const handleReviewSubmit = async (e: FormEvent) => {
    e.preventDefault();
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

  // Скасування бронювання (орендарем)
  const handleCancelBooking = async (id: number) => {
    if (!confirm('Ви впевнені, що хочете скасувати цей запит на оренду?')) return;
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
  };

  // Скасування оренди власником (через поломку / форс-мажор)
  const handleOwnerCancelBooking = async (id: number) => {
    const reason = prompt("Вкажіть причину скасування оренди (наприклад: інструмент зламався, технічні причини):");
    if (reason === null) return; // Якщо натиснуто скасувати у діалоговому вікні
    
    setLoading(true);
    setErrorMsg(null);
    try {
      await bookingAPI.updateBookingStatus(id, 'CANCELLED', reason || 'технічні причини');
      setSuccessMsg('Бронювання скасовано, орендаря сповіщено про причину.');
      loadMyRequests();
    } catch (err: any) {
      setErrorMsg(err.message || 'Не вдалося скасувати оренду');
    } finally {
      setLoading(false);
    }
  };

  // Оновлення статусу власником (CONFIRMED або REJECTED)
  const handleStatusUpdate = async (id: number, status: 'CONFIRMED' | 'REJECTED') => {
    const text = status === 'CONFIRMED' ? 'підтвердити' : 'відхилити';
    if (!confirm(`Ви впевнені, що хочете ${text} цей запит?`)) return;
    setLoading(true);
    try {
      await bookingAPI.updateBookingStatus(id, status);
      setSuccessMsg(`Запит успішно ${status === 'CONFIRMED' ? 'підтверджено' : 'відхилено'}`);
      loadMyRequests();
    } catch (err: any) {
      setErrorMsg(err.message || 'Не вдалося змінити статус запиту');
    } finally {
      setLoading(false);
    }
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
    <div id="root">
      {/* Шапка сайту в стилі Airbnb */}
      <header className="app-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        borderBottom: '1px solid #ebebeb',
        position: 'sticky',
        top: 0,
        backgroundColor: '#ffffff',
        zIndex: 1020,
      }}>
        {/* Логотип */}
        <div 
          className="app-logo" 
          onClick={() => { setActiveView('listings'); setSelectedListing(null); }}
          style={{
            fontSize: '24px',
            fontWeight: 800,
            color: '#FF385C',
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
                      background: '#FF385C',
                      border: 'none',
                      color: '#ffffff',
                      border: 'none',
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
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E61E4D'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FF385C'}
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
            <button 
              onClick={() => setActiveView('create')}
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
          )}

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
              
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '1px',
                  right: '1px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#FF385C',
                  borderRadius: '50%',
                  border: '1px solid #ffffff'
                }}></span>
              )}
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
                      onClick={() => { setActiveView('mylistings'); }}
                      style={{ background: 'none', border: 'none', padding: '10px 16px', fontSize: '13px', textAlign: 'left', width: '100%', cursor: 'pointer', fontWeight: 500 }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f7f7f7'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      Мої оголошення
                    </button>
                    <button 
                      onClick={() => { setActiveView('rentals'); }}
                      style={{ background: 'none', border: 'none', padding: '10px 16px', fontSize: '13px', textAlign: 'left', width: '100%', cursor: 'pointer', fontWeight: 500 }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f7f7f7'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      Мої оренди
                    </button>
                    <button 
                      onClick={() => { setActiveView('requests'); }}
                      style={{ background: 'none', border: 'none', padding: '10px 16px', fontSize: '13px', textAlign: 'left', width: '100%', cursor: 'pointer', fontWeight: 500 }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f7f7f7'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      Запити на оренду
                    </button>
                    <button 
                      onClick={handleLogout}
                      style={{ background: 'none', border: 'none', padding: '10px 16px', fontSize: '13px', textAlign: 'left', width: '100%', cursor: 'pointer', fontWeight: 500, color: '#FF385C', borderTop: '1px solid #f0f0f0', marginTop: '4px' }}
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
              color: selectedCategory === '' ? '#FF385C' : '#717171',
              borderBottom: selectedCategory === '' ? '2px solid #FF385C' : '2px solid transparent',
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
                  color: isSelected ? '#FF385C' : '#717171',
                  borderBottom: isSelected ? '2px solid #FF385C' : '2px solid transparent',
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


      {/* Системні сповіщення */}
      {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {loading && <div className="alert alert-info">Завантаження...</div>}

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
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="listing-card-image" />
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
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.title} className="listing-card-image" />
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
              <label htmlFor="image">Фотографія речі</label>
              <input 
                type="file" 
                id="image"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="image-preview-box">
                  <img src={imagePreview} alt="Попередній перегляд" className="image-preview-img" />
                </div>
              )}
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

            <button type="submit" className="primary" style={{ width: '100%', marginTop: '10px' }}>
              Опублікувати оголошення
            </button>
          </form>
        </section>
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
            <div className="table-wrapper">
              <table className="simple-table">
                <thead>
                  <tr>
                    <th>Річ</th>
                    <th>Власник</th>
                    <th>Період оренди</th>
                    <th>Ціна</th>
                    <th>Статус</th>
                    <th>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {myRentals.map(booking => {
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
                    }

                    return (
                      <tr key={booking.id}>
                        <td>
                          <strong>{booking.listing?.title}</strong><br />
                          <span className="text-muted">Локація: {booking.listing?.location}</span>
                        </td>
                        <td>{booking.listing?.user ? `${booking.listing.user.firstName || ''} ${booking.listing.user.lastName || ''}`.trim() : 'Власник'}</td>
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
                            <button 
                              className="danger" 
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              Скасувати запит
                            </button>
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
                  {myListings.map(item => {
                    const dateStr = new Date(item.createdAt || '').toLocaleDateString('uk-UA');
                    return (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.title}</strong><br />
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
                            >
                              Переглянути
                            </button>
                            <button 
                              style={{ backgroundColor: '#ff9c6e', color: 'white' }}
                              onClick={() => openEditModal(item)}
                            >
                              Редагувати
                            </button>
                            <button 
                              className="danger" 
                              onClick={() => handleDeleteListing(item.id)}
                            >
                              Видалити
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
                    }

                    return (
                      <tr key={booking.id}>
                        <td>
                          <strong>{booking.listing?.title}</strong>
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
                            <button 
                              className="danger"
                              onClick={() => handleOwnerCancelBooking(booking.id)}
                            >
                              Скасувати оренду (форс-мажор)
                            </button>
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
          <div className="back-link-container">
            <button className="back-link-btn" onClick={handleCloseDetails}>
              ← Назад до оголошень
            </button>
          </div>

          <div className="listing-detail-page-content">
            <h2>{selectedListing.title}</h2>
            <p className="text-muted" style={{ marginBottom: '20px' }}>
              Категорія: {selectedListing.category?.name} | Локація: {selectedListing.location}
            </p>

            <div className="listing-detail-layout">
              <div>
                {selectedListing.imageUrl ? (
                  <img src={selectedListing.imageUrl} alt={selectedListing.title} className="detail-image" />
                ) : (
                  <div className="detail-placeholder">Фотографії немає</div>
                )}
                
                <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>Опис речі</h3>
                <p style={{ whiteSpace: 'pre-wrap' }}>{selectedListing.description}</p>
                
                <h4 style={{ marginTop: '20px', marginBottom: '5px' }}>Власник</h4>
                <p>
                  {selectedListing.user ? `${selectedListing.user.firstName || ''} ${selectedListing.user.lastName || ''}`.trim() : 'Анонімний користувач'} ({selectedListing.user?.email})
                  {selectedListing.user?.ownerAvgRating !== undefined && selectedListing.user?.ownerAvgRating !== null && (
                    <span style={{ 
                      marginLeft: '8px', 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '4px',
                      backgroundColor: '#f7f7f7', 
                      padding: '2px 8px', 
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#222'
                    }}>
                      ★ {selectedListing.user.ownerAvgRating} (рейтинг власника)
                    </span>
                  )}
                </p>

                {selectedListing.latitude !== undefined && selectedListing.latitude !== null &&
                 selectedListing.longitude !== undefined && selectedListing.longitude !== null && (
                  <div style={{ marginTop: '28px' }}>
                    <h3 style={{ marginBottom: '12px' }}>Розташування на карті</h3>
                    <div style={{ height: '360px', borderRadius: '12px', overflow: 'hidden' }}>
                      <BrowseMap 
                        listings={[selectedListing]} 
                        onListingSelect={() => {}} 
                        selectedListing={selectedListing} 
                      />
                    </div>
                  </div>
                )}

                {/* Розділ відгуків та рейтингів */}
                <div className="reviews-section" style={{ marginTop: '40px', borderTop: '1px solid #ebebeb', paddingTop: '32px' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '20px', fontWeight: 700 }}>
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

                  {/* Список існуючих відгуків */}
                  {selectedListing.reviews && selectedListing.reviews.length > 0 ? (
                    <div className="reviews-list" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '32px' }}>
                      {selectedListing.reviews.map((rev: any) => (
                        <div key={rev.id} className="review-item" style={{ borderBottom: '1px solid #f5f5f5', paddingBottom: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div>
                               <strong style={{ fontSize: '15px', color: '#222' }}>{rev.user ? `${rev.user.firstName || ''} ${rev.user.lastName || ''}`.trim() || rev.user.email : 'Користувач'}</strong>
                              <div style={{ fontSize: '12px', color: '#717171', marginTop: '2px' }}>
                                {new Date(rev.createdAt).toLocaleDateString('uk-UA', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </div>
                            </div>
                            <div style={{ color: '#ffc107', fontSize: '14px', letterSpacing: '1px' }}>
                              {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                            </div>
                          </div>
                          <p style={{ margin: 0, fontSize: '14px', color: '#333', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                            {rev.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#717171', fontSize: '14px', marginBottom: '32px' }}>
                      Для цієї речі ще немає відгуків. Будьте першим, хто орендує та оцінить її!
                    </p>
                  )}

                  {/* Форма залишення відгуку */}
                  {currentUser && currentUser.id !== selectedListing.userId && 
                   selectedListing.bookings?.some((b: any) => b.tenantId === currentUser.id && b.status === 'CONFIRMED') &&
                   !selectedListing.reviews?.some((r: any) => r.userId === currentUser.id) && (
                    <div className="add-review-box" style={{ 
                      backgroundColor: '#f7f7f7', 
                      borderRadius: '12px', 
                      padding: '24px', 
                      border: '1px solid #ebebeb' 
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
                          disabled={reviewRating === 0}
                          style={{ width: 'auto', padding: '10px 24px', fontSize: '14px' }}
                        >
                          Надіслати відгук
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="booking-box">
                  <h3>Оформити оренду</h3>
                  
                  {selectedListing.instantBooking && (
                    <div style={{
                      backgroundColor: '#e6f7ff',
                      color: '#1890ff',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      marginBottom: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style={{ display: 'inline-block' }}>
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                      <span>Миттєве підтвердження оренди</span>
                    </div>
                  )}

                  {bookedDates.length > 0 && (
                    <div style={{
                      backgroundColor: '#fffbe6',
                      border: '1px solid #ffe58f',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      fontSize: '12px',
                      color: '#d46b08',
                      marginBottom: '15px'
                    }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>Зайняті дати:</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {bookedDates.map((bd, index) => {
                          const s = new Date(bd.startDate).toLocaleDateString('uk-UA');
                          const e = new Date(bd.endDate).toLocaleDateString('uk-UA');
                          return (
                            <span key={index} style={{
                              backgroundColor: '#fff',
                              border: '1px solid #ffd591',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              fontSize: '11px'
                            }}>
                              {s} — {e}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="listing-card-price-row">
                    <span className="listing-card-price">{selectedListing.price} грн / добу</span>
                  </div>
                  <p className="text-muted" style={{ marginBottom: '15px' }}>
                    Сума завдатку (застави): <strong>{selectedListing.deposit} грн</strong> (повертається після оренди)
                  </p>

                  {currentUser?.id === selectedListing.userId ? (
                    <div className="alert alert-info" style={{ fontSize: '13px', margin: 0 }}>
                      Це ваше оголошення. Ви не можете орендувати власну річ.
                    </div>
                  ) : (
                    <form onSubmit={handleBookingSubmit}>
                      <div className="airbnb-date-picker-trigger" onClick={() => setIsCalendarOpen(true)}>
                        <div className="airbnb-date-seg">
                          <span className="label">ДАТА ПОЧАТКУ</span>
                          <span className="value">{startDate ? new Date(startDate).toLocaleDateString('uk-UA') : 'дд.мм.рррр'}</span>
                        </div>
                        <div className="airbnb-date-divider"></div>
                        <div className="airbnb-date-seg">
                          <span className="label">ДАТА ЗАВЕРШЕННЯ</span>
                          <span className="value">{endDate ? new Date(endDate).toLocaleDateString('uk-UA') : 'дд.мм.рррр'}</span>
                        </div>
                      </div>

                      {bookingDetails && (
                        <div className="booking-calculation">
                          <div>Тривалість оренди: {bookingDetails.days} дн.</div>
                          <div>Вартість оренди: {bookingDetails.rentalPrice} грн</div>
                          <div>Застава (завдаток): {bookingDetails.deposit} грн</div>
                          <div className="booking-total-row">
                            <span>Разом до сплати:</span>
                            <span>{bookingDetails.total} грн</span>
                          </div>
                        </div>
                      )}

                      <button 
                        type="submit" 
                        className="primary" 
                        style={{ width: '100%', marginTop: '15px' }}
                      >
                        {selectedListing.instantBooking ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                            </svg>
                            Забронювати миттєво
                          </span>
                        ) : (
                          'Надіслати запит на оренду'
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* МОДАЛЬНЕ ВІКНО: Авторизація (Вхід / Реєстрація) */}
      {isAuthOpen && (
        <div className="modal-overlay" onClick={() => setIsAuthOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsAuthOpen(false)}>Закрити</button>
            
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

              <button type="submit" className="primary" style={{ width: '100%', marginTop: '10px' }}>
                {authMode === 'login' ? 'Увійти' : 'Зареєструватися'}
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
            <button className="modal-close-btn" onClick={() => { setIsEditOpen(false); setEditingListing(null); }}>Закрити</button>
            
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
                <label htmlFor="edit-image">Фотографія речі (залиште порожнім, щоб зберегти поточне)</label>
                <input 
                  type="file" 
                  id="edit-image"
                  accept="image/*"
                  onChange={handleEditImageChange}
                />
                {editImagePreview && (
                  <div className="image-preview-box" style={{ marginTop: '10px' }}>
                    <img src={editImagePreview} alt="Попередній перегляд" className="image-preview-img" style={{ maxWidth: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }} />
                  </div>
                )}
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

              <button type="submit" className="primary" style={{ width: '100%', marginTop: '10px' }}>
                Зберегти зміни
              </button>
            </form>
          </div>
        </div>
      )}

      {/* МОДАЛЬНЕ ВІКНО: Кастомний інтерактивний календар Airbnb */}
      {isCalendarOpen && (
        <div className="calendar-modal-overlay" onClick={() => setIsCalendarOpen(false)}>
          <div className="calendar-modal-content" onClick={(e) => e.stopPropagation()}>
            
            <div className="calendar-modal-header">
              <div className="calendar-nights-info">
                {calculateSelectedNights() > 0 ? (
                  <>
                    <h2>
                      {(() => {
                        const n = calculateSelectedNights();
                        if (n % 10 === 1 && n % 100 !== 11) return `${n} доба`;
                        if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return `${n} доби`;
                        return `${n} діб`;
                      })()}
                    </h2>
                    <p>{formatCalendarDate(startDate)} — {formatCalendarDate(endDate)}</p>
                  </>
                ) : (
                  <>
                    <h2>Оберіть дати оренди</h2>
                    <p>Додайте дати отримання та повернення для розрахунку ціни</p>
                  </>
                )}
              </div>

              <div className="calendar-inputs-box">
                <div className="calendar-input-seg">
                  <span className="label">Прибуття</span>
                  <span className="value">{startDate ? formatCalendarDate(startDate) : 'дд.мм.рррр'}</span>
                </div>
                <div className="calendar-input-seg">
                  <span className="label">Виїзд</span>
                  <span className="value">{endDate ? formatCalendarDate(endDate) : 'дд.мм.рррр'}</span>
                </div>
              </div>
            </div>

            <div className="calendar-grid-container">
              {renderMonthView(calendarMonth, true, false)}
              {renderMonthView(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1), false, true)}
            </div>

            <div className="calendar-modal-footer">
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
              <button 
                type="button" 
                className="calendar-close-btn"
                onClick={() => setIsCalendarOpen(false)}
              >
                Закрити
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default App;
