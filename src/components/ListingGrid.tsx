import React from 'react';
import type { Listing } from '../types';
import { ListingCard } from './ListingCard';
import BrowseMap from './BrowseMap';

interface ListingGridProps {
  listings: Listing[];
  savedListingIds: number[];
  toggleSaveListing: (id: number) => void;
  selectedListing: Listing | null;
  showMap: boolean;
  isMobileMapOpen: boolean;
  setIsMobileMapOpen: (open: boolean) => void;
  mapCenter: [number, number];
}

export const ListingGrid: React.FC<ListingGridProps> = ({
  listings,
  savedListingIds,
  toggleSaveListing,
  selectedListing,
  showMap,
  isMobileMapOpen,
  setIsMobileMapOpen,
  mapCenter,
}) => {
  return (
    <div>
      {!showMap ? (
        <div className="full-width-layout">
          {listings.length === 0 ? (
            <p style={{ textAlign: 'center', margin: '40px 0', color: '#666' }}>
              Оголошень не знайдено за вказаними фільтрами.
            </p>
          ) : (
            <section className="listings-grid full-grid">
              {listings.map(item => (
                <ListingCard 
                  key={item.id}
                  item={item}
                  savedListingIds={savedListingIds}
                  toggleSaveListing={toggleSaveListing}
                />
              ))}
            </section>
          )}
        </div>
      ) : (
        <div className="main-layout-container">
          <div className={`listings-side ${isMobileMapOpen ? 'inactive' : ''}`}>
            {listings.length === 0 ? (
              <p style={{ textAlign: 'center', margin: '40px 0', color: '#666' }}>
                Оголошень не знайдено за вказаними фільтрами.
              </p>
            ) : (
              <section className="listings-grid">
                {listings.map(item => (
                  <ListingCard 
                    key={item.id}
                    item={item}
                    savedListingIds={savedListingIds}
                    toggleSaveListing={toggleSaveListing}
                  />
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
      )}

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
              <line x1="3" y1="6" x2="3.01" y2="6" strokeLinecap="round" />
              <line x1="3" y1="12" x2="3.01" y2="12" strokeLinecap="round" />
              <line x1="3" y1="18" x2="3.01" y2="18" strokeLinecap="round" />
            </svg>
            Список
          </span>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="3 6 10 3 17 6 24 3 24 18 17 21 10 18 3 21" />
              <line x1="10" y1="3" x2="10" y2="18" />
              <line x1="17" y1="6" x2="17" y2="21" />
            </svg>
            Карта
          </span>
        )}
      </button>
    </div>
  );
};
