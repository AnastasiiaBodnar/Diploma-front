import React from 'react';
import type { Listing } from '../types';

interface ListingCardProps {
  item: Listing;
  savedListingIds: number[];
  toggleSaveListing: (id: number) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  item,
  savedListingIds,
  toggleSaveListing,
}) => {
  const isSaved = savedListingIds.includes(item.id);

  return (
    <div 
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
          fill={isSaved ? '#10B981' : 'none'} 
          stroke={isSaved ? '#10B981' : '#222222'} 
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
  );
};
