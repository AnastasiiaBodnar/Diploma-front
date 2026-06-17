import React from 'react';
import type { Listing } from '../types';
import { getGalleryPhotos } from '../utils/helpers';

interface LightboxProps {
  isLightboxOpen: boolean;
  setIsLightboxOpen: (open: boolean) => void;
  selectedListing: Listing | null;
  lightboxPhotoIndex: number;
  setLightboxPhotoIndex: (idx: number | ((prev: number) => number)) => void;
}

export const Lightbox: React.FC<LightboxProps> = ({
  isLightboxOpen,
  setIsLightboxOpen,
  selectedListing,
  lightboxPhotoIndex,
  setLightboxPhotoIndex,
}) => {
  if (!isLightboxOpen || !selectedListing) return null;

  const photos = getGalleryPhotos(selectedListing);

  return (
    <div className="lightbox-modal" onClick={() => setIsLightboxOpen(false)}>
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-close-btn" onClick={() => setIsLightboxOpen(false)}>×</button>
        <img 
          src={photos[lightboxPhotoIndex]} 
          alt={`${selectedListing.title} full view ${lightboxPhotoIndex}`} 
          className="lightbox-img"
        />
        {photos.length > 1 && (
          <>
            <button 
              className="lightbox-nav-btn prev" 
              onClick={() => setLightboxPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))}
            >
              ‹
            </button>
            <button 
              className="lightbox-nav-btn next" 
              onClick={() => setLightboxPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))}
            >
              ›
            </button>
          </>
        )}
      </div>
    </div>
  );
};
