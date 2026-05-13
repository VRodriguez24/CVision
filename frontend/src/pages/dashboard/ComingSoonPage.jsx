import { Construction, ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Card, Button } from '../../components/ui/index.js';

const pageCopy = {
  cvs: {
    title: 'CVs',
    description: 'La biblioteca de currículums estará disponible pronto para crear, editar y comparar versiones.',
  },
  optimizer: {
    title: 'AI Optimizer',
    description: 'El panel de optimización IA se conectará a los prompts y sugerencias ATS en una próxima fase.',
  },
  jobs: {
    title: 'Job Matches',
    description: 'Las coincidencias laborales se integrarán con fuentes institucionales y criterios del perfil profesional.',
  },
  settings: {
    title: 'Settings',
    description: 'La configuración de cuenta, privacidad y preferencias estará disponible en una siguiente iteración.',
  },
  help: {
    title: 'Help Support',
    description: 'El centro de ayuda reunirá soporte, preguntas frecuentes y canales institucionales.',
  },
};

function getPageKey(pathname) {
  if (pathname.includes('/cvs')) return 'cvs';
  if (pathname.includes('/optimizer')) return 'optimizer';
  if (pathname.includes('/jobs')) return 'jobs';
  if (pathname.includes('/settings')) return 'settings';
  if (pathname.includes('/help')) return 'help';
  return 'cvs';
}

export function ComingSoonPage() {
  const location = useLocation();
  const copy = pageCopy[getPageKey(location.pathname)];

  return (
    <div className="mx-auto flex min-h-[calc(100vh-220px)] max-w-[760px] items-center justify-center pl-0 pr-8">
      <Card className="dashboard-card-depth w-full rounded-lg p-8 text-center md:p-10">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded bg-secondary-container text-on-secondary-container">
          <Construction aria-hidden="true" size={28} />
        </div>
        <p className="mb-2 font-heading text-label-sm uppercase tracking-[0.16em] text-on-surface-variant">
          Página en construcción
        </p>
        <h2 className="font-heading text-headline-lg-mobile font-semibold text-primary md:text-[34px]">
          {copy.title}
        </h2>
        <p className="mx-auto mt-3 max-w-[540px] text-body-md text-on-surface-variant">{copy.description}</p>
        <Button as={Link} to="/dashboard" variant="secondary" className="mt-7 rounded">
          <ArrowLeft aria-hidden="true" size={16} />
          Volver al dashboard
        </Button>
      </Card>
    </div>
  );
}
