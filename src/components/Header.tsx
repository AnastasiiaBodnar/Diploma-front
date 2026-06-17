import React, { useState } from 'react';
import type { FormEvent } from 'react';
import type { User, Category, Listing, Notification, ViewType, AuthMode, PopularLocation } from '../types';
import { renderHighlightedText } from '../utils/helpers';
import { NotificationsDropdown } from './NotificationsDropdown';

interface HeaderProps {
  currentUser: User | null;
  activeView: ViewType;
  selectedListing: Listing | null;
  notifications: Notification[];
  savedListingIds: number[];
  categories: Category[];
  
  // Search state
  locationQuery: string;
  setLocationQuery: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  minPriceQuery: string;
  setMinPriceQuery: (val: string) => void;
  maxPriceQuery: string;
  setMaxPriceQuery: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  
  // Suggestions
  locationSuggestions: PopularLocation[];
  showSuggestions: boolean;
  setShowSuggestions: (val: boolean) => void;
  
  // Handlers
  handleSearchSubmit: (e: FormEvent) => void;
  handleClearFilters: () => void;
  handleMarkAllAsRead: () => void;
  handleMarkAsRead: (id: number) => void;
  handleLogout: () => void;
  handleGuestAction: () => void;
  setActiveView: (view: ViewType) => void;
  setSelectedListing: (listing: Listing | null) => void;
  setMapCenter: (center: [number, number]) => void;
  setAuthMode: (mode: AuthMode) => void;
  setIsAuthOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeView,
  selectedListing,
  notifications,
  savedListingIds,
  categories,
  
  locationQuery,
  setLocationQuery,
  selectedCategory,
  setSelectedCategory,
  minPriceQuery,
  setMinPriceQuery,
  maxPriceQuery,
  setMaxPriceQuery,
  searchQuery,
  setSearchQuery,
  
  locationSuggestions,
  showSuggestions,
  setShowSuggestions,
  
  handleSearchSubmit,
  handleClearFilters,
  handleMarkAllAsRead,
  handleMarkAsRead,
  handleLogout,
  handleGuestAction,
  setActiveView,
  setSelectedListing,
  setMapCenter,
  setAuthMode,
  setIsAuthOpen
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <header className="app-header" style={{
      borderBottom: '1px solid #ebebeb',
      backgroundColor: '#ffffff',
      width: '100%',
      padding: '16px 24px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        maxWidth: '1440px',
        margin: '0 auto',
        flexWrap: 'wrap',
        gap: '16px'
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
                  <NotificationsDropdown 
                    notifications={notifications}
                    handleMarkAllAsRead={handleMarkAllAsRead}
                    handleMarkAsRead={handleMarkAsRead}
                  />
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
      </div>
    </header>
  );
};
