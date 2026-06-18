import React from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { Listing, Category } from '../types';
import MapSelector from './MapSelector';

interface EditListingModalProps {
  isEditOpen: boolean;
  setIsEditOpen: (val: boolean) => void;
  editingListing: Listing | null;
  setEditingListing: (val: Listing | null) => void;
  categories: Category[];
  editTitle: string;
  setEditTitle: (val: string) => void;
  editCategoryId: string;
  setEditCategoryId: (val: string) => void;
  editDescription: string;
  setEditDescription: (val: string) => void;
  editPrice: string;
  setEditPrice: (val: string) => void;
  editDeposit: string;
  setEditDeposit: (val: string) => void;
  editLocation: string;
  setEditLocation: (val: string) => void;
  editLatitude: number | null;
  setEditLatitude: (val: number | null) => void;
  editLongitude: number | null;
  setEditLongitude: (val: number | null) => void;
  shouldReplaceImages: boolean;
  setShouldReplaceImages: (val: boolean) => void;
  editImageFiles: File[];
  setEditImageFiles: (files: File[]) => void;
  editImagePreviews: string[];
  setEditImagePreviews: (previews: string[]) => void;
  handleEditImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleRemoveEditImage: (idx: number) => void;
  editCheckInTime: string;
  setEditCheckInTime: (val: string) => void;
  editCheckOutTime: string;
  setEditCheckOutTime: (val: string) => void;
  editInstantBooking: boolean;
  setEditInstantBooking: (val: boolean) => void;
  handleEditListingSubmit: (e: FormEvent) => void;
  loading: boolean;
}

export const EditListingModal: React.FC<EditListingModalProps> = ({
  isEditOpen,
  setIsEditOpen,
  editingListing,
  setEditingListing,
  categories,
  editTitle,
  setEditTitle,
  editCategoryId,
  setEditCategoryId,
  editDescription,
  setEditDescription,
  editPrice,
  setEditPrice,
  editDeposit,
  setEditDeposit,
  editLocation,
  setEditLocation,
  editLatitude,
  setEditLatitude,
  editLongitude,
  setEditLongitude,
  shouldReplaceImages,
  setShouldReplaceImages,
  editImageFiles,
  setEditImageFiles,
  editImagePreviews,
  setEditImagePreviews,
  handleEditImageChange,
  handleRemoveEditImage,
  editCheckInTime,
  setEditCheckInTime,
  editCheckOutTime,
  setEditCheckOutTime,
  editInstantBooking,
  setEditInstantBooking,
  handleEditListingSubmit,
  loading,
}) => {
  if (!isEditOpen || !editingListing) return null;

  return (
    <div className="modal-overlay" onClick={() => { setIsEditOpen(false); setEditingListing(null); }}>
      <div className="modal-content" style={{ maxWidth: '600px', overflowY: 'auto', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={() => { setIsEditOpen(false); setEditingListing(null); }}>×</button>
        
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
              <label htmlFor="edit-price">Ціна за ніч (грн) *</label>
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
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Фотографії речі</label>
            
            {!shouldReplaceImages ? (
              <div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {editImagePreviews.map((url, index) => (
                    <div key={index} style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ccc' }}>
                      <img src={url} alt={`Поточне фото ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => {
                    setShouldReplaceImages(true);
                    setEditImageFiles([]);
                    setEditImagePreviews([]);
                  }}
                  style={{ fontSize: '13px', padding: '6px 12px', border: '1px solid #ccc', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}
                >
                  Замінити всі фотографії
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#666' }}>Завантажте від 2 до 3 нових обов'язкових фото:</span>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShouldReplaceImages(false);
                      setEditImageFiles([]);
                      setEditImagePreviews(editingListing?.imageUrls || []);
                    }}
                    style={{ fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0, color: '#666' }}
                  >
                    Скасувати заміну
                  </button>
                </div>
                <input 
                  type="file" 
                  id="edit-image"
                  accept="image/*"
                  multiple
                  onChange={handleEditImageChange}
                  disabled={editImageFiles.length >= 3}
                />
                {editImagePreviews.length > 0 && (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {editImagePreviews.map((url, index) => (
                      <div key={index} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ccc' }}>
                        <img src={url} alt={`Нове фото ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button 
                          type="button"
                          onClick={() => handleRemoveEditImage(index)}
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            padding: 0
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {editImageFiles.length < 2 && (
                  <span style={{ color: '#10b981', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                    Потрібно завантажити щонайменше 2 фотографії (зараз: {editImageFiles.length})
                  </span>
                )}
                {editImageFiles.length > 0 && (
                  <span style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                    Вибрано {editImageFiles.length} з 3 фотографій
                  </span>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '15px', margin: '15px 0' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="editCheckInTime">Час отримання (Check-in)</label>
              <select 
                id="editCheckInTime"
                value={editCheckInTime}
                onChange={(e) => setEditCheckInTime(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
              >
                {Array.from({ length: 24 }).map((_, h) => {
                  const time = `${String(h).padStart(2, '0')}:00`;
                  return <option key={time} value={time}>{time}</option>;
                })}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="editCheckOutTime">Час повернення (Check-out)</label>
              <select 
                id="editCheckOutTime"
                value={editCheckOutTime}
                onChange={(e) => setEditCheckOutTime(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
              >
                {Array.from({ length: 24 }).map((_, h) => {
                  const time = `${String(h).padStart(2, '0')}:00`;
                  return <option key={time} value={time}>{time}</option>;
                })}
              </select>
            </div>
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

          <button type="submit" className="primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Збереження...' : 'Зберегти зміни'}
          </button>
        </form>
      </div>
    </div>
  );
};
