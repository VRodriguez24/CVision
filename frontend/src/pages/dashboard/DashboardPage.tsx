import { useMemo, useRef, useState, useCallback } from 'react';
import yaml from 'js-yaml';
import { useRenderEngine } from '../../hooks/useRenderEngine.js';
import { PDFViewer } from '../../components/PDFViewer.js';
import { FormPanel } from '../../components/form/FormPanel.js';
import { initialFormData } from './formData.js';
import { mapFormDataToRenderCvDoc } from '../../adapters/mapFormDataToRenderCvDoc.js';

export function DashboardPage() {
  const [formData, setFormData] = useState(initialFormData);
  const [splitPercent, setSplitPercent] = useState(50);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const yamlString = useMemo(() => {
    const doc = mapFormDataToRenderCvDoc(formData);
    return yaml.dump(doc, { lineWidth: -1 });
  }, [formData]);

  const { status, pdfUrl, error } = useRenderEngine(yamlString, 200);

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

  return (
    <div className="w-full max-w-none">
      <div ref={containerRef} className="h-[calc(100vh-150px)] min-h-0 w-full overflow-hidden">
        <div className="hidden h-full w-full min-h-0 min-w-0 md:flex">
          <div style={{ width: `${splitPercent}%` }} className="h-full min-h-0 min-w-0 overflow-y-auto overflow-x-hidden">
            <FormPanel value={formData} onChange={setFormData} />
          </div>

          <div
            className="h-full w-2 flex-shrink-0 cursor-col-resize bg-zinc-300 transition-colors hover:bg-blue-500"
            onMouseDown={onDividerMouseDown}
          />

          <div style={{ width: `${100 - splitPercent}%` }} className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded border border-outline-variant bg-surface-container-low">
            <div className="flex justify-end border-b border-outline-variant bg-white p-2">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={!pdfUrl}
                className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:text-zinc-300"
              >
                Descargar PDF
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <PDFViewer url={pdfUrl} loading={status === 'compiling'} />
            </div>
            {error ? <div className="p-2 text-xs text-red-600">{error}</div> : null}
          </div>
        </div>

        <div className="grid h-full grid-rows-2 gap-3 md:hidden">
          <div className="overflow-auto"><FormPanel value={formData} onChange={setFormData} /></div>
          <div className="flex flex-col overflow-hidden rounded border border-outline-variant bg-surface-container-low">
            <div className="flex justify-end border-b border-outline-variant bg-white p-2">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={!pdfUrl}
                className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:text-zinc-300"
              >
                Descargar PDF
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <PDFViewer url={pdfUrl} loading={status === 'compiling'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
