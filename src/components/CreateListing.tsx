import React from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { Category } from '../types';
import MapSelector from './MapSelector';
import { CustomSelect } from './CustomSelect';

interface CreateListingProps {
  categories: Category[];
  newTitle: string;
  setNewTitle: (val: string) => void;
  newCategoryId: string;
  setNewCategoryId: (val: string) => void;
  newDescription: string;
  setNewDescription: (val: string) => void;
  newPrice: string;
  setNewPrice: (val: string) => void;
  newDeposit: string;
  setNewDeposit: (val: string) => void;
  newLocation: string;
  setNewLocation: (val: string) => void;
  newLatitude: number | null;
  setNewLatitude: (val: number | null) => void;
  newLongitude: number | null;
  setNewLongitude: (val: number | null) => void;
  imageFiles: File[];
  imagePreviews: string[];
  handleImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: (idx: number) => void;
  newCheckInTime: string;
  setNewCheckInTime: (val: string) => void;
  newCheckOutTime: string;
  setNewCheckOutTime: (val: string) => void;
  newInstantBooking: boolean;
  setNewInstantBooking: (val: boolean) => void;
  handleCreateListingSubmit: (e: FormEvent) => void;
  loading: boolean;
}

export const CreateListing: React.FC<CreateListingProps> = ({
  categories,
  newTitle,
  setNewTitle,
  newCategoryId,
  setNewCategoryId,
  newDescription,
  setNewDescription,
  newPrice,
  setNewPrice,
  newDeposit,
  setNewDeposit,
  newLocation,
  setNewLocation,
  newLatitude,
  setNewLatitude,
  newLongitude,
  setNewLongitude,
  imageFiles,
  imagePreviews,
  handleImageChange,
  handleRemoveImage,
  newCheckInTime,
  setNewCheckInTime,
  newCheckOutTime,
  setNewCheckOutTime,
  newInstantBooking,
  setNewInstantBooking,
  handleCreateListingSubmit,
  loading,
}) => {
  return (
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
          <CustomSelect
            id="categoryId"
            value={newCategoryId}
            onChange={setNewCategoryId}
            options={categories.map(c => ({ value: String(c.id), label: c.name }))}
            placeholder="Оберіть категорію"
          />
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
            <label htmlFor="price">Ціна за ніч (грн) *</label>
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
          <label htmlFor="image">Фотографії речі (завантажте від 2 до 3 обов'язкових фото) *</label>
          <input 
            type="file" 
            id="image"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            disabled={imageFiles.length >= 3}
          />
          {imagePreviews.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
              {imagePreviews.map((url, index) => (
                <div key={index} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ccc' }}>
                  <img src={url} alt={`Попередній перегляд ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      lineHeight: '1',
                      padding: 0
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          {imageFiles.length < 2 && (
            <span style={{ color: '#10b981', fontSize: '12px', marginTop: '5px', display: 'block' }}>
              Потрібно завантажити щонайменше 2 фотографії (вибрано: {imageFiles.length})
            </span>
          )}
          {imageFiles.length > 0 && (
            <span style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
              Вибрано {imageFiles.length} з 3 фотографій
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '15px', margin: '15px 0' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="newCheckInTime">Час отримання (Check-in)</label>
            <CustomSelect 
              id="newCheckInTime"
              value={newCheckInTime}
              onChange={setNewCheckInTime}
              options={Array.from({ length: 24 }).map((_, h) => {
                const time = `${String(h).padStart(2, '0')}:00`;
                return { value: time, label: time };
              })}
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="newCheckOutTime">Час повернення (Check-out)</label>
            <CustomSelect 
              id="newCheckOutTime"
              value={newCheckOutTime}
              onChange={setNewCheckOutTime}
              options={Array.from({ length: 24 }).map((_, h) => {
                const time = `${String(h).padStart(2, '0')}:00`;
                return { value: time, label: time };
              })}
            />
          </div>
        </div>

        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '15px 0' }}>
          <input 
            type="checkbox" 
            id="instantBooking" 
            checked={newInstantBooking}
            onChange={(e) => setNewInstantBooking(e.target.checked)}
            style={{ width: 'auto', margin: 0, cursor: 'pointer' }}
          />
          <label htmlFor="instantBooking" style={{ marginBottom: 0, fontWeight: 500, cursor: 'pointer' }}>
            Миттєве бронювання (схвалювати оренду автоматично, якщо дати вільні)
          </label>
        </div>

        <button type="submit" className="primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
          {loading ? 'Опублікування...' : 'Опублікувати оголошення'}
        </button>
      </form>
    </section>
  );
};
