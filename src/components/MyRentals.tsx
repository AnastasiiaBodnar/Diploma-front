import React from 'react';
import type { Booking } from '../types';

interface MyRentalsProps {
  myRentals: Booking[];
  rentalsSearchQuery: string;
  setRentalsSearchQuery: (val: string) => void;
}

export const MyRentals: React.FC<MyRentalsProps> = ({
  myRentals,
  rentalsSearchQuery,
  setRentalsSearchQuery,
}) => {
  const filtered = myRentals.filter(booking => {
    if (!rentalsSearchQuery.trim()) return true;
    const query = rentalsSearchQuery.toLowerCase();
    const titleMatch = booking.listing?.title?.toLowerCase().includes(query);
    const locationMatch = booking.listing?.location?.toLowerCase().includes(query);
    const ownerMatch = (booking.listing?.user ? `${booking.listing.user.firstName || ''} ${booking.listing.user.lastName || ''}` : '').toLowerCase().includes(query);
    return titleMatch || locationMatch || ownerMatch;
  });

  return (
    <div>
      <h2>Мої оренди</h2>

      {myRentals.length === 0 ? (
        <p style={{ margin: '30px 0', color: '#666' }}>Ви ще не орендували жодної речі.</p>
      ) : (
        <>
          <div style={{ marginBottom: '20px', maxWidth: '350px' }}>
            <input 
              type="text"
              placeholder="Пошук орендованих речей..."
              value={rentalsSearchQuery}
              onChange={(e) => setRentalsSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #dddddd',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {filtered.length === 0 ? (
            <p style={{ margin: '30px 0', color: '#666' }}>Нічого не знайдено за вашим запитом.</p>
          ) : (
            <div className="table-wrapper">
              <table className="simple-table">
                <thead>
                  <tr>
                    <th>Річ</th>
                    <th>Власник</th>
                    <th>Період оренди</th>
                    <th>Ціна</th>
                    <th>Статус</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Перегляд</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(booking => {
                    const startStr = new Date(booking.startDate).toLocaleDateString('uk-UA');
                    const endStr = new Date(booking.endDate).toLocaleDateString('uk-UA');
                    let statusClass = 'status-pending';
                    let statusText = 'Очікує підтвердження';

                    if (booking.status === 'CONFIRMED') {
                      statusClass = 'status-confirmed';
                      statusText = 'Підтверджено';
                    } else if (booking.status === 'REJECTED') {
                      statusClass = 'status-rejected';
                      statusText = 'Відхилено';
                    } else if (booking.status === 'CANCELLED') {
                      statusClass = 'status-cancelled';
                      statusText = 'Скасовано';
                    } else if (booking.status === 'COMPLETED') {
                      statusClass = 'status-completed';
                      statusText = 'Завершено (повернуто)';
                    }

                    return (
                      <tr key={booking.id}>
                        <td>
                          <a 
                            href={`/?listing=${booking.listingId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ 
                              fontWeight: 700, 
                              color: 'var(--primary-color)', 
                              textDecoration: 'none' 
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                          >
                            {booking.listing?.title}
                          </a>
                          <br />
                          <span className="text-muted">Локація: {booking.listing?.location}</span>
                        </td>
                        <td>
                          {booking.listing?.user ? (
                            <>
                              <strong>{`${booking.listing.user.firstName || ''} ${booking.listing.user.lastName || ''}`.trim()}</strong>
                              <br />
                              <span className="text-muted" style={{ fontSize: '12px' }}>
                                {booking.listing.user.email}
                              </span>
                            </>
                          ) : (
                            <span className="text-muted">Власник</span>
                          )}
                        </td>
                        <td>{startStr} — {endStr}</td>
                        <td>
                          <strong>{booking.totalPrice} грн</strong><br />
                          <span className="text-muted">Застава: {booking.listing?.deposit} грн</span>
                        </td>
                        <td>
                          <span className={`status-tag ${statusClass}`}>{statusText}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => {
                              window.open(`/?listing=${booking.listingId}`, '_blank');
                            }}
                            title="Переглянути оголошення"
                            className="rozetka-action-btn btn-view"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};
