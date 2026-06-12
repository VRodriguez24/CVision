import { useEffect, useMemo, useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { InstitutionalFooter } from '../components/navigation/index.js';
import { Button } from '../components/ui/Button.jsx';
import { cn } from '../utils/cn.js';

const defaultPublicNav = [
  { label: 'Cómo funciona', href: '#como-funciona', active: true },
  { label: 'Funciones', href: '#funciones' },
  { label: 'Análisis ATS', href: '#ats' },
  { label: 'Plantillas', href: '#plantillas' },
];

export function PublicLayout({
  brand = 'CVision',
  navItems = defaultPublicNav,
  actions,
  footerProps,
  children,
}) {
  const sectionIds = useMemo(
    () =>
      navItems
        .map((item) => item.href)
        .filter((href) => href?.startsWith('#'))
        .map((href) => href.slice(1)),
    [navItems],
  );
  const [activeSection, setActiveSection] = useState(
    navItems.find((item) => item.active)?.href?.slice(1) || sectionIds[0],
  );

  useEffect(() => {
    if (sectionIds.length === 0) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      {
        rootMargin: '-30% 0px -55% 0px',
        threshold: [0.1, 0.25, 0.5],
      },
    );

    sectionIds.forEach((id) => {
      const section = document.getElementById(id);
      if (section) {
        observer.observe(section);
      }
    });

    return () => observer.disconnect();
  }, [sectionIds]);

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <header className="sticky top-0 z-30 border-b border-outline-variant bg-surface/95 px-margin-mobile backdrop-blur md:px-gutter lg:px-margin-desktop">
        <div className="relative mx-auto grid h-[72px] max-w-container grid-cols-[1fr_auto] items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
          <NavLink to="/" className="z-10 flex shrink-0 items-center gap-3 justify-self-start">
            <span className="flex h-9 w-9 items-center justify-center rounded bg-primary text-on-primary md:hidden">
              <Sparkles aria-hidden="true" size={20} />
            </span>
            <span className="font-heading text-[26px] font-semibold leading-none tracking-[-0.01em] text-primary md:text-[28px]">
              {brand}
            </span>
          </NavLink>

          <nav
            aria-label="Navegación pública"
            className="hidden items-center justify-center gap-7 md:flex"
          >
            {navItems.map((item) => (
              item.href ? (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setActiveSection(item.href.slice(1))}
                  className={cn(
                    'group relative py-2 font-heading text-label-md text-on-surface-variant transition-colors after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-full after:origin-center after:-translate-x-1/2 after:rounded-full after:bg-primary after:transition-transform after:duration-300 after:ease-out',
                    activeSection === item.href.slice(1)
                      ? 'text-primary after:scale-x-100'
                      : 'after:scale-x-0 hover:text-primary hover:after:scale-x-100',
                  )}
                >
                  {item.label}
                </a>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'relative py-2 font-heading text-label-sm text-on-surface-variant transition-colors after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-full after:origin-center after:-translate-x-1/2 after:rounded-full after:bg-primary after:transition-transform after:duration-300 after:ease-out',
                      (isActive || item.active) && 'text-primary after:scale-x-100',
                      !isActive && !item.active && 'after:scale-x-0 hover:text-primary hover:after:scale-x-100',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              )
            ))}
          </nav>

          <div className="z-10 flex shrink-0 items-center justify-end gap-3 justify-self-end">
            {actions || (
              <>
                <Button as={NavLink} to="/auth" variant="ghost" className="hidden bg-transparent px-4 text-on-surface-variant hover:bg-transparent hover:text-primary sm:inline-flex">
                  Iniciar sesión
                </Button>
                <Button as={NavLink} to="/auth" className="btn-cta-sheen h-10 rounded px-5">
                  Crear mi CV
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>{children || <Outlet />}</main>
      <InstitutionalFooter {...footerProps} />
    </div>
  );
}
