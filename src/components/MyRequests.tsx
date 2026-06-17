import React from 'react';
import type { Booking } from '../types';

interface MyRequestsProps {
  myRequests: Booking[];
  handleStatusUpdate: (id: number, status: 'CONFIRMED' | 'REJECTED' | 'COMPLETED') => void;
  handleOwnerCancelBooking: (id: number) => void;
}

export const MyRequests: React.FC<MyRequestsProps> = ({
  myRequests,
  handleStatusUpdate,
  handleOwnerCancelBooking,
}) => {
  return (
    <div>
      <h2>Запити на мої речі</h2>
      <p className="text-muted" style={{ marginBottom: '15px' }}>
        Тут відображаються запити від інших користувачів на оренду ваших речей.
      </p>

      {myRequests.length === 0 ? (
        <p style={{ margin: '30px 0', color: '#666' }}>На ваші речі ще не надходило запитів.</p>
      ) : (
        <div className="table-wrapper">
          <table className="simple-table">
            <thead>
              <tr>
                <th>Річ</th>
                <th>Орендар</th>
                <th>Період оренди</th>
                <th>Вартість</th>
                <th>Статус</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {myRequests.map(booking => {
                const startStr = new Date(booking.startDate).toLocaleDateString('uk-UA');
                const endStr = new Date(booking.endDate).toLocaleDateString('uk-UA');
                let statusClass = 'status-pending';
                let statusText = 'Очікує відповіді';

                if (booking.status === 'CONFIRMED') {
                  statusClass = 'status-confirmed';
                  statusText = 'Схвалено вами';
                } else if (booking.status === 'REJECTED') {
                  statusClass = 'status-rejected';
                  statusText = 'Відхилено вами';
                } else if (booking.status === 'CANCELLED') {
                  statusClass = 'status-cancelled';
                  statusText = 'Скасовано орендарем';
                } else if (booking.status === 'COMPLETED') {
                  statusClass = 'status-completed';
                  statusText = 'Завершено';
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
                    </td>
                    <td>
                      {booking.tenant ? `${booking.tenant.firstName || ''} ${booking.tenant.lastName || ''}`.trim() : 'Анонім'}<br />
                      <span className="text-muted">{booking.tenant?.email}</span>
                    </td>
                    <td>{startStr} — {endStr}</td>
                    <td>
                      <strong>{booking.totalPrice} грн</strong><br />
                      <span className="text-muted">Застава: {booking.listing?.deposit} грн</span>
                    </td>
                    <td>
                      <span className={`status-tag ${statusClass}`}>{statusText}</span>
                    </td>
                    <td>
                      {booking.status === 'PENDING' && (
                        <div className="action-buttons">
                          <button 
                            className="primary"
                            onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}
                          >
                            Підтвердити
                          </button>
                          <button 
                            className="danger"
                            onClick={() => handleStatusUpdate(booking.id, 'REJECTED')}
                          >
                            Відхилити
                          </button>
                        </div>
                      )}
                      {booking.status === 'CONFIRMED' && (
                        <div className="action-buttons">
                          <button 
                            className="primary"
                            onClick={() => handleStatusUpdate(booking.id, 'COMPLETED')}
                          >
                            Підтвердити повернення
                          </button>
                          <button 
                            className="danger"
                            onClick={() => handleOwnerCancelBooking(booking.id)}
                          >
                            Скасувати оренду (форс-мажор)
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
