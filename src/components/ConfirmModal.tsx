import React from 'react';

interface ConfirmModalProps {
  confirmAction: { message: string; onConfirm: () => void } | null;
  setConfirmAction: (action: { message: string; onConfirm: () => void } | null) => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  confirmAction,
  setConfirmAction,
}) => {
  if (!confirmAction) return null;

  return (
    <div className="modal-overlay" onClick={() => setConfirmAction(null)}>
      <div className="modal-content" style={{ maxWidth: '440px', padding: '24px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={() => setConfirmAction(null)}>×</button>
        <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#222' }}>Підтвердження дії</h3>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>
          {confirmAction.message}
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => setConfirmAction(null)}
            style={{ 
              flex: 1, 
              padding: '12px', 
              borderRadius: '8px', 
              border: '1px solid #ccc', 
              background: '#fff', 
              color: '#222', 
              fontWeight: 600, 
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            Скасувати
          </button>
          <button 
            className="primary" 
            onClick={() => {
              confirmAction.onConfirm();
              setConfirmAction(null);
            }}
            style={{ 
              flex: 1, 
              padding: '12px', 
              borderRadius: '8px', 
              fontWeight: 600, 
              cursor: 'pointer' 
            }}
          >
            Підтвердити
          </button>
        </div>
      </div>
    </div>
  );
};
