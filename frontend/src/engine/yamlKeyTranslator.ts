// Código obtenido de https://github.com/kirlts/YaCV. Todos los créditos al autor.

/**
 * Bidirectional YAML key translator for ES ↔ EN.
 * Used to allow users to edit CV YAML with keys in their preferred language.
 * Before compilation, keys are always normalized to English internally.
 */

// Map: english key → spanish key
const EN_TO_ES: Record<string, string> = {
    // CV level
    name: 'nombre',
    location: 'ubicación',
    phone: 'teléfono',
    email: 'correo',
    website: 'sitio_web',
    headline: 'titular',
    sections: 'secciones',
    // Entry fields
    company: 'empresa',
    position: 'cargo',
    date: 'fecha',
    highlights: 'logros',
    institution: 'institución',
    area: 'área',
    degree: 'título',
    summary: 'resumen',
    label: 'etiqueta',
    details: 'detalles',
    start_date: 'fecha_inicio',
    end_date: 'fecha_fin',
    // Design (not translated — always english in design block)
};

// Build reverse map: spanish key → english key
const ES_TO_EN: Record<string, string> = {};
for (const [en, es] of Object.entries(EN_TO_ES)) {
    ES_TO_EN[es] = en;
}

// Section name translations (bidirectional)
const SECTION_EN_TO_ES: Record<string, string> = {
    'Experience': 'Experiencia',
    'Education': 'Educación',
    'Skills': 'Habilidades',
    'Personal Projects': 'Proyectos Personales',
    'Projects': 'Proyectos',
    'Publications': 'Publicaciones',
    'Certifications': 'Certificaciones',
    'Languages': 'Idiomas',
    'Awards': 'Premios',
    'Volunteering': 'Voluntariado',
    'References': 'Referencias',
    'Interests': 'Intereses',
    'Professional Experience': 'Experiencia Profesional',
    'Work Experience': 'Experiencia Laboral',
    'Technical Skills': 'Habilidades Técnicas',
};

const SECTION_ES_TO_EN: Record<string, string> = {};
for (const [en, es] of Object.entries(SECTION_EN_TO_ES)) {
    SECTION_ES_TO_EN[es] = en;
}

// Keys that should NOT be translated (structural/design)
const SKIP_KEYS = new Set(['cv', 'design', 'locale', 'theme', 'colors', 'typography', 'page', 'header', 'entries', 'links', 'section_titles', 'font_family', 'font_size', 'bold', 'small_caps', 'connections', 'language', 'social_networks', 'network', 'username']);

/**
 * Recursively translate keys in an object from one language to another.
 */
function translateKeys(obj: any, keyMap: Record<string, string>): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
        return obj.map(item => translateKeys(item, keyMap));
    }

    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
        // Don't translate inside 'design' or 'locale' blocks
        if (SKIP_KEYS.has(key)) {
            result[key] = value;
            continue;
        }
        const newKey = keyMap[key] || key;
        result[newKey] = translateKeys(value, keyMap);
    }
    return result;
}

/**
 * Translate section names (keys of the sections object) between languages.
 */
function translateSectionNames(sectionsObj: any, sectionMap: Record<string, string>): any {
    if (!sectionsObj || typeof sectionsObj !== 'object' || Array.isArray(sectionsObj)) return sectionsObj;
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(sectionsObj)) {
        const newKey = sectionMap[key] || key;
        result[newKey] = value;
    }
    return result;
}

/**
 * Translate YAML object keys from English to Spanish.
 */
export function translateToSpanish(obj: any): any {
    return translateKeys(obj, EN_TO_ES);
}

/**
 * Translate YAML object keys from Spanish to English.
 */
export function translateToEnglish(obj: any): any {
    return translateKeys(obj, ES_TO_EN);
}

/**
 * Normalize any YAML object to English keys (handles both EN and ES input).
 * This is used before compilation — the Typst engine always expects English keys.
 */
export function normalizeToEnglish(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;

    // If the object has Spanish keys, translate them
    const hasSpanishKeys = Object.keys(obj).some(k => ES_TO_EN[k] !== undefined);
    if (hasSpanishKeys) {
        return translateToEnglish(obj);
    }

    // Check nested cv object
    if (obj.cv && typeof obj.cv === 'object') {
        const cvHasSpanish = Object.keys(obj.cv).some(k => ES_TO_EN[k] !== undefined);
        if (cvHasSpanish) {
            return { ...obj, cv: translateToEnglish(obj.cv) };
        }
    }

    return obj;
}

/**
 * Switch the language of YAML keys in a parsed document.
 * Returns a new object with keys in the target language.
 * Also translates section names (Experience ↔ Experiencia, etc.)
 */
export function switchYamlLanguage(obj: any, targetLang: 'english' | 'spanish'): any {
    if (!obj || typeof obj !== 'object') return obj;

    // First normalize to English
    const normalized = normalizeToEnglish(obj);

    if (targetLang === 'spanish') {
        // Translate cv keys to Spanish
        if (normalized.cv) {
            const translated = { ...normalized, cv: translateToSpanish(normalized.cv) };
            // Also translate section names
            const sectionsKey = 'secciones'; // After translation, sections → secciones
            if (translated.cv[sectionsKey]) {
                translated.cv[sectionsKey] = translateSectionNames(translated.cv[sectionsKey], SECTION_EN_TO_ES);
            }
            return translated;
        }
        return normalized;
    }

    // targetLang === 'english': normalized is already in English keys
    // But section names might still be in Spanish — translate them
    if (normalized.cv?.sections) {
        normalized.cv.sections = translateSectionNames(normalized.cv.sections, SECTION_ES_TO_EN);
    }
    return normalized;
}

// Export maps for testing
export { EN_TO_ES, ES_TO_EN, SECTION_EN_TO_ES, SECTION_ES_TO_EN };
