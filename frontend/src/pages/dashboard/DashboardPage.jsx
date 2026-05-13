import {
  BadgeCheck,
  Download,
  Eye,
  FileText,
  MoreVertical,
  Pencil,
  Plus,
  Share2,
  Sparkles,
  WandSparkles,
} from 'lucide-react';
import { Badge, Button, Card, ProgressBar } from '../../components/ui/index.js';
import { useAuth } from '../../context/index.js';

const cvActions = [
  { label: 'Editar', icon: Pencil },
  { label: 'Previsualizar', icon: Eye },
  { label: 'Descargar PDF', icon: Download },
];

const quickActions = [
  { label: 'Optimizar', icon: WandSparkles },
  { label: 'ATS Check', icon: BadgeCheck },
  { label: 'Plantillas', icon: FileText },
  { label: 'Compartir', icon: Share2 },
];

const versionHistory = [
  {
    name: 'CV_Backend_SENCE_V2.pdf',
    updatedAt: 'Modificado hace 2 días',
  },
  {
    name: 'CV_Tech_Lead_Chile.pdf',
    updatedAt: 'Modificado el 28 de Abril, 2024',
  },
];

function AtsScoreCard({ score = 85 }) {
  return (
    <div className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-4 text-center md:w-40">
      <div className="relative mx-auto mb-3 h-24 w-24">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128" aria-hidden="true">
          <circle
            className="text-outline-variant"
            cx="64"
            cy="64"
            r="58"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
          />
          <circle
            className="text-primary"
            cx="64"
            cy="64"
            r="58"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray="364.4"
            strokeDashoffset="54.66"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-[22px] font-semibold leading-none text-primary">{score}%</span>
          <span className="font-heading text-label-sm text-on-surface-variant">Fuerza</span>
        </div>
      </div>
      <ProgressBar value={score} className="mb-3" />
      <p className="font-heading text-label-sm text-on-surface-variant">¡Casi listo para ATS!</p>
    </div>
  );
}

function MainCvCard() {
  return (
    <Card className="dashboard-card-depth rounded-lg p-5 md:p-6">
      <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
        <div className="flex-1">
          <Badge variant="secondary" className="mb-4 rounded-full px-3 uppercase tracking-[0.12em]">
            CV Principal
          </Badge>
          <h3 className="font-heading text-[22px] font-medium leading-tight text-primary">Ingeniero de Software Senior</h3>
          <p className="mt-2 text-body-sm text-on-surface-variant">Última edición: 12 de Mayo, 2024</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {cvActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  type="button"
                  className="flex h-8 items-center gap-2 rounded bg-surface-container-high px-3 font-heading text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container-highest"
                >
                  <Icon aria-hidden="true" size={15} />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>

        <AtsScoreCard />
      </div>

      <div className="mt-6 flex items-start gap-3 rounded border border-secondary-container bg-secondary-container/30 p-3">
        <Sparkles aria-hidden="true" size={20} className="mt-1 shrink-0 text-on-secondary-container" />
        <div>
          <p className="font-heading text-label-md text-on-secondary-container">Sugerencia de IA</p>
          <p className="mt-1 text-body-sm text-on-secondary-container">
            Añade "Cloud Computing" a tu sección de habilidades para mejorar tu visibilidad en 3 nuevas ofertas de trabajo.
          </p>
        </div>
      </div>
    </Card>
  );
}

function VersionHistoryCard() {
  return (
    <Card className="dashboard-card-depth rounded-lg p-5 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="font-heading text-[22px] font-medium leading-tight text-primary">Historial de Versiones</h3>
        <button type="button" className="font-heading text-label-md text-primary hover:underline">
          Ver todo
        </button>
      </div>

      <div className="space-y-2">
        {versionHistory.map((version) => (
          <div
            key={version.name}
            className="flex items-center justify-between gap-4 rounded border border-transparent p-3 transition-colors hover:border-outline-variant hover:bg-surface-container-low"
          >
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-surface-container-high text-on-surface-variant">
                <FileText aria-hidden="true" size={19} />
              </div>
              <div className="min-w-0">
                <p className="truncate font-heading text-label-md text-primary">{version.name}</p>
                <p className="text-body-sm text-on-surface-variant">{version.updatedAt}</p>
              </div>
            </div>
            <button
              type="button"
              aria-label={`Más opciones para ${version.name}`}
              className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-highest"
            >
              <MoreVertical aria-hidden="true" size={20} />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function CreateCvCard() {
  return (
    <button
      type="button"
      className="group flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-lg bg-primary p-5 text-on-primary dashboard-card-depth transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:shadow-focus"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 transition-transform group-hover:scale-105">
        <Plus aria-hidden="true" size={28} />
      </span>
      <span className="font-heading text-[22px] font-medium">Crear nuevo CV</span>
    </button>
  );
}

function QuickActionsCard() {
  return (
    <Card className="dashboard-card-depth rounded-lg p-5">
      <h4 className="mb-4 font-heading text-label-md text-primary">Accesos Rápidos</h4>
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <a
              key={action.label}
              href="#"
              className="flex min-h-20 flex-col items-center justify-center rounded border border-outline-variant bg-surface-container-low p-3 text-center transition-colors hover:bg-secondary-container/20"
            >
              <Icon aria-hidden="true" size={20} className="mb-2 text-secondary" />
              <span className="font-heading text-label-sm text-primary">{action.label}</span>
            </a>
          );
        })}
      </div>
    </Card>
  );
}

function ProUpgradeCard() {
  return (
    <div className="dashboard-card-depth relative overflow-hidden rounded-lg bg-primary-container p-5 text-on-primary-container">
      <div className="relative z-10">
        <h4 className="font-heading text-[22px] font-medium text-white">CVision Pro</h4>
        <p className="mt-3 text-body-sm text-primary-fixed-dim">
          Desbloquea plantillas premium y optimización ilimitada con IA.
        </p>
        <Button variant="secondary" className="mt-5 h-9 rounded border-white bg-white px-4 text-primary hover:bg-primary-fixed">
          Actualizar plan
        </Button>
      </div>
      <BadgeCheck
        aria-hidden="true"
        size={108}
        className="absolute -bottom-8 -right-6 text-white opacity-20"
        strokeWidth={1.4}
      />
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')?.[0] ?? 'Usuario';
  const targetRole = user?.profile?.targetRole || 'Ingeniero de Software Senior';

  return (
    <div className="mx-auto max-w-[1180px] pl-0 pr-8">
      <section className="mb-7">
        <h2 className="font-heading text-headline-lg-mobile font-semibold text-primary md:text-[34px] md:leading-tight">
          Hola, {firstName}
        </h2>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Tu perfil {targetRole ? `para ${targetRole}` : 'profesional'} está ganando impulso. Revisa tus últimas actualizaciones.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-8">
          <MainCvCard />
          <VersionHistoryCard />
        </div>

        <aside className="space-y-5 xl:col-span-4">
          <CreateCvCard />
          <QuickActionsCard />
          <ProUpgradeCard />
        </aside>
      </div>
    </div>
  );
}
