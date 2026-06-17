import React from 'react';
import type { ChangeEvent, FormEvent } from 'react';

interface RepairModalProps {
  isRepairModalOpen: boolean;
  setIsRepairModalOpen: (open: boolean) => void;
  setRepairListingId: (id: number | null) => void;
  repairUntilDate: string;
  setRepairUntilDate: (val: string) => void;
  repairReason: string;
  setRepairReason: (val: string) => void;
  handleRepairSubmit: (e: FormEvent) => void;
  loading: boolean;
}

export const RepairModal: React.FC<RepairModalProps> = ({
  isRepairModalOpen,
  setIsRepairModalOpen,
  setRepairListingId,
  repairUntilDate,
  setRepairUntilDate,
  repairReason,
  setRepairReason,
  handleRepairSubmit,
  loading,
}) => {
  if (!isRepairModalOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => { setIsRepairModalOpen(false); setRepairListingId(null); }}>
      <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={() => { setIsRepairModalOpen(false); setRepairListingId(null); }}>×</button>
        <h2 style={{ marginBottom: '10px' }}>Повідомити про поломку</h2>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px', lineHeight: '1.4' }}>
          Вкажіть дату, до якої товар буде в ремонті. Всі бронювання, які перетинаються з цим періодом, будуть скасовані автоматично, а орендарі отримають сповіщення з вашим коментарем.
        </p>
        <form onSubmit={handleRepairSubmit}>
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label htmlFor="repair-until-date" style={{ fontWeight: 500, display: 'block', marginBottom: '6px' }}>Ремонт до (включно) *</label>
            <input 
              type="date" 
              id="repair-until-date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={repairUntilDate}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setRepairUntilDate(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label htmlFor="repair-reason" style={{ fontWeight: 500, display: 'block', marginBottom: '6px' }}>Причина скасування бронювань *</label>
            <textarea 
              id="repair-reason"
              required
              rows={4}
              value={repairReason}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setRepairReason(e.target.value)}
              placeholder="Опишіть причину поломки/ремонту, яка буде надіслана орендарям..."
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', resize: 'vertical', minHeight: '100px' }}
            />
          </div>

          <button type="submit" className="primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Надіслання...' : 'Підтвердити та скасувати бронювання'}
          </button>
        </form>
      </div>
    </div>
  );
};
