// Código obtenido de https://github.com/kirlts/YaCV. Todos los créditos al autor.

import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Use unpkg with pdfjs.version to ensure the worker version matches react-pdf's bundled pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  url: string | null;
  loading: boolean;
  maxPageWidth?: number;
}

const PAGE_GUTTER = 40;
const MIN_PAGE_WIDTH = 280;
const DEFAULT_MAX_PAGE_WIDTH = 980;

/**
 * PDFViewer — stacking grid pattern from rendercv-web.
 * Renders new PDF behind (opacity:0), waits for ALL pages to finish rendering,
 * then swaps to front and removes old PDFs. Zero flicker.
 */
export const PDFViewer: React.FC<PDFViewerProps> = ({ url, loading, maxPageWidth = DEFAULT_MAX_PAGE_WIDTH }) => {
  const [pdfs, setPdfs] = useState<{ url: string; id: number }[]>([]);
  const [numPagesMap, setNumPagesMap] = useState<Record<number, number>>({});
  const renderedPagesRef = useRef<Record<number, Set<number>>>({});
  const [readyPdfs, setReadyPdfs] = useState<Set<number>>(new Set());
  const [renderWidth, setRenderWidth] = useState(800);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const updateWidth = () => {
      const containerWidth = node.getBoundingClientRect().width;
      if (!containerWidth) return;
      const nextWidth = Math.max(MIN_PAGE_WIDTH, Math.min(maxPageWidth, Math.floor(containerWidth - PAGE_GUTTER)));
      setRenderWidth(nextWidth);
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);

    return () => observer.disconnect();
  }, [maxPageWidth]);

  // Add new PDF to stack when URL changes
  useEffect(() => {
    if (!url) return;
    setPdfs((prev) => {
      if (prev.length > 0 && prev[prev.length - 1].url === url) return prev;
      return [...prev, { url, id: Date.now() }];
    });
  }, [url]);

  const handleLoadSuccess = (id: number, numPages: number) => {
    setNumPagesMap((prev) => ({ ...prev, [id]: numPages }));
  };

  const handleRenderSuccess = (id: number, pageIndex: number, totalPages: number) => {
    if (!renderedPagesRef.current[id]) {
      renderedPagesRef.current[id] = new Set();
    }
    renderedPagesRef.current[id].add(pageIndex);

    // Only when ALL pages have finished rendering
    if (renderedPagesRef.current[id].size === totalPages) {
      setReadyPdfs((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });

      // Remove older PDFs after a brief delay
      setTimeout(() => {
        setPdfs((prev) => prev.filter((p) => p.id >= id));
        Object.keys(renderedPagesRef.current).forEach((key) => {
          if (Number(key) < id) delete renderedPagesRef.current[Number(key)];
        });
      }, 50);
    }
  };

  if (!url && pdfs.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#2d2d2d] text-gray-500">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-12 w-12 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>Initializing preview...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative flex h-full min-h-0 w-full justify-center overflow-x-hidden overflow-y-auto bg-[#2d2d2d]" data-testid="pdf-viewer">
      {loading ? (
        <div className="fixed bottom-8 right-8 z-50 flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-600/90 px-4 py-2 text-sm font-semibold text-white shadow-2xl backdrop-blur animate-pulse">
          <svg className="h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Rendering...
        </div>
      ) : null}

      <div className="mt-4 grid w-full max-w-full px-3 md:px-4">
        {pdfs.map((pdf, index) => {
          const isOlder = index < pdfs.length - 1;
          const pagesCount = numPagesMap[pdf.id];
          const isReady = readyPdfs.has(pdf.id) || (pdfs.length === 1 && !readyPdfs.has(pdf.id));

          return (
            <div
              key={pdf.id}
              className={`col-start-1 row-start-1 w-full ${isOlder ? 'pointer-events-none' : ''}`}
              style={{
                zIndex: isOlder ? 0 : 10,
                opacity: isReady || isOlder ? 1 : 0,
              }}
            >
              <Document
                file={pdf.url}
                onLoadSuccess={({ numPages }) => handleLoadSuccess(pdf.id, numPages)}
                loading={null}
                externalLinkTarget="_blank"
              >
                {pagesCount &&
                  Array.from(new Array(pagesCount), (_, fileIndex) => (
                    <div
                      key={`page_${pdf.id}_${fileIndex + 1}`}
                      className="mx-auto mb-4 overflow-hidden rounded border border-[#404040] shadow-2xl"
                      style={{ maxWidth: renderWidth, width: '100%' }}
                    >
                      <Page
                        pageNumber={fileIndex + 1}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        width={renderWidth}
                        className="pdf-page-scaled"
                        onRenderSuccess={() => handleRenderSuccess(pdf.id, fileIndex, pagesCount)}
                      />
                    </div>
                  ))}
              </Document>
            </div>
          );
        })}
      </div>
    </div>
  );
};
