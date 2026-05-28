import { cn } from '../../utils/cn.js';

const defaultLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Institutional Portal', href: '/institutional' },
  { label: 'Contact Support', href: '/support' },
];

export function InstitutionalFooter({
  brand = 'CVision',
  text = '© 2026 CVision - BNE & SENCE Chile. Todos los derechos reservados.',
  links = defaultLinks,
  logos,
  className,
}) {
  return (
    <footer className={cn('border-t border-outline-variant bg-surface-container px-margin-mobile py-10 md:px-gutter lg:px-10', className)}>
      <div className="mx-auto flex max-w-container flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-heading text-label-md text-on-surface">{brand}</p>
          <p className="mt-3 text-body-sm text-on-surface-variant">{text}</p>
        </div>
        {/* <nav aria-label="Enlaces institucionales" className="flex flex-wrap gap-x-8 gap-y-3">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="font-heading text-label-sm text-on-surface hover:text-secondary">
              {link.label}
            </a>
          ))}
        </nav> */}
        {logos ? <div className="flex shrink-0 items-center gap-4">{logos}</div> : null}
      </div>
    </footer>
  );
}
