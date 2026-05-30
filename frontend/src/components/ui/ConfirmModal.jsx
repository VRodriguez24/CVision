import { useEffect } from 'react';
import { Modal } from './Modal.jsx';

const confirmButtonByIntent = {
  default: 'rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-zinc-600',
  danger: 'rounded bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-zinc-600',
};

const cancelButtonClassName = 'rounded border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60';

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onClose,
  loading = false,
  intent = 'default',
}) {
  useEffect(() => {
    if (!open || !onClose || loading) return undefined;

    const handleEscape = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      onClose();
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose, loading]);

  const handleClose = () => {
    if (loading) return;
    onClose?.();
  };

  const handleConfirm = () => {
    if (loading) return;
    onConfirm?.();
  };

  return (
    <Modal
      open={open}
      title={title}
      description={description}
      onClose={loading ? undefined : handleClose}
      footer={(
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className={cancelButtonClassName}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={confirmButtonByIntent[intent] ?? confirmButtonByIntent.default}
          >
            {loading ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      )}
    />
  );
}
