import { useCallback, useEffect, useMemo, useState } from 'react';
import { FileText, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import editIcon from '../../assets/icons/edit_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg';
import deleteIcon from '../../assets/icons/delete_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg';
import { Button, Card, Modal } from '../../components/ui/index.js';
import { deleteCv, listCvs, renameCv } from '../../services/cvService.js';

const CV_TITLE_MAX_LENGTH = 160;

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
  const [feedback, setFeedback] = useState(null);

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameTargetCv, setRenameTargetCv] = useState(null);
  const [renameTitle, setRenameTitle] = useState('');
  const [renameError, setRenameError] = useState(null);

  const [renamingCvId, setRenamingCvId] = useState(null);
  const [deletingCvId, setDeletingCvId] = useState(null);

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

  const handleOpenRenameModal = (event, cv) => {
    event.stopPropagation();
    setFeedback(null);
    setRenameError(null);
    setRenameTargetCv(cv);
    setRenameTitle(cv.title);
    setIsRenameModalOpen(true);
  };

  const handleCloseRenameModal = () => {
    if (renamingCvId) return;
    setIsRenameModalOpen(false);
    setRenameTargetCv(null);
    setRenameTitle('');
    setRenameError(null);
  };

  const handleRenameSubmit = async (event) => {
    event.preventDefault();

    if (!renameTargetCv) return;

    const normalizedTitle = renameTitle.trim();

    if (!normalizedTitle) {
      setRenameError('El nombre del CV es obligatorio.');
      return;
    }

    if (normalizedTitle.length > CV_TITLE_MAX_LENGTH) {
      setRenameError(`El nombre no puede superar los ${CV_TITLE_MAX_LENGTH} caracteres.`);
      return;
    }

    setRenamingCvId(renameTargetCv.id);
    setRenameError(null);

    try {
      const updatedCv = await renameCv(renameTargetCv.id, {
        title: normalizedTitle,
      });

      setItems((current) => current.map((item) => (item.id === updatedCv.id ? updatedCv : item)));
      setFeedback({ type: 'success', message: 'CV renombrado correctamente.' });
      setIsRenameModalOpen(false);
      setRenameTargetCv(null);
      setRenameTitle('');
      setRenameError(null);
    } catch (requestError) {
      const statusCode = requestError?.status;
      const errorCode = requestError?.code;

      if (statusCode === 409 || errorCode === 'CONFLICT') {
        setRenameError('Ya tienes un CV con ese nombre. Usa uno distinto.');
      } else {
        setRenameError('No pudimos renombrar el CV. Intenta nuevamente.');
      }
    } finally {
      setRenamingCvId(null);
    }
  };

  const handleDeleteCv = async (event, cv) => {
    event.stopPropagation();

    if (deletingCvId || renamingCvId) {
      return;
    }

    const shouldDelete = window.confirm(`¿Seguro que quieres eliminar "${cv.title}"?`);

    if (!shouldDelete) {
      return;
    }

    setDeletingCvId(cv.id);
    setFeedback(null);

    try {
      await deleteCv(cv.id);
      setItems((current) => current.filter((item) => item.id !== cv.id));
      setFeedback({ type: 'success', message: 'CV eliminado correctamente.' });
    } catch {
      setFeedback({ type: 'error', message: 'No pudimos eliminar el CV. Intenta nuevamente.' });
    } finally {
      setDeletingCvId(null);
    }
  };

  const feedbackClassName = feedback?.type === 'error'
    ? 'border-red-200 bg-red-50 text-red-700'
    : 'border-emerald-200 bg-emerald-50 text-emerald-700';

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

      {feedback ? (
        <div className={`rounded border px-3 py-2 text-sm ${feedbackClassName}`}>{feedback.message}</div>
      ) : null}

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
          {items.map((cv) => {
            const isDeleting = deletingCvId === cv.id;
            const isRenaming = renamingCvId === cv.id;
            const actionDisabled = isDeleting || isRenaming;

            return (
              <Card
                key={cv.id}
                as="article"
                role="button"
                tabIndex={0}
                onClick={() => handleOpenCv(cv)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleOpenCv(cv);
                  }
                }}
                className="cursor-pointer rounded-xl border-outline-variant bg-[#d9d9d9] p-5 text-left transition-colors hover:bg-[#d2d2d2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-heading text-label-lg text-primary">{cv.title}</p>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Renombrar CV"
                      onClick={(event) => handleOpenRenameModal(event, cv)}
                      disabled={actionDisabled}
                      className="inline-flex h-9 w-9 items-center justify-center rounded transition-colors hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <img src={editIcon} alt="" className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label="Eliminar CV"
                      onClick={(event) => handleDeleteCv(event, cv)}
                      disabled={actionDisabled}
                      className="inline-flex h-9 w-9 items-center justify-center rounded transition-colors hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <img src={deleteIcon} alt="" className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <p className="mt-2 text-body-sm text-on-surface-variant">Estado: {statusLabel(cv.status)}</p>
                <p className="mt-1 text-body-sm text-on-surface-variant">Última edición: {formatDate(cv.updatedAt)}</p>
              </Card>
            );
          })}
        </section>
      ) : null}

      <Modal
        open={isRenameModalOpen}
        title="Renombrar CV"
        description="Ingresa el nuevo nombre para este CV."
        onClose={handleCloseRenameModal}
        className=""
        footer={(
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCloseRenameModal}
              disabled={Boolean(renamingCvId)}
              className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="rename-cv-form"
              disabled={Boolean(renamingCvId)}
              className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-zinc-600"
            >
              {renamingCvId ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        )}
      >
        <form id="rename-cv-form" onSubmit={handleRenameSubmit} className="space-y-4">
          <label htmlFor="rename-cv-title" className="block font-heading text-label-md text-primary/80">
            Nombre del CV
          </label>
          <input
            id="rename-cv-title"
            value={renameTitle}
            onChange={(event) => setRenameTitle(event.target.value)}
            maxLength={CV_TITLE_MAX_LENGTH}
            placeholder="Ejemplo: CV Frontend 2026"
            autoFocus
            className="h-11 w-full rounded border border-field-border bg-white px-3 text-body-md text-on-surface outline-none transition-[border-color,box-shadow] placeholder:text-on-surface-variant/70 focus:border-ai-accent focus:border-2 focus:shadow-focus"
          />
          {renameError ? <p className="text-body-sm text-error">{renameError}</p> : null}
        </form>
      </Modal>
    </div>
  );
}
