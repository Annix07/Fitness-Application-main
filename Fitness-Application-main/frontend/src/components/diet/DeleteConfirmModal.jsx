import { IconTrash } from '../common/Icons';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, item }) {
  if (!isOpen || !item) return null;

  return (
    <div className="food-modal-backdrop" onClick={onClose}>
      <div
        className="food-modal-card"
        style={{ maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="food-modal-header" style={{ borderBottom: 'none', paddingBottom: '0' }}>
          <div className="food-modal-title">
            <IconTrash size={20} color="#dc2626" />
            <h3>Remove Food Entry</h3>
          </div>
          <button
            type="button"
            className="food-modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '16px 24px 24px', color: '#475569', fontSize: '0.92rem', lineHeight: '1.5' }}>
          Are you sure you want to remove <strong>{item.food?.name || 'this item'}</strong> ({item.quantity}{item.unit}) from your <strong>{item.mealType}</strong> log?
        </div>

        <div className="food-modal-footer">
          <button
            type="button"
            className="btn-modal-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            style={{
              padding: '9px 20px',
              borderRadius: 'var(--radius-md)',
              background: '#dc2626',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
              transition: 'all 0.15s ease',
            }}
            onClick={() => {
              onConfirm(item.id);
              onClose();
            }}
          >
            Remove Item
          </button>
        </div>
      </div>
    </div>
  );
}
