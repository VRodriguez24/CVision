import {
  ArrowRight,
  CheckCircle2,
  Download,
  FolderOpen,
  Gauge,
  Languages,
  LayoutTemplate,
  Palette,
  PenLine,
  ShieldCheck,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Badge, Button, Card } from '../components/ui/index.js';
import cvLandingPageImage from '../assets/img/CV_LandingPage.png';

const trustSignals = [
  'Gratis para empezar',
  'Sin tarjeta de crédito',
  'Exporta tu PDF al instante',
];

const steps = [
  {
    title: 'Completa tu información',
    description:
      'Carga tu experiencia, educación, proyectos y habilidades en un editor con vista previa del PDF en tiempo real.',
    icon: PenLine,
  },
  {
    title: 'Mejora y analiza con IA',
    description:
      'Optimiza cada campo con un clic y revisa tu puntaje de compatibilidad ATS con sugerencias concretas por categoría.',
    icon: Wand2,
  },
  {
    title: 'Exporta y postula',
    description:
      'Descarga tu CV en PDF, con la plantilla y el idioma que prefieras, listo para postular.',
    icon: Download,
  },
];

const features = [
  {
    title: 'Editor en vivo',
    description:
      'Edita tu currículum con vista previa del PDF en tiempo real, directamente en tu navegador.',
    icon: PenLine,
  },
  {
    title: 'Mejorar con IA',
    description:
      'Reescribe cualquier campo con IA sin inventar datos: recibes una explicación de los cambios y notas de compatibilidad ATS.',
    icon: Wand2,
  },
  {
    title: 'Análisis ATS',
    description:
      'Obtén un puntaje de 0 a 100 y sugerencias por categoría: redacción, ATS, palabras clave, inconsistencias y campos faltantes.',
    icon: Gauge,
  },
  {
    title: 'Plantillas profesionales',
    description:
      'Elige entre plantillas como Classic, Mart, ModernCV y Engineering, optimizadas para legibilidad.',
    icon: LayoutTemplate,
  },
  {
    title: 'Personalización total',
    description:
      'Ajusta tipografías, colores, tamaños, interlineado y el espaciado de cada sección a tu gusto.',
    icon: Palette,
  },
  {
    title: 'Español o inglés',
    description:
      'Genera tu CV en el idioma que necesites para cada postulación, sin volver a escribirlo.',
    icon: Languages,
  },
  {
    title: 'Gestiona tus CVs',
    description:
      'Crea, guarda, renombra y versiona varios currículums desde tu panel personal.',
    icon: FolderOpen,
  },
  {
    title: 'Exporta en PDF gratis',
    description:
      'Descarga tu CV en PDF al instante, generado localmente y sin marcas de agua.',
    icon: Download,
  },
];

const atsBullets = [
  'Optimización de palabras clave según el rol objetivo.',
  'Formato estándar y legible para lectores automáticos.',
  'Puntaje de compatibilidad con sugerencias accionables.',
];

const atsCategories = [
  { label: 'Redacción', count: 3 },
  { label: 'Palabras clave', count: 5 },
  { label: 'Campos faltantes', count: 2 },
  { label: 'Inconsistencias', count: 1 },
];

const templates = [
  { name: 'Classic', tone: 'Sobrio y versátil', accent: 'bg-secondary' },
  { name: 'Mart', tone: 'Compacto y elegante', accent: 'bg-primary-container' },
  { name: 'ModernCV', tone: 'Clásico académico', accent: 'bg-on-secondary-container' },
  { name: 'Engineering Classic', tone: 'Técnico y directo', accent: 'bg-secondary' },
  { name: 'Engineering Resumes', tone: 'Optimizado para tech', accent: 'bg-primary-container' },
];

function ResumeMockup() {
  return (
    <Card className="relative overflow-hidden rounded-xl p-6">
      <div className="absolute right-8 top-8 z-10 w-[220px] rounded border border-card-border border-t-4 border-t-ai-accent bg-white p-4 shadow-modal">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles aria-hidden="true" size={15} className="text-secondary" />
          <span className="font-heading text-label-sm text-primary">Sugerencia IA</span>
        </div>
        <p className="text-[11px] leading-snug text-on-surface-variant">
          Reemplaza habilidades genéricas por logros medibles para aumentar el match.
        </p>
      </div>

      <div className="rounded-lg bg-surface-container-low p-3 md:p-4">
        <img
          src={cvLandingPageImage}
          alt="Mockup de currículum profesional CVision sobre escritorio con taza de café y lápiz."
          className="aspect-[4/3] w-full rounded object-cover object-center shadow-card"
        />
      </div>
    </Card>
  );
}

