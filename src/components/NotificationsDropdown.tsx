import React from 'react';
import type { Notification } from '../types';

interface NotificationsDropdownProps {
  notifications: Notification[];
  handleMarkAllAsRead: () => void;
  handleMarkAsRead: (id: number) => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  notifications,
  handleMarkAllAsRead,
  handleMarkAsRead,
}) => {
  return (
    <div 
      className="notifications-dropdown"
      style={{
        position: 'absolute',
        top: '45px',
        right: '0',
        backgroundColor: '#ffffff',
        border: 'none',
        borderRadius: '16px',
        width: '360px',
        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.15)',
        zIndex: 1010,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '400px',
        overflow: 'hidden'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <span style={{ fontSize: '16px', fontWeight: 700, color: '#222222' }}>Сповіщення</span>
        {notifications.filter(n => !n.isRead).length > 0 && (
          <button 
            onClick={handleMarkAllAsRead}
            style={{
              background: 'none',
              border: 'none',
              color: '#10B981',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '0'
            }}
          >
            Позначити всі як прочитані
          </button>
        )}
      </div>

      <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '24px 20px', textAlign: 'center', color: '#717171', fontSize: '14px' }}>
            Немає нових сповіщень
          </div>
        ) : (
          notifications.map((item) => (
            <div 
              key={item.id}
              onClick={() => {
                if (!item.isRead) handleMarkAsRead(item.id);
              }}
              style={{
                padding: '12px 20px',
                borderBottom: '1px solid #f7f7f7',
                backgroundColor: item.isRead ? '#ffffff' : '#fff5f6',
                cursor: item.isRead ? 'default' : 'pointer',
                transition: 'background-color 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                textAlign: 'left'
              }}
            >
              <div style={{ 
                fontSize: '13px', 
                color: '#222222', 
                fontWeight: item.isRead ? 400 : 600,
                lineHeight: '1.4'
              }}>
                {item.message}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: '#717171',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span>{new Date(item.createdAt).toLocaleDateString('uk-UA', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
                {!item.isRead && (
                  <span style={{
                    width: '6px',
                    height: '6px',
                    backgroundColor: '#10B981',
                    borderRadius: '50%',
                    display: 'inline-block'
                  }} />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
