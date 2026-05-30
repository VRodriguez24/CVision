import { X } from 'lucide-react';
import { Button } from './Button.jsx';
import { cn } from '../../utils/cn.js';

export function Modal({ open, title, description, children, onClose, footer, className }) {
  if (!open) {
    return null;
  }
  const hasBodyContent = children !== undefined && children !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/35 px-margin-mobile py-8">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
        className={cn(
          'w-full max-w-[560px] rounded bg-white shadow-modal ring-1 ring-card-border',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-6 border-b border-card-border p-6">
          <div className="space-y-2">
            {title ? (
              <h2 id="modal-title" className="font-heading text-headline-md text-on-surface">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p id="modal-description" className="text-body-sm text-on-surface-variant">
                {description}
              </p>
            ) : null}
          </div>
          {onClose ? (
            <Button variant="ghost" size="sm" aria-label="Cerrar modal" onClick={onClose} className="h-9 w-9 px-0">
              <X aria-hidden="true" size={18} />
            </Button>
          ) : null}
        </div>
        {hasBodyContent ? <div className="p-6">{children}</div> : null}
        {footer ? (
          <div className={cn('p-6', hasBodyContent ? 'border-t border-card-border' : null)}>
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
