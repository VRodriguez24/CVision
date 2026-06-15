import { cn } from '../../utils/cn.js';

const placementClassNames = {
  top: 'bottom-full mb-2',
  bottom: 'top-full mt-2',
};

export function Tooltip({ content, children, className = '', placement = 'top' }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute left-1/2 z-40 w-max max-w-[240px] -translate-x-1/2 rounded border border-card-border border-t-ai-accent bg-white px-3 py-2 text-body-sm text-on-surface-variant opacity-0 shadow-modal transition-opacity group-hover:opacity-100 group-focus-within:opacity-100',
          placementClassNames[placement] ?? placementClassNames.top,
          className,
        )}
      >
        {content}
      </span>
    </span>
  );
}
