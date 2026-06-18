import React from 'react';
import type { FormEvent } from 'react';
import type { Listing, User } from '../types';
import { Calendar } from './Calendar';

interface BookingBoxProps {
  selectedListing: Listing;
  currentUser: User | null;
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
}

export const BookingBox: React.FC<BookingBoxProps> = ({
  selectedListing,
  currentUser,
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
}) => {
  const calculateSelectedNights = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) return 0;
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatCalendarDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const calculateTotal = () => {
    if (!startDate || !endDate) return null;
    const days = calculateSelectedNights();
    if (days <= 0) return null;

    const rentalPrice = selectedListing.price * days;
    const deposit = selectedListing.deposit;
    const total = rentalPrice + deposit;

    return { days, rentalPrice, deposit, total };
  };

  const bookingDetails = calculateTotal();

  return (
    <div className="booking-box">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
        <div>
          <span style={{ fontSize: '22px', fontWeight: 800 }}>{selectedListing.price} грн</span>
          <span style={{ fontSize: '14px', color: '#717171' }}> / ніч</span>
        </div>
        <div style={{ fontSize: '14px', fontWeight: 600 }}>
          ★ {selectedListing.avgRating !== null && selectedListing.avgRating !== undefined ? (
            `${selectedListing.avgRating} (${selectedListing.reviewCount})`
          ) : (
            'Нове'
          )}
        </div>
      </div>

      <p className="text-muted" style={{ marginBottom: '15px' }}>
        Сума застави: <strong>{selectedListing.deposit} грн</strong> (повертається після завершення оренди)
      </p>

      {currentUser?.id === selectedListing.userId ? (
        <div className="alert alert-info" style={{ fontSize: '13px', margin: 0 }}>
          Це ваше оголошення. Вы не можете орендувати власну річ.
        </div>
      ) : (
        <form onSubmit={handleBookingSubmit}>
          <div className="date-picker-relative-container">
            <div className="airbnb-date-picker-trigger" onClick={() => setIsCalendarOpen(true)}>
              <div className="airbnb-date-seg">
                <span className="label">ДАТА ПОЧАТКУ</span>
                <span className="value">{startDate ? new Date(startDate).toLocaleDateString('uk-UA') : 'Оберіть дату'}</span>
              </div>
              <div className="airbnb-date-divider"></div>
              <div className="airbnb-date-seg">
                <span className="label">ДАТА ЗАВЕРШЕННЯ</span>
                <span className="value">{endDate ? new Date(endDate).toLocaleDateString('uk-UA') : 'Оберіть дату'}</span>
              </div>
            </div>

            {isCalendarOpen && (
              <>
                <div className="calendar-dropdown-overlay" onClick={() => setIsCalendarOpen(false)} />
                <div className="calendar-dropdown-content" onClick={(e) => e.stopPropagation()}>
                  <div className="calendar-modal-header" style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className="calendar-nights-info" style={{ textAlign: 'left' }}>
                      {calculateSelectedNights() > 0 ? (
                        <>
                          <h2 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: 700 }}>
                            {(() => {
                              const n = calculateSelectedNights();
                              if (n % 10 === 1 && n % 100 !== 11) return `${n} ніч`;
                              if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return `${n} ночі`;
                              return `${n} ночей`;
                            })()}
                          </h2>
                        </>
                      ) : (
                        <>
                          <h2 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: 700 }}>Оберіть дати</h2>
                          <p style={{ margin: 0, fontSize: '13px', color: '#717171' }}>Вкажіть період оренди</p>
                        </>
                      )}
                    </div>

                    <div style={{ width: '320px' }}>
                      <div className="calendar-inputs-double-box">
                        <div 
                          className={`calendar-input-segment ${(!startDate || (startDate && endDate)) ? 'active' : ''}`}
                          onClick={() => {
                            setStartDate('');
                            setEndDate('');
                          }}
                        >
                          <span className="label">ПОЧАТОК</span>
                          <div className="value-row">
                            <span className="value" style={{ color: startDate ? '#222' : '#717171' }}>
                              {startDate ? formatCalendarDate(startDate) : 'дд.мм.рррр'}
                            </span>
                            {startDate && (
                              <button 
                                type="button" 
                                className="clear-date-icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setStartDate('');
                                  setEndDate('');
                                  setHoverDate(null);
                                }}
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                        <div 
                          className={`calendar-input-segment ${(startDate && !endDate) ? 'active' : ''}`}
                          onClick={() => {
                            if (startDate) {
                              setEndDate('');
                            }
                          }}
                        >
                          <span className="label">КІНЕЦЬ</span>
                          <div className="value-row">
                            <span className="value" style={{ color: endDate ? '#222' : '#717171' }}>
                              {endDate ? formatCalendarDate(endDate) : 'дд.мм.рррр'}
                            </span>
                            {endDate && (
                              <button 
                                type="button" 
                                className="clear-date-icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEndDate('');
                                  setHoverDate(null);
                                }}
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
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
                    mode="popup"
                    isMobileView={isMobileView}
                  />

                  <div className="calendar-modal-footer" style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #ebebeb', paddingTop: '12px' }}>
                    <div>
                      {(startDate || endDate) && (
                        <button 
                          type="button" 
                          className="calendar-clear-btn"
                          onClick={() => {
                            setStartDate('');
                            setEndDate('');
                            setHoverDate(null);
                          }}
                          style={{ padding: 0 }}
                        >
                          Очистити дати
                        </button>
                      )}
                    </div>
                    <button 
                      type="button" 
                      className="calendar-close-btn"
                      onClick={() => setIsCalendarOpen(false)}
                      style={{ borderRadius: '24px', padding: '8px 16px', backgroundColor: '#222222', color: '#ffffff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Закрити
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {bookingDetails && (
            <div className="booking-calculation">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{selectedListing.price} грн x {bookingDetails.days} {(() => {
                  const n = bookingDetails.days;
                  if (n % 10 === 1 && n % 100 !== 11) return 'ніч';
                  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'ночі';
                  return 'ночей';
                })()}</span>
                <span>{bookingDetails.rentalPrice} грн</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Застава (завдаток)</span>
                <span>{bookingDetails.deposit} грн</span>
              </div>
              <div className="booking-total-row">
                <span>Разом</span>
                <span>{bookingDetails.total} грн</span>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="primary" 
            style={{ width: '100%', marginTop: '15px', padding: '14px', fontSize: '16px', fontWeight: 700 }}
            disabled={loading}
          >
            {loading ? 'Обробка...' : (selectedListing.instantBooking ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                Забронювати миттєво
              </span>
            ) : (
              'Надіслати запит на оренду'
            ))}
          </button>
        </form>
      )}
    </div>
  );
};