function AtsPanel() {
  return (
    <Card className="rounded-xl border-white/10 bg-white/5 p-6 shadow-none">
      <div className="mb-6 flex items-center justify-between">
        <span className="font-heading text-label-md text-on-primary">Compatibilidad ATS</span>
        <span className="rounded-sm bg-white/10 px-2 py-1 font-heading text-[10px] uppercase tracking-[0.18em] text-white/60">
          Ejemplo
        </span>
      </div>
      <div className="mb-2 flex items-end gap-2">
        <span className="font-heading text-[40px] font-semibold leading-none text-secondary-fixed">82</span>
        <span className="mb-1 font-heading text-label-md text-white/50">/ 100</span>
      </div>
      <div className="mb-8 h-2 rounded-full bg-white/10">
        <div className="h-full w-[82%] rounded-full bg-secondary-fixed" />
      </div>
      <p className="mb-3 font-heading text-[10px] uppercase tracking-[0.18em] text-white/50">
        Sugerencias por categoría
      </p>
      <div className="space-y-2">
        {atsCategories.map((category) => (
          <div
            key={category.label}
            className="flex items-center justify-between rounded border border-white/5 bg-white/5 px-3 py-2"
          >
            <span className="font-heading text-label-md text-on-primary">{category.label}</span>
            <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-white/10 px-2 font-heading text-label-sm text-secondary-fixed">
              {category.count}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function TemplatePreview({ template }) {
  return (
    <Card className="group w-full rounded-xl p-4 transition-transform duration-200 hover:-translate-y-1">
      <div className="rounded bg-surface-container-low p-4">
        <div className="mx-auto min-h-[240px] max-w-[200px] rounded-sm border border-outline-variant bg-white p-5 shadow-card">
          <div className={`mb-5 h-8 rounded-sm ${template.accent}`} />
          <div className="mb-5 space-y-2">
            <div className="h-3 w-28 rounded-sm bg-primary" />
            <div className="h-2 w-36 rounded-sm bg-secondary-fixed" />
          </div>
          <div className="space-y-2">
            <div className="h-2 rounded-sm bg-surface-container-highest" />
            <div className="h-2 rounded-sm bg-surface-container-highest" />
            <div className="h-2 w-10/12 rounded-sm bg-surface-container-highest" />
          </div>
          <div className="my-5 h-px bg-outline-variant" />
          <div className="space-y-2">
            <div className="h-2 w-24 rounded-sm bg-primary-container" />
            <div className="h-2 rounded-sm bg-surface-container-highest" />
            <div className="h-2 w-11/12 rounded-sm bg-surface-container-highest" />
            <div className="h-2 w-8/12 rounded-sm bg-surface-container-highest" />
          </div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="font-heading text-label-md text-primary">{template.name}</p>
        <p className="mt-1 text-body-sm text-on-surface-variant">{template.tone}</p>
      </div>
    </Card>
  );
}

export function LandingPage() {
  return (
    <>
      <section className="mx-auto max-w-container px-margin-mobile py-20 md:px-gutter md:py-24 lg:px-margin-desktop">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-8">
            <Badge variant="secondary" className="h-7 rounded-full px-3">
              <Sparkles aria-hidden="true" size={14} />
              Potenciado por IA de última generación
            </Badge>
            <div className="space-y-5">
              <h1 className="max-w-[640px] font-heading text-[44px] font-semibold leading-[1.08] tracking-[-0.02em] text-on-background md:text-display">
                Crea un CV <span className="text-secondary">optimizado por IA</span> y listo para los filtros ATS
              </h1>
              <p className="max-w-[560px] text-body-lg text-on-surface-variant">
                Edita tu currículum con vista previa en tiempo real, mejora cada sección con inteligencia artificial y obtén un puntaje de compatibilidad ATS pensado para el mercado laboral chileno.
              </p>
            </div>
            <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
              <Button as={NavLink} to="/auth" className="btn-hero-arrow h-14 rounded px-8">
                Crear mi CV gratis
                <ArrowRight aria-hidden="true" size={18} />
              </Button>
              <Button as="a" href="#como-funciona" variant="secondary" className="h-14 rounded px-8">
                Cómo funciona
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {trustSignals.map((signal) => (
                <span
                  key={signal}
                  className="flex items-center gap-2 font-heading text-label-sm text-on-surface-variant"
                >
                  <CheckCircle2 aria-hidden="true" size={16} className="text-secondary" />
                  {signal}
                </span>
              ))}
            </div>
          </div>
          <ResumeMockup />
        </div>
      </section>

      <section id="como-funciona" className="bg-surface-container-low py-24">
        <div className="mx-auto max-w-container px-margin-mobile md:px-gutter lg:px-margin-desktop">
          <div className="mb-16 text-center">
            <h2 className="font-heading text-headline-lg text-primary">Tu CV en tres pasos</h2>
            <p className="mt-4 text-body-md text-on-surface-variant">
              De una página en blanco a un currículum listo para postular.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={step.title} className="rounded-xl p-8">
                  <div className="mb-6 flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded bg-secondary-container/40 text-secondary">
                      <Icon aria-hidden="true" size={22} />
                    </span>
                    <span className="font-heading text-headline-md text-outline">0{index + 1}</span>
                  </div>
                  <h3 className="font-heading text-headline-md text-primary">{step.title}</h3>
                  <p className="mt-3 text-body-sm text-on-surface-variant">{step.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="funciones" className="py-24">
        <div className="mx-auto max-w-container px-margin-mobile md:px-gutter lg:px-margin-desktop">
          <div className="mb-16 text-center">
            <h2 className="font-heading text-headline-lg text-primary">Todo lo que necesitas para un CV competitivo</h2>
            <p className="mt-4 text-body-md text-on-surface-variant">
              Funciones reales, disponibles hoy en CVision.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="group rounded-xl p-6 transition-colors hover:border-secondary"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded bg-secondary-container/40 text-secondary transition-transform group-hover:scale-105">
                    <Icon aria-hidden="true" size={22} />
                  </div>
                  <h3 className="font-heading text-headline-md text-primary">{feature.title}</h3>
                  <p className="mt-3 text-body-sm text-on-surface-variant">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="ats" className="mx-auto max-w-container px-margin-mobile py-24 md:px-gutter lg:px-margin-desktop">
        <div className="grid gap-12 rounded-xl border border-primary bg-primary-container p-8 md:p-12 lg:grid-cols-[1.1fr_0.9fr] lg:p-16">
          <div>
            <h2 className="font-heading text-headline-lg text-on-primary">¿Qué es el ATS y por qué importa?</h2>
            <p className="mt-6 max-w-[640px] text-body-lg text-primary-fixed-dim">
              Muchos procesos de selección usan un Applicant Tracking System (ATS) que filtra los CVs antes de que un reclutador los lea. CVision formatea y analiza tu información para que estos sistemas la interpreten correctamente y mejoren tus opciones.
            </p>
            <ul className="mt-8 space-y-4">
              {atsBullets.map((bullet) => (
                <li key={bullet} className="flex items-center gap-3 font-heading text-label-md text-on-primary">
                  <CheckCircle2 aria-hidden="true" size={18} className="text-secondary-fixed" />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
          <AtsPanel />
        </div>
      </section>

      <section id="plantillas" className="bg-surface py-24">
        <div className="mx-auto max-w-container px-margin-mobile text-center md:px-gutter lg:px-margin-desktop">
          <h2 className="mb-4 font-heading text-headline-lg text-primary">Plantillas que abren puertas</h2>
          <p className="mx-auto mb-16 max-w-[560px] text-body-md text-on-surface-variant">
            Elige el diseño que mejor se ajuste a tu perfil y personalízalo a tu gusto.
          </p>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {templates.map((template) => (
              <TemplatePreview key={template.name} template={template} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-container-lowest py-24 text-center">
        <div className="mx-auto flex max-w-container flex-col items-center gap-8 px-margin-mobile md:px-gutter lg:px-margin-desktop">
          <ShieldCheck aria-hidden="true" size={36} className="text-secondary" />
          <h2 className="max-w-[720px] font-heading text-[40px] font-semibold leading-[1.12] tracking-[-0.02em] text-primary md:text-display">
            ¿Listo para dar el siguiente paso en tu carrera?
          </h2>
          <Button as={NavLink} to="/auth" className="btn-cta-sheen h-14 rounded px-12">
            Crear mi CV ahora
          </Button>
          <p className="text-body-sm text-on-surface-variant">
            Es gratis comenzar. No requiere tarjeta de crédito.
          </p>
        </div>
      </section>
    </>
  );
}

export function LandingFooterLogos() {
  return (
    <>
      <div className="flex h-8 w-24 items-center justify-center rounded bg-on-surface-variant/10 font-heading text-[10px] font-semibold text-on-surface-variant">
        BNE CHILE
      </div>
      <div className="flex h-8 w-24 items-center justify-center rounded bg-on-surface-variant/10 font-heading text-[10px] font-semibold text-on-surface-variant">
        SENCE
      </div>
    </>
  );
}
