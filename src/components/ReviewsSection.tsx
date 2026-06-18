import React from 'react';
import type { FormEvent } from 'react';
import type { Listing, User } from '../types';

interface ReviewsSectionProps {
  selectedListing: Listing;
  currentUser: User | null;
  reviewRating: number;
  setReviewRating: (val: number) => void;
  reviewHoverRating: number;
  setReviewHoverRating: (val: number) => void;
  reviewComment: string;
  setReviewComment: (val: string) => void;
  handleReviewSubmit: (e: FormEvent) => void;
  loading: boolean;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  selectedListing,
  currentUser,
  reviewRating,
  setReviewRating,
  reviewHoverRating,
  setReviewHoverRating,
  reviewComment,
  setReviewComment,
  handleReviewSubmit,
  loading,
}) => {
  return (
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
  );
};
