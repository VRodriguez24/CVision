// Código obtenido de https://github.com/kirlts/YaCV. Todos los créditos al autor.

import { useState, useEffect, useRef } from 'react';
import { $typst } from '@myriaddreamin/typst.ts';
import { loadFonts, disableDefaultFontAssets } from '@myriaddreamin/typst.ts/dist/esm/options.init.mjs';
import { generateTypstSource } from '../engine/yamlToTypst';

type RenderStatus = 'idle' | 'compiling' | 'success' | 'error';

// Font files in public/fonts/ — verified working TTFs
const FONT_URLS = [
    // Source Sans 3 (variable)
    './fonts/SourceSans3[wght].ttf',
    './fonts/SourceSans3-Italic[wght].ttf',
    // Lato
    './fonts/Lato-Regular.ttf',
    './fonts/Lato-Italic.ttf',
    './fonts/Lato-Bold.ttf',
    './fonts/Lato-BoldItalic.ttf',
    // Roboto (variable)
    './fonts/Roboto[wdth,wght].ttf',
    './fonts/Roboto-Italic[wdth,wght].ttf',
    // Fira Sans
    './fonts/FiraSans-Regular.ttf',
    './fonts/FiraSans-Italic.ttf',
    './fonts/FiraSans-Bold.ttf',
    './fonts/FiraSans-BoldItalic.ttf',
    // Montserrat
    './fonts/Montserrat-Regular.ttf',
    './fonts/Montserrat-Italic.ttf',
    './fonts/Montserrat-Bold.ttf',
    // Open Sans
    './fonts/OpenSans-Regular.ttf',
    './fonts/OpenSans-Italic.ttf',
    './fonts/OpenSans-Bold.ttf',
    // Raleway (regular only)
    './fonts/Raleway-Regular.ttf',
    // Nunito (italic only)
    './fonts/Nunito-Italic.ttf',
    // IBM Plex Sans (italic only)
    './fonts/IBMPlexSans-Italic.ttf',
    // Fontin (moderncv)
    './fonts/Fontin-Regular.otf',
    './fonts/Fontin-Bold.otf',
    './fonts/Fontin-Italic.otf',
    // XCharter (engineeringresumes)
    './fonts/XCharter-Regular.otf',
    './fonts/XCharter-Bold.otf',
    './fonts/XCharter-Italic.otf',
    './fonts/XCharter-BoldItalic.otf',
];

let typstInitialized = false;
let typstInitPromise: Promise<void> | null = null;

async function initTypst(): Promise<void> {
    if (typstInitialized) return;
    if (typstInitPromise) return typstInitPromise;

    typstInitPromise = (async () => {
        // Point the compiler to our local WASM binary, bypassing Vite's module resolution
        $typst.setCompilerInitOptions({
            getModule: () => './typst_ts_web_compiler_bg.wasm',
            beforeBuild: [
                disableDefaultFontAssets(),
                loadFonts(FONT_URLS),
            ],
        });

        // Trigger initialization by doing a trivial compile
        try {
            await $typst.pdf({ mainContent: 'Hello' });
        } catch (e) {
            // Ignore compilation errors during init — we just want the WASM loaded
            console.warn('Init probe compile (expected):', e);
        }

        typstInitialized = true;
    })();

    return typstInitPromise;
}

export function useRenderEngine(yamlString: string, debounceMs: number = 200) {
    const [status, setStatus] = useState<RenderStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [wasmReady, setWasmReady] = useState(false);

    const compilationIdRef = useRef(0);

    // Initialize WASM compiler on mount
    useEffect(() => {
        initTypst()
            .then(() => setWasmReady(true))
            .catch((err) => {
                console.error('WASM init failed:', err);
                setError(`WASM initialization failed: ${err.message}`);
                setStatus('error');
            });
    }, []);

    // Compile on YAML changes (debounced)
    useEffect(() => {
        if (!wasmReady) return;

        const currentId = ++compilationIdRef.current;

        const timeout = setTimeout(async () => {
            if (currentId !== compilationIdRef.current) return;

            setStatus('compiling');
            setError(null);

            try {
                const typstSource = await generateTypstSource(yamlString);

                if (currentId !== compilationIdRef.current) return;

                const result = await $typst.pdf({
                    mainContent: typstSource,
                });

                if (currentId !== compilationIdRef.current) return;

                if (result) {
                    const pdfBytes = new Uint8Array(result);
                    const blob = new Blob([pdfBytes.buffer.slice(0)], { type: 'application/pdf' });
                    const url = URL.createObjectURL(blob);

                    setPdfUrl((prevUrl) => {
                        if (prevUrl) URL.revokeObjectURL(prevUrl);
                        return url;
                    });

                    setStatus('success');
                } else {
                    throw new Error('Compilation returned empty result');
                }
            } catch (err: any) {
                if (currentId !== compilationIdRef.current) return;
                console.error('Compilation error:', err);
                setError(err.message || String(err));
                setStatus('error');
            }
        }, debounceMs);

        return () => clearTimeout(timeout);
    }, [yamlString, debounceMs, wasmReady]);

    return { status, error, pdfUrl, wasmReady };
}
