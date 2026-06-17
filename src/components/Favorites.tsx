import React from 'react';
import type { Listing, ViewType } from '../types';
import { ListingCard } from './ListingCard';

interface FavoritesProps {
  favoriteListings: Listing[];
  savedListingIds: number[];
  toggleSaveListing: (id: number) => void;
  setActiveView: (view: ViewType) => void;
}

export const Favorites: React.FC<FavoritesProps> = ({
  favoriteListings,
  savedListingIds,
  toggleSaveListing,
  setActiveView,
}) => {
  return (
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
  );
};
