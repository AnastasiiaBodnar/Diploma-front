import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { authAPI, categoryAPI, listingAPI, bookingAPI } from './services/api';
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
  name?: string;
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
    name: string;
    email: string;
  };
  createdAt?: string;
}

interface Booking {
  id: number;
  listingId: number;
  listing: Listing;
  tenantId: number;
  tenant: {
    id: number;
    name: string;
    email: string;
  };
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

type ViewType = 'listings' | 'create' | 'rentals' | 'requests' | 'mylistings';
type AuthMode = 'login' | 'register';

function App() {
  // Користувач та авторизація
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');

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

  // Модалка перегляду
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Створення оголошення
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newPrice, setNewPrice] = useState<string>('');
  const [newDeposit, setNewDeposit] = useState<string>('');
  const [newLocation, setNewLocation] = useState<string>('');
  const [newCategoryId, setNewCategoryId] = useState<string>('');
  const [newLatitude, setNewLatitude] = useState<number | null>(null);
  const [newLongitude, setNewLongitude] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Перемикач карти на мобільних пристроях
  const [isMobileMapOpen, setIsMobileMapOpen] = useState<boolean>(false);

  // Чи показувати карту на головній сторінці (тільки при фільтрі локації)
  const [showMap, setShowMap] = useState<boolean>(false);

  // Кабінети
  const [myRentals, setMyRentals] = useState<Booking[]>([]);
  const [myRequests, setMyRequests] = useState<Booking[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);

  // Системні сповіщення та завантаження
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Ініціалізація даних
  useEffect(() => {
    const token = localStorage.getItem('rentlocal_token');
    if (token) {
      loadUserProfile();
    }
    loadCategories();
    loadListings();
  }, []);

