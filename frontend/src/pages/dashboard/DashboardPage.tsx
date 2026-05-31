import { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import yaml from 'js-yaml';
import toast from 'react-hot-toast';
import { useRenderEngine } from '../../hooks/useRenderEngine.js';
import { PDFViewer } from '../../components/PDFViewer.js';
import { FormPanel } from '../../components/form/FormPanel.js';
import { Modal } from '../../components/ui/index.js';
import { initialFormData } from './formData.js';
import { mapFormDataToRenderCvDoc } from '../../adapters/mapFormDataToRenderCvDoc.js';
import { createCv, getCvById, updateCv } from '../../services/cvService.js';

const CV_TITLE_MAX_LENGTH = 160;
const TOAST_IDS = {
  loadingCv: 'dashboard-loading-cv',
  editingCv: 'dashboard-editing-cv',
  loadError: 'dashboard-load-error',
  saveResult: 'dashboard-save-result',
} as const;

interface ActiveCv {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export function DashboardPage() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState(initialFormData);
  const [splitPercent, setSplitPercent] = useState(50);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [cvTitle, setCvTitle] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeCv, setActiveCv] = useState<ActiveCv | null>(null);
  const [isLoadingCv, setIsLoadingCv] = useState(false);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeCvId = searchParams.get('cvId');

  const yamlString = useMemo(() => {
    const doc = mapFormDataToRenderCvDoc(formData);
    return yaml.dump(doc, { lineWidth: -1 });
  }, [formData]);

  const { status, pdfUrl, error } = useRenderEngine(yamlString, 200);

  useEffect(() => {
    let ignore = false;

    async function loadCvForEditing() {
      if (!activeCvId) {
        if (!ignore) {
          setActiveCv(null);
          setIsLoadingCv(false);
          toast.dismiss(TOAST_IDS.loadingCv);
          toast.dismiss(TOAST_IDS.editingCv);
        }
        return;
      }

      setIsLoadingCv(true);
      toast.loading('Cargando CV seleccionado...', { id: TOAST_IDS.loadingCv });

      try {
        const payload = await getCvById(activeCvId);

        if (ignore) return;

        setActiveCv(payload.cv);
        setFormData(payload.snapshot);
        toast.dismiss(TOAST_IDS.loadError);
        toast(`Editando: ${payload.cv.title}`, { id: TOAST_IDS.editingCv });
      } catch {
        if (!ignore) {
          setActiveCv(null);
          toast.dismiss(TOAST_IDS.editingCv);
          toast.error('No pudimos cargar este CV para edición.', { id: TOAST_IDS.loadError });
        }
      } finally {
        if (!ignore) {
          setIsLoadingCv(false);
          toast.dismiss(TOAST_IDS.loadingCv);
        }
      }
    }

    loadCvForEditing();

    return () => {
      ignore = true;
      toast.dismiss(TOAST_IDS.loadingCv);
    };
  }, [activeCvId]);

  const onDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;

    const onMove = (ev: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const percent = ((ev.clientX - rect.left) / rect.width) * 100;
      setSplitPercent(Math.min(65, Math.max(35, percent)));
    };

    const onUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, []);

  const handleDownloadPdf = useCallback(() => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = 'document.pdf';
    a.click();
  }, [pdfUrl]);

  const handleOpenSaveModal = useCallback(() => {
    setSaveError(null);
    setCvTitle('');
    setIsSaveModalOpen(true);
  }, []);

  const handleCloseSaveModal = useCallback(() => {
    if (isSaving) return;
    setIsSaveModalOpen(false);
    setSaveError(null);
  }, [isSaving]);

  const handleSaveAsNew = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const normalizedTitle = cvTitle.trim();

      if (!normalizedTitle) {
        setSaveError('El nombre del CV es obligatorio.');
        return;
      }

      if (normalizedTitle.length > CV_TITLE_MAX_LENGTH) {
        setSaveError(`El nombre no puede superar los ${CV_TITLE_MAX_LENGTH} caracteres.`);
        return;
      }

      setIsSaving(true);
      setSaveError(null);

      try {
        await createCv({
          title: normalizedTitle,
          snapshot: formData,
        });

        setIsSaveModalOpen(false);
        setCvTitle('');
        toast.success('CV guardado como nuevo correctamente.', { id: TOAST_IDS.saveResult });
      } catch (requestError) {
        const statusCode = (requestError as { status?: number }).status;
        const errorCode = (requestError as { code?: string }).code;

        if (statusCode === 409 || errorCode === 'CONFLICT') {
          setSaveError('Ya tienes un CV con ese nombre. Usa un nombre distinto.');
          toast.error('Ya tienes un CV con ese nombre. Usa un nombre distinto.', { id: TOAST_IDS.saveResult });
        } else {
          setSaveError('No pudimos guardar el CV. Intenta nuevamente en unos minutos.');
          toast.error('No pudimos guardar el CV. Intenta nuevamente en unos minutos.', { id: TOAST_IDS.saveResult });
        }
      } finally {
        setIsSaving(false);
      }
    },
    [cvTitle, formData],
  );

  const handleSaveChanges = useCallback(async () => {
    if (!activeCv || isSaving) return;

    setIsSaving(true);

    try {
      const result = await updateCv(activeCv.id, {
        snapshot: formData,
      });

      setActiveCv(result.cv);
      toast.success('Cambios guardados en el CV actual.', { id: TOAST_IDS.saveResult });
    } catch {
      toast.error('No pudimos guardar los cambios en este CV. Intenta nuevamente.', { id: TOAST_IDS.saveResult });
    } finally {
      setIsSaving(false);
    }
  }, [activeCv, formData, isSaving]);

  const renderPreviewActions = (
    <div className="flex items-center gap-2">
      {activeCv ? (
        <button
          type="button"
          onClick={handleSaveChanges}
          disabled={isSaving || isLoadingCv}
          className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:text-zinc-300"
        >
          {isSaving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      ) : null}
      <button
        type="button"
        onClick={handleOpenSaveModal}
        disabled={isSaving || isLoadingCv}
        className="rounded border border-blue-600 bg-white px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {activeCv ? 'Guardar como nuevo' : 'Guardar CV'}
      </button>
      <button
        type="button"
        onClick={handleDownloadPdf}
        disabled={!pdfUrl}
        className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:text-zinc-300"
      >
        Descargar PDF
      </button>
    </div>
  );

  return (
    <div className="w-full max-w-none">
      <div ref={containerRef} className="h-[calc(100vh-150px)] min-h-0 w-full overflow-hidden">
        <div className="hidden h-full w-full min-h-0 min-w-0 md:flex">
          <div style={{ width: `${splitPercent}%` }} className="h-full min-h-0 min-w-0 overflow-y-auto overflow-x-hidden">
            <FormPanel value={formData} onChange={setFormData} cvTitle={activeCv?.title} />
          </div>

          <div
            className="h-full w-2 flex-shrink-0 cursor-col-resize bg-zinc-300 transition-colors hover:bg-blue-500"
            onMouseDown={onDividerMouseDown}
          />

          <div style={{ width: `${100 - splitPercent}%` }} className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded border border-outline-variant bg-surface-container-low">
            <div className="flex justify-end border-b border-outline-variant bg-white p-2">{renderPreviewActions}</div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <PDFViewer url={pdfUrl} loading={status === 'compiling'} />
            </div>
            {error ? <div className="p-2 text-xs text-red-600">{error}</div> : null}
          </div>
        </div>

        <div className="grid h-full grid-rows-2 gap-3 md:hidden">
          <div className="overflow-auto"><FormPanel value={formData} onChange={setFormData} cvTitle={activeCv?.title} /></div>
          <div className="flex flex-col overflow-hidden rounded border border-outline-variant bg-surface-container-low">
            <div className="flex justify-end border-b border-outline-variant bg-white p-2">{renderPreviewActions}</div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <PDFViewer url={pdfUrl} loading={status === 'compiling'} />
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={isSaveModalOpen}
        title="Guardar CV"
        description="Asigna un nombre para almacenar esta versión como un nuevo currículum."
        onClose={handleCloseSaveModal}
        className=""
        footer={(
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCloseSaveModal}
              disabled={isSaving}
              className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="save-cv-form"
              disabled={isSaving}
              className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-zinc-600"
            >
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        )}
      >
        <form id="save-cv-form" onSubmit={handleSaveAsNew} className="space-y-4">
          <label htmlFor="cv-title" className="block font-heading text-label-md text-primary/80">
            Nombre del CV
          </label>
          <input
            id="cv-title"
            value={cvTitle}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setCvTitle(event.target.value)}
            maxLength={CV_TITLE_MAX_LENGTH}
            placeholder="Ejemplo: CV Frontend 2026"
            autoFocus
            className="h-11 w-full rounded border border-field-border bg-white px-3 text-body-md text-on-surface outline-none transition-[border-color,box-shadow] placeholder:text-on-surface-variant/70 focus:border-ai-accent focus:border-2 focus:shadow-focus"
          />
          {saveError ? <p className="text-body-sm text-error">{saveError}</p> : null}
          <p className="text-xs text-on-surface-variant">Máximo {CV_TITLE_MAX_LENGTH} caracteres.</p>
        </form>
      </Modal>
    </div>
  );
}
