import {
  BriefcaseBusiness,
  CircleHelp,
  FileText,
  LayoutDashboard,
  Plus,
  Settings,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn.js';
import { Button } from '../ui/Button.jsx';

const iconMap = {
  dashboard: LayoutDashboard,
  cvs: FileText,
  optimizer: Sparkles,
  jobs: BriefcaseBusiness,
  settings: Settings,
  admin: ShieldCheck,
  help: CircleHelp,
};

export const defaultSidebarItems = [
  { label: 'Dashboard', to: '/dashboard', icon: 'dashboard', end: true },
  { label: 'My CVs', to: '/dashboard/cvs', icon: 'cvs' },
  // { label: 'AI Optimizer', to: '/dashboard/optimizer', icon: 'optimizer' },
  // { label: 'Job Matches', to: '/dashboard/jobs', icon: 'jobs' },
  { label: 'Settings', to: '/dashboard/settings', icon: 'settings' },
];

const shortLabels = {
  Dashboard: 'Editor',
  'My CVs': 'CVs',
  'AI Optimizer': 'AI',
  'Job Matches': 'Jobs',
  Settings: 'Opciones',
  'Admin Panel': 'Admin',
  'Help Support': 'Ayuda',
};

export const defaultSidebarSecondaryItems = [
  { label: 'Admin Panel', to: '/dashboard/admin', icon: 'admin' },
  { label: 'Help Support', to: '/dashboard/help', icon: 'help' },
];

function BrandMark({ compact = false }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-primary-container text-on-primary shadow-card">
        <Sparkles aria-hidden="true" size={22} />
      </div>
      {!compact ? (
        <div className="min-w-0">
          <p className="font-heading text-label-md font-semibold leading-none text-on-surface">CVision</p>
          <p className="mt-1 text-[11px] leading-tight text-on-surface-variant">BNE · SENCE</p>
        </div>
      ) : null}
    </div>
  );
}

function SidebarLink({ item, onNavigate }) {
  const Icon = typeof item.icon === 'string' ? iconMap[item.icon] : item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex h-10 items-center gap-2 rounded px-3 font-heading text-label-sm tracking-[0.02em] transition-colors',
          isActive
            ? 'bg-secondary-container text-on-secondary-container'
            : 'text-on-surface hover:bg-surface-container',
        )
      }
    >
      {Icon ? <Icon aria-hidden="true" size={20} strokeWidth={1.9} /> : null}
      <span className="truncate">{shortLabels[item.label] || item.label}</span>
    </NavLink>
  );
}

export function Sidebar({
  items = defaultSidebarItems,
  secondaryItems = defaultSidebarSecondaryItems,
  cta,
  showAdmin = false,
  isDesktopVisible = true,
  isOpen = false,
  onClose,
  className,
}) {
  const visibleSecondaryItems = secondaryItems.filter((item) => item.icon !== 'admin' || showAdmin);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="mb-8 flex items-start justify-center gap-4 px-3 pt-7">
        <BrandMark />
        {onClose ? (
          <Button variant="ghost" size="sm" aria-label="Cerrar navegación" onClick={onClose} className="h-9 w-9 px-0 lg:hidden">
            <X aria-hidden="true" size={18} />
          </Button>
        ) : null}
      </div>

      <nav aria-label="Navegación principal" className="space-y-2 px-3">
        {items.map((item) => (
          <SidebarLink key={item.to} item={item} onNavigate={onClose} />
        ))}
      </nav>

      <div className="mt-auto px-3 pb-6">
        <div className="mb-5 border-t border-outline-variant" />
        {/* {cta ? (
          <div className="mb-5">
            <Button
              as={cta.to ? NavLink : 'button'}
              to={cta.to}
              onClick={cta.onClick}
              className="h-10 w-full justify-center gap-2 rounded bg-primary px-2 text-label-sm text-on-primary"
            >
              <Plus aria-hidden="true" size={16} />
              {cta.shortLabel || cta.label}
            </Button>
          </div>
        ) : null} */}
        <nav aria-label="Navegación secundaria" className="space-y-2">
          {visibleSecondaryItems.map((item) => (
            <SidebarLink key={item.to} item={item} onNavigate={onClose} />
          ))}
        </nav>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden w-[160px] border-r border-outline-variant bg-surface-container-low text-on-surface',
          isDesktopVisible ? 'lg:block' : 'lg:hidden',
          className,
        )}
      >
        {sidebarContent}
      </aside>

      <div
        className={cn(
          'fixed inset-0 z-50 bg-primary/35 transition-opacity lg:hidden',
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[min(320px,86vw)] border-r border-outline-variant bg-surface-container-low text-on-surface transition-transform duration-200 lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
