import { useState, useEffect, useCallback } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { authAPI, categoryAPI, listingAPI, bookingAPI, notificationAPI, reviewAPI, favoriteAPI } from './services/api';
import type { ListingFilters } from './services/api';
import './App.css';

// Import Types
import type { Category, User, Listing, Booking, Notification, ViewType, AuthMode } from './types';

// Import Helpers
import { POPULAR_UKRAINIAN_LOCATIONS } from './utils/helpers';

// Import Components
import { Header } from './components/Header';
import { CategoryBar } from './components/CategoryBar';
import { ListingGrid } from './components/ListingGrid';
import { CreateListing } from './components/CreateListing';
import { Favorites } from './components/Favorites';
import { MyRentals } from './components/MyRentals';
import { MyListings } from './components/MyListings';
import { MyRequests } from './components/MyRequests';
import { ListingDetails } from './components/ListingDetails';
import { AuthModal } from './components/AuthModal';
import { EditListingModal } from './components/EditListingModal';
import { Lightbox } from './components/Lightbox';
import { RepairModal } from './components/RepairModal';
import { ConfirmModal } from './components/ConfirmModal';
import { Footer } from './components/Footer';

function App() {
  // Користувач та авторизація
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

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
  const [reviewComment, setReviewComment] = useState<string>( '');

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
      const nameParts = displayName.split(',').map((p: string) => p.trim());
      return displayName.startsWith(query) || nameParts.some((part: string) => part.startsWith(query));
    });

    setLocationSuggestions(localMatches.slice(0, 5));

    // 2. ДЕБАУНСОВАНИЙ ФОНОВИЙ ЗАПИТ ДО NOMINATIM для пошуку інших міст
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}&accept-language=uk&countrycodes=ua&limit=30`
        );
        if (response.ok) {
          const results = await response.json();
          const settlements = results.filter((item: any) => {
            const isPlaceOrBoundary = item.class === 'place' || item.class === 'boundary';
            const forbiddenTypes = ['postcode', 'railway', 'station', 'bus_stop', 'highway', 'street', 'house'];
            if (!isPlaceOrBoundary || forbiddenTypes.includes(item.type)) return false;

            const displayName = item.display_name.toLowerCase();
            const nameParts = displayName.split(',').map((p: string) => p.trim());
            const cityName = nameParts[0];

            return cityName.startsWith(query) || nameParts.some((part: string) => part.startsWith(query));
          });

          const parsed = settlements.map((item: any) => {
            const parts = item.display_name.split(',');
            const display = parts.slice(0, 3).map((p: string) => p.trim()).join(', ');
            return {
              display_name: display,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon)
            };
          });

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
    }, 150);

    return () => clearTimeout(delayDebounceFn);
  }, [locationQuery]);

  // Закриття підказок та випадних меню при кліку ззовні
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.filter-segment')) {
        setShowSuggestions(false);
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

  const getLocalDateString = (dateObjOrStr: Date | string) => {
    const d = new Date(dateObjOrStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
    setShowMap(false);
    setTimeout(() => {
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
  const handleGoogleCredentialResponse = useCallback(async (response: any) => {
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
  }, []);

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
    defaultDate.setDate(defaultDate.getDate() + 7);
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
      
      await loadListingDetails(selectedListing.id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Не вдалося надіслати відгук');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="app-container">
      <div className="sticky-header-wrapper">
        <Header 
          currentUser={currentUser}
          activeView={activeView}
          selectedListing={selectedListing}
          notifications={notifications}
          savedListingIds={savedListingIds}
          categories={categories}
          locationQuery={locationQuery}
          setLocationQuery={setLocationQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          minPriceQuery={minPriceQuery}
          setMinPriceQuery={setMinPriceQuery}
          maxPriceQuery={maxPriceQuery}
          setMaxPriceQuery={setMaxPriceQuery}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          locationSuggestions={locationSuggestions}
          showSuggestions={showSuggestions}
          setShowSuggestions={setShowSuggestions}
          handleSearchSubmit={handleSearchSubmit}
          handleClearFilters={handleClearFilters}
          handleMarkAllAsRead={handleMarkAllAsRead}
          handleMarkAsRead={handleMarkAsRead}
          handleLogout={handleLogout}
          handleGuestAction={handleGuestAction}
          setActiveView={setActiveView}
          setSelectedListing={setSelectedListing}
          setMapCenter={(center) => setMapCenter(center)}
          setAuthMode={setAuthMode}
          setIsAuthOpen={setIsAuthOpen}
        />

        {activeView === 'listings' && !selectedListing && (
          <CategoryBar 
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        )}
      </div>

      {/* Системні сповіщення */}
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
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: successMsg ? '#e6f4ea' : '#fce8e6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <span style={{ color: successMsg ? '#10B981' : '#EF4444', fontWeight: 'bold', fontSize: '14px' }}>
              {successMsg ? '✓' : '!'}
            </span>
          </div>
          <span style={{ fontSize: '14px', color: '#222222', fontWeight: 500, lineHeight: '1.4' }}>
            {successMsg || errorMsg}
          </span>
        </div>
      )}

      <main className="main-content">
        {!selectedListing ? (
          <>
            {activeView === 'listings' && (
              <ListingGrid 
                listings={listings}
                savedListingIds={savedListingIds}
                toggleSaveListing={toggleSaveListing}
                selectedListing={selectedListing}
                showMap={showMap}
                isMobileMapOpen={isMobileMapOpen}
                setIsMobileMapOpen={setIsMobileMapOpen}
                mapCenter={mapCenter || [50.4501, 30.5234]}
              />
            )}

            {activeView === 'create' && (
              <CreateListing 
                categories={categories}
                newTitle={newTitle}
                setNewTitle={setNewTitle}
                newCategoryId={newCategoryId}
                setNewCategoryId={setNewCategoryId}
                newDescription={newDescription}
                setNewDescription={setNewDescription}
                newPrice={newPrice}
                setNewPrice={setNewPrice}
                newDeposit={newDeposit}
                setNewDeposit={setNewDeposit}
                newLocation={newLocation}
                setNewLocation={setNewLocation}
                newLatitude={newLatitude}
                setNewLatitude={setNewLatitude}
                newLongitude={newLongitude}
                setNewLongitude={setNewLongitude}
                imageFiles={imageFiles}
                imagePreviews={imagePreviews}
                handleImageChange={handleImageChange}
                handleRemoveImage={handleRemoveImage}
                newCheckInTime={newCheckInTime}
                setNewCheckInTime={setNewCheckInTime}
                newCheckOutTime={newCheckOutTime}
                setNewCheckOutTime={setNewCheckOutTime}
                newInstantBooking={newInstantBooking}
                setNewInstantBooking={setNewInstantBooking}
                handleCreateListingSubmit={handleCreateListingSubmit}
                loading={loading}
              />
            )}

            {activeView === 'favorites' && (
              <Favorites 
                favoriteListings={favoriteListings}
                savedListingIds={savedListingIds}
                toggleSaveListing={toggleSaveListing}
                setActiveView={setActiveView}
              />
            )}

            {activeView === 'rentals' && (
              <MyRentals 
                myRentals={myRentals}
                rentalsSearchQuery={rentalsSearchQuery}
                setRentalsSearchQuery={setRentalsSearchQuery}
              />
            )}

            {activeView === 'mylistings' && (
              <MyListings 
                myListings={myListings}
                categories={categories}
                mySearchQuery={mySearchQuery}
                setMySearchQuery={setMySearchQuery}
                myCategoryFilter={myCategoryFilter}
                setMyCategoryFilter={setMyCategoryFilter}
                myStatusFilter={myStatusFilter}
                setMyStatusFilter={setMyStatusFilter}
                showMyCategoryDropdown={showMyCategoryDropdown}
                setShowMyCategoryDropdown={setShowMyCategoryDropdown}
                showMyStatusDropdown={showMyStatusDropdown}
                setShowMyStatusDropdown={setShowMyStatusDropdown}
                openEditModal={openEditModal}
                handleResolveBroken={handleResolveBroken}
                handleReportBroken={handleReportBroken}
                handleDeleteListing={handleDeleteListing}
              />
            )}

            {activeView === 'requests' && (
              <MyRequests 
                myRequests={myRequests}
                handleStatusUpdate={handleStatusUpdate}
                handleOwnerCancelBooking={handleOwnerCancelBooking}
              />
            )}
          </>
        ) : (
          <ListingDetails 
            selectedListing={selectedListing}
            currentUser={currentUser}
            savedListingIds={savedListingIds}
            toggleSaveListing={toggleSaveListing}
            setSuccessMsg={setSuccessMsg}
            setLightboxPhotoIndex={setLightboxPhotoIndex}
            setIsLightboxOpen={setIsLightboxOpen}
            isDescriptionExpanded={isDescriptionExpanded}
            setIsDescriptionExpanded={setIsDescriptionExpanded}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            hoverDate={hoverDate}
            setHoverDate={setHoverDate}
            isCalendarOpen={isCalendarOpen}
            setIsCalendarOpen={setIsCalendarOpen}
            bookedDates={bookedDates}
            calendarMonth={calendarMonth}
            setCalendarMonth={setCalendarMonth}
            isMobileView={isMobileView}
            handleBookingSubmit={handleBookingSubmit}
            loading={loading}
            reviewRating={reviewRating}
            setReviewRating={setReviewRating}
            reviewHoverRating={reviewHoverRating}
            setReviewHoverRating={setReviewHoverRating}
            reviewComment={reviewComment}
            setReviewComment={setReviewComment}
            handleReviewSubmit={handleReviewSubmit}
          />
        )}
      </main>

      <AuthModal 
        isAuthOpen={isAuthOpen}
        setIsAuthOpen={setIsAuthOpen}
        authMode={authMode}
        setAuthMode={setAuthMode}
        firstName={firstName}
        setFirstName={setFirstName}
        lastName={lastName}
        setLastName={setLastName}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        handleAuthSubmit={handleAuthSubmit}
        handleGoogleCredentialResponse={handleGoogleCredentialResponse}
        loading={loading}
      />

      <EditListingModal 
        isEditOpen={isEditOpen}
        setIsEditOpen={setIsEditOpen}
        editingListing={editingListing}
        setEditingListing={setEditingListing}
        categories={categories}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editCategoryId={editCategoryId}
        setEditCategoryId={setEditCategoryId}
        editDescription={editDescription}
        setEditDescription={setEditDescription}
        editPrice={editPrice}
        setEditPrice={setEditPrice}
        editDeposit={editDeposit}
        setEditDeposit={setEditDeposit}
        editLocation={editLocation}
        setEditLocation={setEditLocation}
        editLatitude={editLatitude}
        setEditLatitude={setEditLatitude}
        editLongitude={editLongitude}
        setEditLongitude={setEditLongitude}
        shouldReplaceImages={shouldReplaceImages}
        setShouldReplaceImages={setShouldReplaceImages}
        editImageFiles={editImageFiles}
        setEditImageFiles={setEditImageFiles}
        editImagePreviews={editImagePreviews}
        setEditImagePreviews={setEditImagePreviews}
        handleEditImageChange={handleEditImageChange}
        handleRemoveEditImage={handleRemoveEditImage}
        editCheckInTime={editCheckInTime}
        setEditCheckInTime={setEditCheckInTime}
        editCheckOutTime={editCheckOutTime}
        setEditCheckOutTime={setEditCheckOutTime}
        editInstantBooking={editInstantBooking}
        setEditInstantBooking={setEditInstantBooking}
        handleEditListingSubmit={handleEditListingSubmit}
        loading={loading}
      />

      <Lightbox 
        isLightboxOpen={isLightboxOpen}
        setIsLightboxOpen={setIsLightboxOpen}
        selectedListing={selectedListing}
        lightboxPhotoIndex={lightboxPhotoIndex}
        setLightboxPhotoIndex={setLightboxPhotoIndex}
      />

      <RepairModal 
        isRepairModalOpen={isRepairModalOpen}
        setIsRepairModalOpen={setIsRepairModalOpen}
        setRepairListingId={setRepairListingId}
        repairUntilDate={repairUntilDate}
        setRepairUntilDate={setRepairUntilDate}
        repairReason={repairReason}
        setRepairReason={setRepairReason}
        handleRepairSubmit={handleRepairSubmit}
        loading={loading}
      />

      <ConfirmModal 
        confirmAction={confirmAction}
        setConfirmAction={setConfirmAction}
      />

      <Footer />
    </div>
  );
}

export default App;
