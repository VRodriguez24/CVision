import { useCallback, useEffect, useMemo, useState } from 'react';
import { FileText, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../../components/ui/index.js';
import { listCvs } from '../../services/cvService.js';

function formatDate(value) {
  if (!value) return 'Sin fecha';
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Sin fecha';
  }

  return date.toLocaleString('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function statusLabel(status) {
  if (status === 'DRAFT') return 'Borrador';
  if (status === 'COMPLETED') return 'Completado';
  if (status === 'ARCHIVED') return 'Archivado';
  if (status === 'DELETED') return 'Eliminado';
  return status;
}

export function MyCvsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  const hasItems = useMemo(() => items.length > 0, [items]);

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);

    try {
      const cvs = await listCvs();
      setItems(cvs);
      setStatus('ready');
    } catch {
      setStatus('error');
      setError('No pudimos cargar tus CVs. Intenta nuevamente en unos minutos.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleOpenCv = (cv) => {
    const shouldReplace = window.confirm('Se cargará este CV en el editor principal y reemplazará la edición actual. ¿Deseas continuar?');

    if (!shouldReplace) {
      return;
    }

    navigate(`/dashboard?cvId=${cv.id}`);
  };

  return (
    <div className="mx-auto max-w-[980px] space-y-6 pl-0 pr-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-headline-lg text-primary">Mis CVs</h2>
          <p className="text-body-sm text-on-surface-variant">Selecciona un CV para cargarlo en el editor principal.</p>
        </div>
        <Button
          variant="secondary"
          onClick={load}
          className="rounded"
        >
          <RefreshCcw aria-hidden="true" size={16} />
          Actualizar
        </Button>
      </div>

      {status === 'loading' ? (
        <Card className="rounded-lg p-8 text-center text-on-surface-variant">Cargando CVs...</Card>
      ) : null}

      {status === 'error' ? (
        <Card className="rounded-lg border-error p-8 text-center text-error">{error}</Card>
      ) : null}

      {status === 'ready' && !hasItems ? (
        <Card className="rounded-lg p-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded bg-surface-container">
            <FileText aria-hidden="true" size={22} className="text-on-surface-variant" />
          </div>
          <p className="font-heading text-label-md text-primary">Aún no tienes CVs guardados</p>
          <p className="mt-1 text-body-sm text-on-surface-variant">Crea y guarda uno desde el editor principal para verlo aquí.</p>
        </Card>
      ) : null}

      {status === 'ready' && hasItems ? (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((cv) => (
            <button
              key={cv.id}
              type="button"
              onClick={() => handleOpenCv(cv)}
              className="w-full text-left"
            >
              <Card className="rounded-lg border-outline-variant p-5 transition-colors hover:bg-surface-container-low">
                <p className="font-heading text-label-lg text-primary">{cv.title}</p>
                <p className="mt-1 text-body-sm text-on-surface-variant">Estado: {statusLabel(cv.status)}</p>
                <p className="mt-1 text-body-sm text-on-surface-variant">Última edición: {formatDate(cv.updatedAt)}</p>
              </Card>
            </button>
          ))}
        </section>
      ) : null}
    </div>
  );
}
