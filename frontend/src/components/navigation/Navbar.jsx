import { Bell, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { cn } from '../../utils/cn.js';

function UserAvatar({ user }) {
  if (!user) {
    return null;
  }

  const initials = user.initials || user.name?.slice(0, 2).toUpperCase() || 'CV';

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right leading-tight sm:block">
        <p className="font-heading text-label-md text-on-surface">{user.name}</p>
        {user.role ? <p className="text-[12px] leading-tight text-on-surface-variant">{user.role}</p> : null}
      </div>
      {user.image ? (
        <img
          src={user.image}
          alt={user.name ? `Avatar de ${user.name}` : 'Avatar de usuario'}
          className="h-9 w-9 rounded-full border border-outline-variant object-cover"
        />
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant bg-primary-container font-heading text-label-sm text-on-primary">
          {initials}
        </div>
      )}
    </div>
  );
}

export function Navbar({
  title = 'Dashboard',
  actions,
  user,
  showNotifications = true,
  isSidebarVisible = true,
  onSidebarToggle,
  onMenuClick,
  className,
}) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 min-h-16 border-b border-outline-variant bg-surface/95 px-margin-mobile backdrop-blur md:px-gutter lg:px-8',
        className,
      )}
    >
      <div className="flex min-h-16 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="sm" aria-label="Abrir navegación" onClick={onMenuClick} className="h-10 w-10 px-0 lg:hidden">
            <Menu aria-hidden="true" size={18} />
          </Button>
          {onSidebarToggle ? (
            <Button
              variant="ghost"
              size="m"
              aria-label={isSidebarVisible ? 'Ocultar navegación' : 'Mostrar navegación'}
              onClick={onSidebarToggle}
              className="hidden h-10 w-10 px-0 lg:inline-flex"
            >
              {isSidebarVisible ? <PanelLeftClose aria-hidden="true" size={18} /> : <PanelLeftOpen aria-hidden="true" size={18} />}
            </Button>
          ) : null}
          <div className="min-w-0">
            <h1 className="truncate font-heading text-headline-md font-semibold text-on-surface md:text-[26px] md:leading-tight">
              {title}
            </h1>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          {actions ? <div className="hidden items-center gap-3 md:flex">{actions}</div> : null}
          {showNotifications ? (
            <Button variant="ghost" size="m" aria-label="Notificaciones" className="h-10 w-10 px-0">
              <Bell aria-hidden="true" size={20} />
            </Button>
          ) : null}
          <UserAvatar user={user} />
        </div>
      </div>
    </header>
  );
}
