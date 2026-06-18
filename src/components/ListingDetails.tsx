import React from 'react';
import type { FormEvent } from 'react';
import type { Listing, User } from '../types';
import { getGalleryPhotos } from '../utils/helpers';
import { Calendar } from './Calendar';
import { BookingBox } from './BookingBox';
import { ReviewsSection } from './ReviewsSection';
import BrowseMap from './BrowseMap';

interface ListingDetailsProps {
  selectedListing: Listing;
  currentUser: User | null;
  savedListingIds: number[];
  toggleSaveListing: (id: number) => void;
  setSuccessMsg: (msg: string | null) => void;
  setLightboxPhotoIndex: (idx: number) => void;
  setIsLightboxOpen: (open: boolean) => void;
  
  isDescriptionExpanded: boolean;
  setIsDescriptionExpanded: (expanded: boolean) => void;
  
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  hoverDate: string | null;
  setHoverDate: (val: string | null) => void;
  isCalendarOpen: boolean;
  setIsCalendarOpen: (val: boolean) => void;
  bookedDates: any[];
  calendarMonth: Date;
  setCalendarMonth: (val: Date) => void;
  isMobileView: boolean;
  handleBookingSubmit: (e: FormEvent) => void;
  loading: boolean;

  reviewRating: number;
  setReviewRating: (val: number) => void;
  reviewHoverRating: number;
  setReviewHoverRating: (val: number) => void;
  reviewComment: string;
  setReviewComment: (val: string) => void;
  handleReviewSubmit: (e: FormEvent) => void;
}

export const ListingDetails: React.FC<ListingDetailsProps> = ({
  selectedListing,
  currentUser,
  savedListingIds,
  toggleSaveListing,
  setSuccessMsg,
  setLightboxPhotoIndex,
  setIsLightboxOpen,
  
  isDescriptionExpanded,
  setIsDescriptionExpanded,
  
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  hoverDate,
  setHoverDate,
  isCalendarOpen,
  setIsCalendarOpen,
  bookedDates,
  calendarMonth,
  setCalendarMonth,
  isMobileView,
  handleBookingSubmit,
  loading,

  reviewRating,
  setReviewRating,
  reviewHoverRating,
  setReviewHoverRating,
  reviewComment,
  setReviewComment,
  handleReviewSubmit
}) => {
  const isSaved = savedListingIds.includes(selectedListing.id);



  return (
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
                  <span 
                    style={{ textDecoration: 'underline', cursor: 'pointer' }} 
                    onClick={() => {
                      document.querySelector('.reviews-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
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
            <a 
              className="meta-location-link" 
              onClick={() => {
                document.querySelector('.map-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {selectedListing.location}
            </a>
          </div>
        </div>

        <div className="listing-detail-header-actions">
          <button 
            className="listing-action-btn" 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setSuccessMsg('Посилання скопійовано в буфер обміну!');
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round" />
            </svg>{' '}
            Поділитись
          </button>
          <button 
            className={`listing-action-btn ${isSaved ? 'saved' : ''}`} 
            onClick={() => toggleSaveListing(selectedListing.id)}
          >
            {isSaved ? (
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
        <button 
          className="show-all-photos-btn" 
          onClick={() => {
            setLightboxPhotoIndex(0);
            setIsLightboxOpen(true);
          }}
        >
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

          <Calendar 
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            hoverDate={hoverDate}
            setHoverDate={setHoverDate}
            bookedDates={bookedDates}
            calendarMonth={calendarMonth}
            setCalendarMonth={setCalendarMonth}
            mode="inline"
            isMobileView={isMobileView}
          />

          {/* Leaflet Map Section */}
          {selectedListing.latitude !== undefined && selectedListing.latitude !== null &&
           selectedListing.longitude !== undefined && selectedListing.longitude !== null && (
            <div className="map-section" style={{ padding: '24px 0', borderBottom: '1px solid #ebebeb' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>Локація речі</h3>
              <p className="text-muted" style={{ marginBottom: '16px' }}>Локація: {selectedListing.location}</p>
              <div style={{ height: '350px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #ebebeb' }}>
                <BrowseMap 
                  listings={[selectedListing]} 
                  onListingSelect={() => {}} 
                  selectedListing={selectedListing} 
                  mapCenter={[selectedListing.latitude, selectedListing.longitude]}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column Sticky Booking Box */}
        <BookingBox 
          selectedListing={selectedListing}
          currentUser={currentUser}
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
        />
      </div>

      <ReviewsSection 
        selectedListing={selectedListing}
        currentUser={currentUser}
        reviewRating={reviewRating}
        setReviewRating={setReviewRating}
        reviewHoverRating={reviewHoverRating}
        setReviewHoverRating={setReviewHoverRating}
        reviewComment={reviewComment}
        setReviewComment={setReviewComment}
        handleReviewSubmit={handleReviewSubmit}
        loading={loading}
      />
    </section>
  );
};