  // Перевантаження списків при зміні вкладок
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
  }, [activeView, currentUser]);

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
        const data = await authAPI.register({ email, password, name });
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
      setName('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Помилка авторизації');
    } finally {
      setLoading(false);
    }
  };

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
      setImageFile(null);
      setImagePreview('');
      
      setActiveView('listings');
    } catch (err: any) {
      setErrorMsg(err.message || 'Не вдалося створити оголошення');
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

    setLoading(true);
    setErrorMsg(null);

    try {
      await bookingAPI.createBooking({
        listingId: selectedListing.id,
        startDate,
        endDate,
      });
      setSuccessMsg('Запит на оренду успішно надіслано!');
      setSelectedListing(null);
      setStartDate('');
      setEndDate('');
      setActiveView('rentals');
    } catch (err: any) {
      setErrorMsg(err.message || 'Помилка бронювання');
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
      {/* Шапка сайту */}
      <header className="app-header">
        <div className="app-logo" onClick={() => setActiveView('listings')}>
          RentLocal
        </div>
        
        <nav className="app-nav">
          <button 
            className={`nav-tab ${activeView === 'listings' ? 'active' : ''}`}
            onClick={() => setActiveView('listings')}
          >
            Усі оголошення
          </button>
          
          {currentUser && (
            <>
              <button 
                className={`nav-tab ${activeView === 'create' ? 'active' : ''}`}
                onClick={() => setActiveView('create')}
              >
                Додати оголошення
              </button>
              <button 
                className={`nav-tab ${activeView === 'mylistings' ? 'active' : ''}`}
                onClick={() => setActiveView('mylistings')}
              >
                Мої оголошення
              </button>
              <button 
                className={`nav-tab ${activeView === 'rentals' ? 'active' : ''}`}
                onClick={() => setActiveView('rentals')}
              >
                Мої оренди
              </button>
              <button 
                className={`nav-tab ${activeView === 'requests' ? 'active' : ''}`}
                onClick={() => setActiveView('requests')}
              >
                Запити мені
              </button>
            </>
          )}
        </nav>

        <div className="user-badge">
          {currentUser ? (
            <>
              <span>Користувач: {currentUser.name || currentUser.email}</span>
              <button onClick={handleLogout}>Вийти</button>
            </>
          ) : (
            <button className="primary" onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }}>
              Вхід / Реєстрація
            </button>
          )}
        </div>
      </header>

      {/* Системні сповіщення */}
      {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {loading && <div className="alert alert-info">Завантаження...</div>}

      {/* Вкладка: Усі оголошення (Головна) */}
      {activeView === 'listings' && (
        <div>
          {/* Пошук та фільтри у стилі Airbnb */}
          <section className="filter-section">
            <form onSubmit={handleSearchSubmit} className="filter-grid">
              <div className="filter-segment">
                <label htmlFor="search-input">Що шукаєте?</label>
                <input 
                  type="text" 
                  id="search-input"
                  placeholder="Опис або назва..." 
                  value={searchQuery}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="filter-segment">
                <label htmlFor="category-select">Категорія</label>
                <select 
                  id="category-select"
                  value={selectedCategory} 
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Усі категорії</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="filter-segment">
                <label htmlFor="location-input">Де?</label>
                <input 
                  type="text" 
                  id="location-input"
                  placeholder="Місто або район..." 
                  value={locationQuery}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setLocationQuery(e.target.value)}
                />
              </div>

              <div className="filter-segment">
                <label>Бюджет (грн / добу)</label>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <input 
                    type="number" 
                    placeholder="Від" 
                    value={minPriceQuery}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setMinPriceQuery(e.target.value)}
                    style={{ padding: '4px 0', border: 'none' }}
                  />
                  <span style={{ color: '#ccc', alignSelf: 'center' }}>|</span>
                  <input 
                    type="number" 
                    placeholder="До" 
                    value={maxPriceQuery}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setMaxPriceQuery(e.target.value)}
                    style={{ padding: '4px 0', border: 'none' }}
                  />
                </div>
              </div>

              <div className="filter-actions">
                <button type="submit" className="search-pill-btn">Шукати</button>
                {(searchQuery || selectedCategory || locationQuery || minPriceQuery || maxPriceQuery) && (
                  <button type="button" className="clear-pill-btn" onClick={handleClearFilters}>Очистити</button>
                )}
              </div>
            </form>
          </section>

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
                      className={`listing-card ${selectedListing?.id === item.id ? 'active-highlight' : ''}`}
                      onClick={() => {
                        setSelectedListing(item);
                        setStartDate('');
                        setEndDate('');
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
                          className={`listing-card ${selectedListing?.id === item.id ? 'active-highlight' : ''}`}
                          onClick={() => {
                            setSelectedListing(item);
                            setStartDate('');
                            setEndDate('');
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
                      setSelectedListing(item);
                      setStartDate('');
                      setEndDate('');
                    }}
                    selectedListing={selectedListing}
                  />
                </div>
              </div>

              {/* Плаваюча кнопка для мобільних пристроїв */}
              <button 
                className="mobile-map-toggle-btn"
                onClick={() => setIsMobileMapOpen(!isMobileMapOpen)}
              >
                {isMobileMapOpen ? (
                  <>Список 📋</>
                ) : (
                  <>Карта 🗺️</>
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
                        <td>{booking.listing?.user?.name || 'Власник'}</td>
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
                          <button 
                            onClick={() => {
                              setSelectedListing(item);
                              setStartDate('');
                              setEndDate('');
                            }}
                          >
                            Переглянути
                          </button>
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
                          {booking.tenant?.name || 'Анонім'}<br />
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
                <div className="form-group">
                  <label htmlFor="name-input">Ім'я</label>
                  <input 
                    type="text" 
                    id="name-input"
                    value={name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    placeholder="Ваше ім'я..."
                  />
                </div>
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
          </div>
        </div>
      )}

      {/* МОДАЛЬНЕ ВІКНО: Детальний перегляд речі та бронювання */}
      {selectedListing && (
        <div className="modal-overlay" onClick={() => setSelectedListing(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedListing(null)}>Закрити</button>
            
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
                <p>{selectedListing.user?.name || 'Анонімний користувач'} ({selectedListing.user?.email})</p>

                {selectedListing.latitude !== undefined && selectedListing.latitude !== null &&
                 selectedListing.longitude !== undefined && selectedListing.longitude !== null && (
                  <div style={{ marginTop: '28px' }}>
                    <h3 style={{ marginBottom: '12px' }}>Розташування на карті</h3>
                    <div style={{ height: '260px', borderRadius: '12px', overflow: 'hidden' }}>
                      <BrowseMap 
                        listings={[selectedListing]} 
                        onListingSelect={() => {}} 
                        selectedListing={selectedListing} 
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="booking-box">
                  <h3>Оформити оренду</h3>
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
                      <div className="form-group">
                        <label htmlFor="startDate">Дата початку оренди</label>
                        <input 
                          type="date" 
                          id="startDate"
                          required
                          value={startDate}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="endDate">Дата завершення оренди</label>
                        <input 
                          type="date" 
                          id="endDate"
                          required
                          value={endDate}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                          min={startDate || new Date().toISOString().split('T')[0]}
                        />
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
                        Надіслати запит на оренду
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
