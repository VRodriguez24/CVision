import { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import yaml from 'js-yaml';
import toast from 'react-hot-toast';
import { useRenderEngine } from '../../hooks/useRenderEngine.js';
import { PDFViewer } from '../../components/PDFViewer.js';
import { FormPanel } from '../../components/form/FormPanel.js';
import type { ImproveFieldRequest } from '../../components/form/FormPanel.js';
import { Modal } from '../../components/ui/index.js';
import { useAuth } from '../../context/index.js';
import { initialFormData } from './formData.js';
import { mapFormDataToRenderCvDoc } from '../../adapters/mapFormDataToRenderCvDoc.js';
import { analyzeCv, improveField, type AiCvAnalysis, type AiSuggestion } from '../../services/aiService.js';
import { createCv, getCvById, updateCv } from '../../services/cvService.js';
import type { CvFormData } from '../../types/cvForm.js';

const CV_TITLE_MAX_LENGTH = 160;
const TOAST_IDS = {
  loadingCv: 'dashboard-loading-cv',
  editingCv: 'dashboard-editing-cv',
  loadError: 'dashboard-load-error',
  saveResult: 'dashboard-save-result',
} as const;
const FILE_NAME_INVALID_CHARACTERS = /[\\/:*?"<>|\u0000-\u001F]/g;
const FILE_NAME_EXTRA_UNDERSCORES = /_+/g;
const ATS_KEYWORDS_SKILL_LABEL = 'Palabras clave ATS';

function sanitizeFileNameSegment(value: string | null | undefined, fallback: string) {
  const sanitized = (value ?? '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(FILE_NAME_INVALID_CHARACTERS, '')
    .replace(/\s+/g, '_')
    .replace(FILE_NAME_EXTRA_UNDERSCORES, '_')
    .replace(/^_+|_+$/g, '');

  return sanitized || fallback;
}

interface ActiveCv {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

function replaceSelection(text: string, replacement: string, selectionStart: number | null, selectionEnd: number | null) {
  if (selectionStart === null || selectionEnd === null || selectionStart === selectionEnd) {
    return replacement;
  }

  return `${text.slice(0, selectionStart)}${replacement}${text.slice(selectionEnd)}`;
}

function cloneContainer(value: unknown) {
  return Array.isArray(value) ? [...value] : { ...(value as Record<string, unknown>) };
}

function setStringAtPath(data: CvFormData, fieldPath: string, fieldValue: string) {
  const pathParts = fieldPath.split('.').filter(Boolean);

  if (pathParts.length === 0) {
    return data;
  }

  const nextData = cloneContainer(data) as unknown as CvFormData;
  let currentCopy: Record<string, unknown> | unknown[] = nextData as unknown as Record<string, unknown>;
  let currentSource: unknown = data;

  for (let index = 0; index < pathParts.length - 1; index += 1) {
    const key = pathParts[index];
    const sourceContainer = currentSource as Record<string, unknown> | unknown[];
    const sourceValue = Array.isArray(sourceContainer) ? sourceContainer[Number(key)] : sourceContainer[key];

    if (sourceValue === null || typeof sourceValue !== 'object') {
      return data;
    }

    const copiedValue = cloneContainer(sourceValue);

    if (Array.isArray(currentCopy)) {
      currentCopy[Number(key)] = copiedValue;
    } else {
      currentCopy[key] = copiedValue;
    }

    currentCopy = copiedValue as Record<string, unknown> | unknown[];
    currentSource = sourceValue;
  }

  const lastKey = pathParts[pathParts.length - 1];
  const sourceContainer = currentSource as Record<string, unknown> | unknown[];
  const currentValue = Array.isArray(sourceContainer) ? sourceContainer[Number(lastKey)] : sourceContainer[lastKey];

  if (typeof currentValue !== 'string') {
    return data;
  }

  if (Array.isArray(currentCopy)) {
    currentCopy[Number(lastKey)] = fieldValue;
  } else {
    currentCopy[lastKey] = fieldValue;
  }

  return nextData;
}

function upsertAtsKeywordsSkill(data: CvFormData, keywords: string[]) {
  const normalizedKeywords = Array.from(new Set(keywords.map((keyword) => keyword.trim()).filter(Boolean)));

  if (normalizedKeywords.length === 0) {
    return data;
  }

  const skillIndex = data.sections.skills.findIndex((skill) => skill.label.trim().toLowerCase() === ATS_KEYWORDS_SKILL_LABEL.toLowerCase());
  const nextSkills = [...data.sections.skills];
  const keywordDetails = normalizedKeywords.join(', ');

  if (skillIndex >= 0) {
    nextSkills[skillIndex] = {
      ...nextSkills[skillIndex],
      details: keywordDetails,
    };
  } else {
    nextSkills.push({
      label: ATS_KEYWORDS_SKILL_LABEL,
      details: keywordDetails,
    });
  }

  return {
    ...data,
    sections: {
      ...data.sections,
      skills: nextSkills,
    },
  };
}

function getSuggestionTone(category: AiSuggestion['category']) {
  if (category === 'inconsistency') return 'Inconsistencia';
  if (category === 'missing_field') return 'Campo vacío';
  if (category === 'keyword') return 'Keyword';
  if (category === 'ats') return 'ATS';
  return 'Redacción';
}

export function DashboardPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState(initialFormData);
  const [splitPercent, setSplitPercent] = useState(50);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [cvTitle, setCvTitle] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeCv, setActiveCv] = useState<ActiveCv | null>(null);
  const [isLoadingCv, setIsLoadingCv] = useState(false);
  const [improvingFieldPath, setImprovingFieldPath] = useState<string | null>(null);
  const [isTargetRoleModalOpen, setIsTargetRoleModalOpen] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [targetRoleError, setTargetRoleError] = useState<string | null>(null);
  const [isAnalyzingCv, setIsAnalyzingCv] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AiCvAnalysis | null>(null);
  const [dismissedSuggestionIds, setDismissedSuggestionIds] = useState<string[]>([]);
  const [editingSuggestionId, setEditingSuggestionId] = useState<string | null>(null);
  const [editedSuggestionValue, setEditedSuggestionValue] = useState('');
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

    const usernameAlias = user?.email?.split('@')[0] ?? '';
    const usernamePart = sanitizeFileNameSegment(usernameAlias, 'usuario');
    const titlePart = sanitizeFileNameSegment(activeCv?.title ?? 'Nuevo CV', 'cv');

    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `${usernamePart}_${titlePart}.pdf`;
    a.click();
  }, [activeCv?.title, pdfUrl, user?.email]);

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

  const handleImproveField = useCallback(
    async ({ fieldLabel, fieldPath, selectionEnd, selectionStart, text }: ImproveFieldRequest) => {
      const selectedText = selectionStart !== null && selectionEnd !== null && selectionStart !== selectionEnd
        ? text.slice(selectionStart, selectionEnd)
        : undefined;
      const textToImprove = selectedText ?? text;

      if (!textToImprove.trim()) {
        toast.error('Ingresa texto antes de mejorarlo con IA.');
        return;
      }

      setImprovingFieldPath(fieldPath);

      try {
        const result = await improveField({
          fieldPath,
          fieldLabel,
          text,
          selectedText,
          targetRole: targetRole.trim() || undefined,
          cv: formData,
        });
        const nextText = replaceSelection(text, result.improvedText, selectionStart, selectionEnd);
        setFormData((currentData) => setStringAtPath(currentData, fieldPath, nextText));
        toast.success(result.explanation || 'Campo mejorado con IA.');
      } catch (requestError) {
        const message = requestError instanceof Error ? requestError.message : 'No pudimos mejorar este campo.';
        toast.error(message);
      } finally {
        setImprovingFieldPath(null);
      }
    },
    [formData, targetRole],
  );

  const handleOpenAnalysisModal = useCallback(() => {
    setTargetRoleError(null);
    setIsTargetRoleModalOpen(true);
  }, []);

  const handleCloseAnalysisModal = useCallback(() => {
    if (isAnalyzingCv) return;
    setIsTargetRoleModalOpen(false);
    setTargetRoleError(null);
  }, [isAnalyzingCv]);

  const handleAnalyzeCv = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const normalizedTargetRole = targetRole.trim();

      if (!normalizedTargetRole) {
        setTargetRoleError('Ingresa un cargo o área laboral para orientar el análisis.');
        return;
      }

      setIsAnalyzingCv(true);
      setTargetRoleError(null);

      try {
        const result = await analyzeCv({
          targetRole: normalizedTargetRole,
          cv: formData,
        });

        setAnalysisResult(result);
        setDismissedSuggestionIds([]);
        setEditingSuggestionId(null);
        setEditedSuggestionValue('');
        setIsTargetRoleModalOpen(false);
        toast.success('Análisis IA listo.');
      } catch (requestError) {
        const message = requestError instanceof Error ? requestError.message : 'No pudimos analizar el CV con IA.';
        setTargetRoleError(message);
        toast.error(message);
      } finally {
        setIsAnalyzingCv(false);
      }
    },
    [formData, targetRole],
  );

  const handleAcceptSuggestion = useCallback((suggestion: AiSuggestion, overrideValue?: string) => {
    const nextValue = overrideValue ?? suggestion.suggestedValue;

    if (!nextValue.trim()) {
      toast.error('La sugerencia no contiene texto aplicable.');
      return;
    }

    setFormData((currentData) => setStringAtPath(currentData, suggestion.fieldPath, nextValue));
    setDismissedSuggestionIds((currentIds) => [...currentIds, suggestion.id]);
    setEditingSuggestionId(null);
    setEditedSuggestionValue('');
    toast.success('Sugerencia aplicada al CV.');
  }, []);

  const handleRejectSuggestion = useCallback((suggestionId: string) => {
    setDismissedSuggestionIds((currentIds) => [...currentIds, suggestionId]);
    setEditingSuggestionId(null);
    setEditedSuggestionValue('');
  }, []);

  const handleStartEditSuggestion = useCallback((suggestion: AiSuggestion) => {
    setEditingSuggestionId(suggestion.id);
    setEditedSuggestionValue(suggestion.suggestedValue);
  }, []);

  const handleAcceptKeywords = useCallback(() => {
    if (!analysisResult?.keywords.length) return;

    setFormData((currentData) => upsertAtsKeywordsSkill(currentData, analysisResult.keywords));
    toast.success('Keywords ATS agregadas a habilidades.');
  }, [analysisResult?.keywords]);

  const visibleSuggestions = useMemo(
    () => analysisResult?.suggestions.filter((suggestion) => !dismissedSuggestionIds.includes(suggestion.id)) ?? [],
    [analysisResult?.suggestions, dismissedSuggestionIds],
  );

  const renderPreviewActions = (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleOpenAnalysisModal}
        disabled={isAnalyzingCv || isLoadingCv}
        className="rounded border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isAnalyzingCv ? 'Analizando...' : 'Analizar CV con IA'}
      </button>
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
            <FormPanel value={formData} onChange={setFormData} cvTitle={activeCv?.title} onImproveField={handleImproveField} improvingFieldPath={improvingFieldPath} />
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
          <div className="overflow-auto"><FormPanel value={formData} onChange={setFormData} cvTitle={activeCv?.title} onImproveField={handleImproveField} improvingFieldPath={improvingFieldPath} /></div>
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

      <Modal
        open={isTargetRoleModalOpen}
        title="Analizar CV con IA"
        description="Indica el cargo o área laboral para orientar recomendaciones ATS y keywords."
        onClose={handleCloseAnalysisModal}
        className=""
        footer={(
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCloseAnalysisModal}
              disabled={isAnalyzingCv}
              className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="analyze-cv-form"
              disabled={isAnalyzingCv}
              className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-zinc-600"
            >
              {isAnalyzingCv ? 'Analizando...' : 'Analizar'}
            </button>
          </div>
        )}
      >
        <form id="analyze-cv-form" onSubmit={handleAnalyzeCv} className="space-y-4">
          <label htmlFor="target-role" className="block font-heading text-label-md text-primary/80">
            Cargo o área laboral
          </label>
          <input
            id="target-role"
            value={targetRole}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setTargetRole(event.target.value)}
            maxLength={160}
            placeholder="Ejemplo: Desarrollador Frontend Junior"
            autoFocus
            className="h-11 w-full rounded border border-field-border bg-white px-3 text-body-md text-on-surface outline-none transition-[border-color,box-shadow] placeholder:text-on-surface-variant/70 focus:border-ai-accent focus:border-2 focus:shadow-focus"
          />
          {targetRoleError ? <p className="text-body-sm text-error">{targetRoleError}</p> : null}
        </form>
      </Modal>

      <Modal
        open={analysisResult !== null}
        title="Recomendaciones IA"
        description={analysisResult ? `Puntaje ATS estimado: ${Math.round(analysisResult.score)}/100` : undefined}
        onClose={() => setAnalysisResult(null)}
        className="max-w-[920px]"
        footer={null}
      >
        {analysisResult ? (
          <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
            <section className="rounded border border-blue-100 bg-blue-50 p-4">
              <h3 className="font-heading text-label-md font-semibold text-blue-900">Resumen</h3>
              <p className="mt-2 text-sm text-blue-950">{analysisResult.summary}</p>
            </section>

            {analysisResult.keywords.length ? (
              <section className="rounded border border-zinc-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-heading text-label-md font-semibold text-primary">Keywords recomendadas</h3>
                    <p className="mt-2 text-sm text-on-surface-variant">{analysisResult.keywords.join(', ')}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAcceptKeywords}
                    className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500"
                  >
                    Aceptar keywords
                  </button>
                </div>
              </section>
            ) : null}

            {analysisResult.inconsistencies.length || analysisResult.missingFields.length ? (
              <section className="rounded border border-amber-200 bg-amber-50 p-4">
                <h3 className="font-heading text-label-md font-semibold text-amber-950">Alertas detectadas</h3>
                <ul className="mt-2 space-y-1 text-sm text-amber-950">
                  {analysisResult.inconsistencies.map((item) => (
                    <li key={`${item.fieldPath}-${item.message}`}>• {item.message} ({item.fieldPath})</li>
                  ))}
                  {analysisResult.missingFields.map((item) => (
                    <li key={`${item.fieldPath}-${item.label}`}>• {item.label}: {item.reason}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-heading text-label-md font-semibold text-primary">Sugerencias accionables</h3>
                <span className="text-xs text-on-surface-variant">{visibleSuggestions.length} pendientes</span>
              </div>

              {visibleSuggestions.length ? visibleSuggestions.map((suggestion) => {
                const isEditing = editingSuggestionId === suggestion.id;

                return (
                  <article key={suggestion.id} className="rounded border border-zinc-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-heading text-sm font-semibold text-primary">{suggestion.title}</h4>
                          <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-700">{getSuggestionTone(suggestion.category)}</span>
                          <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">{suggestion.severity}</span>
                        </div>
                        <p className="mt-1 text-xs text-on-surface-variant">{suggestion.fieldPath}</p>
                      </div>
                    </div>

                    <p className="mt-3 text-sm text-on-surface-variant">{suggestion.rationale}</p>
                    {suggestion.currentValue ? (
                      <p className="mt-3 rounded bg-zinc-50 p-3 text-xs text-zinc-600">
                        Actual: {suggestion.currentValue}
                      </p>
                    ) : null}

                    {isEditing ? (
                      <textarea
                        value={editedSuggestionValue}
                        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setEditedSuggestionValue(event.target.value)}
                        rows={4}
                        className="mt-3 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
                      />
                    ) : (
                      <p className="mt-3 whitespace-pre-wrap rounded border border-blue-100 bg-blue-50 p-3 text-sm text-blue-950">
                        {suggestion.suggestedValue}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap justify-end gap-2">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSuggestionId(null);
                              setEditedSuggestionValue('');
                            }}
                            className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                          >
                            Cancelar edición
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAcceptSuggestion(suggestion, editedSuggestionValue)}
                            className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500"
                          >
                            Aplicar edición
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleRejectSuggestion(suggestion.id)}
                            className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                          >
                            Rechazar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartEditSuggestion(suggestion)}
                            className="rounded border border-blue-600 bg-white px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAcceptSuggestion(suggestion)}
                            className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500"
                          >
                            Aceptar
                          </button>
                        </>
                      )}
                    </div>
                  </article>
                );
              }) : (
                <p className="rounded border border-zinc-200 bg-white p-4 text-sm text-on-surface-variant">
                  No quedan sugerencias pendientes.
                </p>
              )}
            </section>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
