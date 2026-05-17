import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { InstitutionalFooter, Sidebar, Topbar } from '../components/navigation/index.js';
import { useAuth } from '../context/index.js';
import { cn } from '../utils/cn.js';

const defaultCreateCta = {
  label: 'Create New CV',
  shortLabel: 'New CV',
  to: '/dashboard/cvs/new',
};

function getInitials(name = 'CVision') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function getRoleLabel(role) {
  if (role === 'ADMIN') return 'Administrador institucional';
  if (role === 'MODERATOR') return 'Moderador institucional';
  return 'Perfil profesional';
}

export function DashboardLayout({
  title,
  user,
  actions,
  navigationItems,
  secondaryNavigationItems,
  createCta = defaultCreateCta,
  footerProps,
  children,
}) {
  const { user: authUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/dashboard/admin');
  const resolvedTitle = title ?? (isAdmin ? 'Admin Overview' : 'Dashboard');
  const resolvedUser = user ?? {
    name: authUser?.name ?? 'Usuario CVision',
    role: getRoleLabel(authUser?.role),
    initials: getInitials(authUser?.name),
    image: authUser?.profile?.avatarUrl,
  };
  const canAccessAdmin = ['ADMIN', 'MODERATOR'].includes(authUser?.role);
  const resolvedFooterProps = {
    ...(isAdmin
      ? {
          brand: 'CVision Admin',
        }
      : {}),
    ...footerProps,
  };

  return (
    <div className="min-h-screen bg-surface-container-low text-on-surface">
      <Sidebar
        items={navigationItems}
        secondaryItems={secondaryNavigationItems}
        cta={createCta}
        showAdmin={canAccessAdmin}
        isDesktopVisible={isSidebarVisible}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className={cn('flex min-h-screen min-w-0 flex-col', isSidebarVisible ? 'lg:pl-[160px]' : 'lg:pl-0')}>
        <Topbar
          title={resolvedTitle}
          actions={actions}
          user={resolvedUser}
          isSidebarVisible={isSidebarVisible}
          onSidebarToggle={() => setIsSidebarVisible((currentValue) => !currentValue)}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <main className="w-full flex-1 bg-background px-margin-mobile py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] md:px-gutter lg:px-8">
          {children || <Outlet />}
        </main>
        <InstitutionalFooter {...resolvedFooterProps} />
      </div>
    </div>
  );
}
