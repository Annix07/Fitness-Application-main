import { IconTrash, IconShield } from '../../../components/common/Icons';

export default function AdminConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Delete',
  confirmVariant = 'danger', // 'danger' | 'warning' | 'primary'
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={onCancel}>
      <div className="admin-modal-box confirm-box" onClick={(e) => e.stopPropagation()}>
        <div className={`confirm-icon-wrap ${confirmVariant}`}>
          {confirmVariant === 'danger' ? (
            <IconTrash size={24} color="#dc2626" />
          ) : (
            <IconShield size={24} color="#0284c7" />
          )}
        </div>

        <h3 className="confirm-modal-title">{title}</h3>
        <p className="confirm-modal-msg">{message}</p>

        <div className="admin-modal-actions">
          <button type="button" className="btn-admin-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn-admin-action ${confirmVariant}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
