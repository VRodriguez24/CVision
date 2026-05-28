import { useMemo, useRef, useState, useCallback } from 'react';
import yaml from 'js-yaml';
import { useRenderEngine } from '../../hooks/useRenderEngine.js';
import { PDFViewer } from '../../components/PDFViewer.js';
import { FormPanel } from '../../components/form/FormPanel.js';
import { initialFormData } from './formData.js';
import { mapFormDataToRenderCvDoc } from '../../adapters/mapFormDataToRenderCvDoc.js';

export function DashboardPage() {
  const [formData, setFormData] = useState(initialFormData);
  const [splitPercent, setSplitPercent] = useState(45);
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
      setSplitPercent(Math.min(75, Math.max(25, percent)));
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
    if (pdfUrl) {
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = 'document.pdf';
      a.click();
    }
  }, [pdfUrl]);

  return (
    <div className="mx-auto max-w-[1180px] pl-0 pr-8">
      <div ref={containerRef} className="h-[calc(100vh-140px)] overflow-hidden">
        <div className="hidden md:flex h-full w-full">
          <div style={{ width: `${splitPercent}%` }} className="h-full overflow-auto">
            <FormPanel value={formData} onChange={setFormData} />
          </div>

          <div
            className="w-1.5 bg-zinc-300 hover:bg-blue-500 cursor-col-resize flex-shrink-0"
            onMouseDown={onDividerMouseDown}
          />

          <div style={{ width: `${100 - splitPercent}%` }} className="h-full overflow-hidden bg-[#2d2d2d] flex flex-col">
            <div className="flex justify-end p-2 border-b border-zinc-700 bg-[#262626]">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={!pdfUrl}
                className="px-3 py-1.5 text-sm font-medium rounded bg-blue-600 text-white hover:bg-blue-500 disabled:bg-zinc-600 disabled:text-zinc-300 disabled:cursor-not-allowed"
              >
                Descargar PDF
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <PDFViewer url={pdfUrl} loading={status === 'compiling'} />
            </div>
            {error && <div className="p-2 text-xs text-red-600">{error}</div>}
          </div>
        </div>

        <div className="md:hidden h-full grid grid-rows-2 gap-3">
          <div className="overflow-auto"><FormPanel value={formData} onChange={setFormData} /></div>
          <div className="overflow-hidden bg-[#2d2d2d] flex flex-col">
            <div className="flex justify-end p-2 border-b border-zinc-700 bg-[#262626]">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={!pdfUrl}
                className="px-3 py-1.5 text-sm font-medium rounded bg-blue-600 text-white hover:bg-blue-500 disabled:bg-zinc-600 disabled:text-zinc-300 disabled:cursor-not-allowed"
              >
                Descargar PDF
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <PDFViewer url={pdfUrl} loading={status === 'compiling'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
