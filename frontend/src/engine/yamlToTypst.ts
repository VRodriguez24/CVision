// Código obtenido de https://github.com/kirlts/YaCV. Todos los créditos al autor.

import yaml from 'js-yaml';
import { getThemeDefaults } from './themeRegistry';
import { normalizeToEnglish } from './yamlKeyTranslator';

// lib.typ content will be fetched and cached
let libTypContent: string | null = null;

async function getLibTyp(): Promise<string> {
    if (libTypContent) return libTypContent;
    try {
        const resp = await fetch('./packages/preview/rendercv/0.2.0/lib.typ');
        if (!resp.ok) throw new Error(`Failed to fetch lib.typ: ${resp.status}`);
        let content = await resp.text();
        // Remove the @preview/fontawesome import — we stub fa-icon
        content = content.replace(
            '#import "@preview/fontawesome:0.6.0": fa-icon',
            '#let fa-icon(name, ..args) = []'
        );
        libTypContent = content;
        return content;
    } catch (e) {
        console.error('Failed to load lib.typ:', e);
        throw e;
    }
}

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────

interface CV {
    name?: string;
    headline?: string;
    location?: string;
    email?: string;
    phone?: string;
    website?: string;
    linkedin?: string;
    github?: string;
    social_networks?: Array<{ network: string; username?: string; name?: string }>;
    sections?: Record<string, any[]>;
}

interface Locale {
    language?: string;
}

interface DesignColors {
    body?: string;
    name?: string;
    headline?: string;
    connections?: string;
    section_titles?: string;
    links?: string;
    footer?: string;
    top_note?: string;
}

interface DesignTypography {
    font_family?: string | {
        body?: string;
        name?: string;
        headline?: string;
        connections?: string;
        section_titles?: string;
    };
    font_size?: {
        body?: string;
        name?: string;
        headline?: string;
        connections?: string;
        section_titles?: string;
    };
    line_spacing?: string;
    alignment?: string;
    date_and_location_column_alignment?: string;
    bold?: {
        name?: boolean;
        headline?: boolean;
        connections?: boolean;
        section_titles?: boolean;
    };
    small_caps?: {
        name?: boolean;
        headline?: boolean;
        connections?: boolean;
        section_titles?: boolean;
    };
}

interface DesignHeader {
    alignment?: string;
    photo_width?: string;
    space_below_name?: string;
    space_below_headline?: string;
    space_below_connections?: string;
    connections?: {
        hyperlink?: boolean;
        show_icons?: boolean;
        display_urls_instead_of_usernames?: boolean;
        separator?: string;
        space_between_connections?: string;
    };
}

interface DesignSectionTitles {
    type?: string;
    line_thickness?: string;
    space_above?: string;
    space_below?: string;
}

interface DesignEntries {
    date_and_location_width?: string;
    side_space?: string;
    space_between_columns?: string;
    allow_page_break?: boolean;
    short_second_row?: boolean;
    degree_width?: string;
    summary?: {
        space_left?: string;
        space_above?: string;
    };
    highlights?: {
        bullet?: string;
        nested_bullet?: string;
        space_left?: string;
        space_above?: string;
        space_between_items?: string;
        space_between_bullet_and_text?: string;
    };
}

interface DesignPage {
    size?: string;
    top_margin?: string;
    bottom_margin?: string;
    left_margin?: string;
    right_margin?: string;
    show_footer?: boolean;
    show_top_note?: boolean;
}

interface DesignLinks {
    underline?: boolean;
    show_external_link_icon?: boolean;
}

interface DesignSections {
    allow_page_break?: boolean;
    space_between_text_based_entries?: string;
    space_between_regular_entries?: string;
}

interface Design {
    theme?: string;
    colors?: DesignColors;
    typography?: DesignTypography;
    page?: DesignPage;
    header?: DesignHeader;
    section_titles?: DesignSectionTitles;
    entries?: DesignEntries;
    links?: DesignLinks;
    sections?: DesignSections;
}

interface RenderCVData {
    cv?: CV;
    locale?: Locale;
    design?: Design;
}

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────

function escapeTypst(s: string): string {
    if (!s) return '';
    return s
        .replace(/@/g, '\\@')
        .replace(/#/g, '\\#')
        .replace(/\$/g, '\\$');
}

export function hexToRgb(hex: string): string {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgb(${r}, ${g}, ${b})`;
}

export function toTypstColor(color: string | undefined, fallback: string): string {
    const raw = color || fallback;
    if (!raw) return 'rgb(0, 0, 0)';
    if (raw.startsWith('rgb(')) return raw;
    if (raw.startsWith('#') && raw.length >= 7) return hexToRgb(raw);
    return 'rgb(0, 0, 0)';
}

export function toTypstDimension(value: string | undefined, fallback: string): string {
    if (!value) return fallback;
    return value;
}

export function toTypstBool(value: boolean | undefined, fallback: boolean): string {
    return (value !== undefined ? value : fallback) ? 'true' : 'false';
}

function getFontFamily(typography: DesignTypography | undefined, field: string, fallback: string): string {
    if (!typography?.font_family) return fallback;
    if (typeof typography.font_family === 'string') return typography.font_family;
    return (typography.font_family as any)[field] || fallback;
}

function getFontSize(typography: DesignTypography | undefined, field: string, fallback: string): string {
    if (!typography?.font_size) return fallback;
    return (typography.font_size as any)[field] || fallback;
}

function getBold(typography: DesignTypography | undefined, field: string, fallback: boolean): boolean {
    if (!typography?.bold) return fallback;
    return (typography.bold as any)[field] ?? fallback;
}

function getSmallCaps(typography: DesignTypography | undefined, field: string, fallback: boolean): boolean {
    if (!typography?.small_caps) return fallback;
    return (typography.small_caps as any)[field] ?? fallback;
}

// ──────────────────────────────────────────
// Preamble generation (theme-aware)
// ──────────────────────────────────────────

function generatePreamble(cv: CV, design: Design, locale: Locale): string {
    // Get theme defaults — this is what makes theme switching actually work
    const themeName = design.theme || 'classic';
    const td = getThemeDefaults(themeName);

    const d = design;
    const t = d.typography;
    const c = d.colors;
    const p = d.page;
    const h = d.header;
    const st = d.section_titles;
    const e = d.entries;
    const l = d.links;
    const s = d.sections;
    const hc = h?.connections;
    const eh = e?.highlights;
    const es = e?.summary;

    const lines = [
        `#show: rendercv.with(`,
        `  name: "${escapeTypst(cv.name || 'CV')}",`,
        `  page-size: "${toTypstDimension(p?.size, td.page.size)}",`,
        `  page-top-margin: ${toTypstDimension(p?.top_margin, td.page.top_margin)},`,
        `  page-bottom-margin: ${toTypstDimension(p?.bottom_margin, td.page.bottom_margin)},`,
        `  page-left-margin: ${toTypstDimension(p?.left_margin, td.page.left_margin)},`,
        `  page-right-margin: ${toTypstDimension(p?.right_margin, td.page.right_margin)},`,
        `  page-show-footer: ${toTypstBool(p?.show_footer, td.page.show_footer)},`,
        `  page-show-top-note: ${toTypstBool(p?.show_top_note, td.page.show_top_note)},`,
        // Colors — theme defaults override base, explicit YAML values override theme
        `  colors-body: ${toTypstColor(c?.body, td.colors.body)},`,
        `  colors-name: ${toTypstColor(c?.name, td.colors.name)},`,
        `  colors-headline: ${toTypstColor(c?.headline, td.colors.headline)},`,
        `  colors-connections: ${toTypstColor(c?.connections, td.colors.connections)},`,
        `  colors-section-titles: ${toTypstColor(c?.section_titles, td.colors.section_titles)},`,
        `  colors-links: ${toTypstColor(c?.links, td.colors.links)},`,
        `  colors-footer: ${toTypstColor(c?.footer, td.colors.footer)},`,
        `  colors-top-note: ${toTypstColor(c?.top_note, td.colors.top_note)},`,
        // Typography
        `  typography-line-spacing: ${toTypstDimension(t?.line_spacing, td.typography.line_spacing)},`,
        `  typography-alignment: "${t?.alignment || td.typography.alignment}",`,
        `  typography-date-and-location-column-alignment: ${t?.date_and_location_column_alignment || 'right'},`,
        `  typography-font-family-body: "${getFontFamily(t, 'body', td.typography.font_family)}",`,
        `  typography-font-family-name: "${getFontFamily(t, 'name', td.typography.font_family)}",`,
        `  typography-font-family-headline: "${getFontFamily(t, 'headline', td.typography.font_family)}",`,
        `  typography-font-family-connections: "${getFontFamily(t, 'connections', td.typography.font_family)}",`,
        `  typography-font-family-section-titles: "${getFontFamily(t, 'section_titles', td.typography.font_family)}",`,
        `  typography-font-size-body: ${getFontSize(t, 'body', td.typography.font_size.body)},`,
        `  typography-font-size-name: ${getFontSize(t, 'name', td.typography.font_size.name)},`,
        `  typography-font-size-headline: ${getFontSize(t, 'headline', td.typography.font_size.headline)},`,
        `  typography-font-size-connections: ${getFontSize(t, 'connections', td.typography.font_size.connections)},`,
        `  typography-font-size-section-titles: ${getFontSize(t, 'section_titles', td.typography.font_size.section_titles)},`,
        `  typography-small-caps-name: ${toTypstBool(getSmallCaps(t, 'name', td.typography.small_caps.name), false)},`,
        `  typography-small-caps-headline: ${toTypstBool(getSmallCaps(t, 'headline', td.typography.small_caps.headline), false)},`,
        `  typography-small-caps-connections: ${toTypstBool(getSmallCaps(t, 'connections', td.typography.small_caps.connections), false)},`,
        `  typography-small-caps-section-titles: ${toTypstBool(getSmallCaps(t, 'section_titles', td.typography.small_caps.section_titles), false)},`,
        `  typography-bold-name: ${toTypstBool(getBold(t, 'name', td.typography.bold.name), false)},`,
        `  typography-bold-headline: ${toTypstBool(getBold(t, 'headline', td.typography.bold.headline), false)},`,
        `  typography-bold-connections: ${toTypstBool(getBold(t, 'connections', td.typography.bold.connections), false)},`,
        `  typography-bold-section-titles: ${toTypstBool(getBold(t, 'section_titles', td.typography.bold.section_titles), false)},`,
        // Links
        `  links-underline: ${toTypstBool(l?.underline, td.links.underline)},`,
        `  links-show-external-link-icon: ${toTypstBool(l?.show_external_link_icon, td.links.show_external_link_icon)},`,
        // Header
        `  header-alignment: ${h?.alignment || 'left'},`,
        `  header-photo-width: ${toTypstDimension(h?.photo_width, '3.5cm')},`,
        `  header-space-below-name: ${toTypstDimension(h?.space_below_name, '0.7cm')},`,
        `  header-space-below-headline: ${toTypstDimension(h?.space_below_headline, '0.7cm')},`,
        `  header-space-below-connections: ${toTypstDimension(h?.space_below_connections, '0.7cm')},`,
        `  header-connections-hyperlink: ${toTypstBool(hc?.hyperlink, td.header.connections.hyperlink)},`,
        `  header-connections-show-icons: ${toTypstBool(hc?.show_icons, td.header.connections.show_icons)},`,
        `  header-connections-display-urls-instead-of-usernames: ${toTypstBool(hc?.display_urls_instead_of_usernames, td.header.connections.display_urls_instead_of_usernames)},`,
        `  header-connections-separator: "${hc?.separator || ''}",`,
        `  header-connections-space-between-connections: ${toTypstDimension(hc?.space_between_connections, '0.5cm')},`,
        // Section titles — use theme defaults
        `  section-titles-type: "${st?.type || td.section_titles.type}",`,
        `  section-titles-line-thickness: ${toTypstDimension(st?.line_thickness, td.section_titles.line_thickness)},`,
        `  section-titles-space-above: ${toTypstDimension(st?.space_above, td.section_titles.space_above)},`,
        `  section-titles-space-below: ${toTypstDimension(st?.space_below, td.section_titles.space_below)},`,
        // Sections
        `  sections-allow-page-break: ${toTypstBool(s?.allow_page_break, true)},`,
        `  sections-space-between-text-based-entries: ${toTypstDimension(s?.space_between_text_based_entries, td.sections.space_between_text_based_entries)},`,
        `  sections-space-between-regular-entries: ${toTypstDimension(s?.space_between_regular_entries, td.sections.space_between_regular_entries)},`,
        // Entries — use theme defaults
        `  entries-date-and-location-width: ${toTypstDimension(e?.date_and_location_width, td.entries.date_and_location_width)},`,
        `  entries-side-space: ${toTypstDimension(e?.side_space, td.entries.side_space)},`,
        `  entries-space-between-columns: ${toTypstDimension(e?.space_between_columns, td.entries.space_between_columns)},`,
        `  entries-allow-page-break: ${toTypstBool(e?.allow_page_break, false)},`,
        `  entries-short-second-row: ${toTypstBool(e?.short_second_row, false)},`,
        `  entries-degree-width: ${toTypstDimension(e?.degree_width, '1cm')},`,
        `  entries-summary-space-left: ${toTypstDimension(es?.space_left, '0cm')},`,
        `  entries-summary-space-above: ${toTypstDimension(es?.space_above, '0.12cm')},`,
        `  entries-highlights-bullet: "${eh?.bullet || td.entries.highlights_bullet}",`,
        `  entries-highlights-nested-bullet: "${eh?.nested_bullet || td.entries.highlights_nested_bullet}",`,
        `  entries-highlights-space-left: ${toTypstDimension(eh?.space_left, td.entries.highlights_space_left)},`,
        `  entries-highlights-space-above: ${toTypstDimension(eh?.space_above, td.entries.highlights_space_above)},`,
        `  entries-highlights-space-between-items: ${toTypstDimension(eh?.space_between_items, td.entries.highlights_space_between_items)},`,
        `  entries-highlights-space-between-bullet-and-text: ${toTypstDimension(eh?.space_between_bullet_and_text, '0.5em')},`,
        `)`,
        ``,
        `#set text(hyphenate: false)`,
    ];

    return lines.join('\n');
}

// ──────────────────────────────────────────
// Header generation
// ──────────────────────────────────────────

function generateHeader(cv: CV): string {
    const lines: string[] = [];

    if (cv.name) {
        lines.push(`= ${cv.name}`);
    }
    if (cv.headline) {
        lines.push(`#headline([${cv.headline}])`);
    }

    // Extract linkedin/github from social_networks array if present
    let linkedin = cv.linkedin;
    let github = cv.github;
    if (cv.social_networks && Array.isArray(cv.social_networks)) {
        for (const sn of cv.social_networks) {
            const network = (sn.network || '').toLowerCase();
            const username = sn.username || sn.name;
            if (!username) continue;
            if (network === 'linkedin') linkedin = linkedin || username;
            else if (network === 'github') github = github || username;
        }
    }

    const connections: string[] = [];
    if (cv.location) connections.push(`[${cv.location}]`);
    if (cv.email) connections.push(`[#link("mailto:${cv.email}")[${escapeTypst(cv.email)}]]`);
    if (cv.phone) connections.push(`[${cv.phone}]`);
    if (cv.website) connections.push(`[#link("${cv.website}")[${cv.website.replace('https://', '')}]]`);
    if (linkedin) connections.push(`[#link("https://linkedin.com/in/${linkedin}")[linkedin.com/in/${linkedin}]]`);
    if (github) connections.push(`[#link("https://github.com/${github}")[github.com/${github}]]`);

    if (connections.length > 0) {
        lines.push(`#connections(\n  ${connections.join(',\n  ')},\n)`);
    }

    return lines.join('\n');
}

// ──────────────────────────────────────────
// Markdown → Typst conversion
// (Replicates Python markdown_parser.py)
// ──────────────────────────────────────────

/**
 * Convert markdown bold/italic to Typst markup.
 * **text** → #strong[text]
 * *text*  → #emph[text]
 * [text](url) → #link("url")[text]
 * 
 * This must be applied AFTER placeholder substitution, just like
 * Python's process_model applies markdown_to_typst to all entry fields.
 */
function markdownToTypst(text: string): string {
    // Process markdown links: [text](url) → #link("url")[text]
    let result = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '#link("$2")[$1]');

    // Process bold: **text** → #strong[text] (must be before italic)
    result = result.replace(/\*\*([^*]+)\*\*/g, '#strong[$1]');

    // Process italic: *text* → #emph[text]
    result = result.replace(/\*([^*]+)\*/g, '#emph[$1]');

    return result;
}

// ──────────────────────────────────────────
// Template-based entry generation
// (Replicates Python entry_templates_from_input.py)
// ──────────────────────────────────────────

import type { ThemeTemplates } from './themeRegistry';

/**
 * Process highlights list into markdown bullet format.
 * Replicates Python's process_highlights().
 */
function processHighlights(highlights: string[]): string {
    if (!highlights || highlights.length === 0) return '';
    return highlights
        .map((h: string) => '- ' + h.replace(' - ', '\n  - '))
        .join('\n');
}

/**
 * Remove placeholders that have no corresponding value.
 * Removes the placeholder AND surrounding non-alphanumeric characters
 * (commas, dashes, etc.) to avoid dangling punctuation.
 * Replicates Python's remove_not_provided_placeholders().
 */
function removeNotProvidedPlaceholders(template: string, fields: Record<string, string>): string {
    // Find all uppercase-word placeholders in the template
    const placeholderPattern = /\b[A-Z_]+\b/g;
    const usedPlaceholders = new Set(template.match(placeholderPattern) || []);
    const notProvided = [...usedPlaceholders].filter(p => !(p in fields));

    if (notProvided.length === 0) return template;

    // Remove not-provided placeholders and surrounding non-alpha chars
    const removePattern = new RegExp(
        '\\S*(?:' + notProvided.join('|') + ')\\S*',
        'g'
    );

    // Process line by line to clean up trailing junk
    const lines = template.replace(removePattern, '').split('\n');
    const cleaned: string[] = [];
    for (const line of lines) {
        let trimmed = line.trimEnd();
        if (trimmed === '') continue;
        // Remove trailing non-alphanumeric chars (except markdown formatting)
        trimmed = trimmed.replace(/[^A-Za-z0-9.!?\[\]()*_%]+$/, '');
        if (trimmed) cleaned.push(trimmed);
    }
    return cleaned.join('\n');
}

/**
 * Substitute uppercase placeholders in a template with actual values.
 * Replicates Python's substitute_placeholders().
 */
function substituteTemplate(template: string, fields: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(fields)) {
        // Replace all occurrences of the placeholder
        result = result.split(key).join(value);
    }
    return result;
}

/**
 * Build the fields dictionary from an entry object.
 * Mirrors how Python builds entry_fields from entry.model_dump().
 */
function buildFields(entry: any): Record<string, string> {
    const fields: Record<string, string> = {};

    // Map all entry properties to uppercase keys (like Python does)
    if (entry.company) fields['COMPANY'] = entry.company;
    if (entry.position) fields['POSITION'] = entry.position;
    if (entry.location) fields['LOCATION'] = entry.location;
    if (entry.date) fields['DATE'] = entry.date;
    if (entry.institution) fields['INSTITUTION'] = entry.institution;
    if (entry.area) fields['AREA'] = entry.area;
    if (entry.degree) fields['DEGREE'] = entry.degree;
    if (entry.name) fields['NAME'] = entry.name;
    if (entry.label) fields['LABEL'] = entry.label;
    if (entry.details || entry.detail) fields['DETAILS'] = entry.details || entry.detail;
    if (entry.summary) fields['SUMMARY'] = entry.summary;
    if (entry.url) fields['URL'] = `[${entry.url.replace('https://', '').replace('http://', '')}](${entry.url})`;

    // DEGREE_WITH_AREA is a locale phrase: "DEGREE in AREA"
    // We pre-expand it here so both DEGREE and AREA get substituted later
    if (entry.degree && entry.area) {
        fields['DEGREE_WITH_AREA'] = `${entry.degree} in ${entry.area}`;
    } else if (entry.degree) {
        fields['DEGREE_WITH_AREA'] = entry.degree;
    } else if (entry.area) {
        fields['DEGREE_WITH_AREA'] = entry.area;
    }

    // Process highlights into markdown list
    if (entry.highlights && entry.highlights.length > 0) {
        fields['HIGHLIGHTS'] = processHighlights(entry.highlights);
    }

    return fields;
}

/**
 * Generate a Typst #regular-entry() or #education-entry() call from
 * template strings and entry data.
 *
 * This replicates the Jinja2 ExperienceEntry.j2.typ / EducationEntry.j2.typ
 * / NormalEntry.j2.typ templates exactly.
 */
function generateTemplatedEntry(
    entry: any,
    mainColumnTemplate: string,
    dateLocationTemplate: string,
    typstFunction: string,
    degreeColumnTemplate?: string | null,
): string {
    const fields = buildFields(entry);

    // Step 1: Remove not-provided placeholders (like Python does)
    let mainTpl = removeNotProvidedPlaceholders(mainColumnTemplate, fields);
    let dateTpl = removeNotProvidedPlaceholders(dateLocationTemplate, fields);

    // Step 2: Substitute placeholders with actual values
    const mainColumnRaw = substituteTemplate(mainTpl, fields);
    const dateLocationRaw = substituteTemplate(dateTpl, fields);

    // Step 2.5: Convert markdown to Typst (like Python's process_model does)
    const mainColumnResult = markdownToTypst(mainColumnRaw);
    const dateLocationResult = markdownToTypst(dateLocationRaw);

    // Step 3: Split main_column by newlines for first-row / second-row logic
    // (Replicates the Jinja2 template's first_row_lines logic)
    const mainLines = mainColumnResult.split('\n').filter(l => l.trim() !== '');
    const dateLines = dateLocationResult.split('\n').filter(l => l.trim() !== '');

    // For short_second_row=false (all our themes): first_row_lines = dateLines.length
    // But if dateLines is empty, first_row_lines = 1
    const firstRowLines = dateLines.length > 0 ? dateLines.length : 1;

    const firstRowContent = mainLines.slice(0, firstRowLines).map(l => `    ${l}`).join('\n\n');
    const secondRowContent = mainLines.slice(firstRowLines).map(l => `    ${l}`).join('\n\n');
    const dateContent = dateLines.map(l => `    ${l}`).join('\n\n');

    const parts: string[] = [`#${typstFunction}(`];
    parts.push(`  [`);
    if (firstRowContent) parts.push(firstRowContent);
    parts.push(`  ],`);
    parts.push(`  [`);
    if (dateContent) parts.push(dateContent);
    parts.push(`  ],`);

    // Degree column (only for education-entry when defined)
    if (typstFunction === 'education-entry' && degreeColumnTemplate !== undefined && degreeColumnTemplate !== null) {
        const degTpl = removeNotProvidedPlaceholders(degreeColumnTemplate, fields);
        const degResult = markdownToTypst(substituteTemplate(degTpl, fields));
        if (degResult.trim()) {
            parts.push(`  degree-column: [`);
            parts.push(`    ${degResult}`);
            parts.push(`  ],`);
        }
    }

    // Second row (highlights, summary, etc.)
    if (secondRowContent) {
        parts.push(`  main-column-second-row: [`);
        parts.push(secondRowContent);
        parts.push(`  ],`);
    }

    parts.push(`)`);
    return parts.join('\n');
}

function generateOneLineEntry(entry: any, template: string): string {
    const fields = buildFields(entry);
    const tpl = removeNotProvidedPlaceholders(template, fields);
    const result = markdownToTypst(substituteTemplate(tpl, fields));
    return `#block(above: 0.15cm, below: 0.15cm)[${result}]`;
}

function generateBulletEntry(entry: any): string {
    if (typeof entry === 'string') {
        return `- ${entry}`;
    }
    return `- ${entry.text || entry.bullet || JSON.stringify(entry)}`;
}

function detectEntryType(entry: any): string {
    if (typeof entry === 'string') return 'bullet';
    if (entry.company || entry.position) return 'experience';
    if (entry.institution || entry.area) return 'education';
    if (entry.label && entry.details) return 'oneline';
    if (entry.name) return 'normal';
    return 'bullet';
}

function generateEntry(entry: any, templates: ThemeTemplates): string {
    const type = detectEntryType(entry);
    switch (type) {
        case 'experience':
            return generateTemplatedEntry(
                entry,
                templates.experience_entry.main_column,
                templates.experience_entry.date_and_location_column,
                'regular-entry',
            );
        case 'education':
            return generateTemplatedEntry(
                entry,
                templates.education_entry.main_column,
                templates.education_entry.date_and_location_column,
                'education-entry',
                templates.education_entry.degree_column,
            );
        case 'normal':
            return generateTemplatedEntry(
                entry,
                templates.normal_entry.main_column,
                templates.normal_entry.date_and_location_column,
                'regular-entry',
            );
        case 'oneline':
            return generateOneLineEntry(entry, templates.one_line_entry.main_column);
        case 'bullet':
            return generateBulletEntry(entry);
        default:
            return '';
    }
}

// ──────────────────────────────────────────
// Main API
// ──────────────────────────────────────────

export async function generateTypstSource(yamlString: string): Promise<string> {
    let data: RenderCVData;
    try {
        const doc = yaml.load(yamlString);
        if (!doc || typeof doc !== 'object') {
            throw new Error('Invalid YAML format');
        }
        // Normalize keys to English (handles Spanish YAML keys transparently)
        data = normalizeToEnglish(doc) as RenderCVData;
    } catch (e: any) {
        if (e.mark) {
            throw new Error(`YAML L${e.mark.line + 1}: ${e.reason}`);
        }
        throw new Error(`YAML Parse Error: ${e.message}`);
    }

    if (!data.cv) {
        throw new Error('YAML must contain a "cv" object');
    }

    const cv = data.cv;
    const design = data.design || {};
    const locale = data.locale || { language: 'english' };
    const themeName = design.theme || 'classic';
    const td = getThemeDefaults(themeName);

    // Get the lib.typ content (inlined, with fontawesome stubbed)
    const libTyp = await getLibTyp();

    // Build the Typst source
    const parts: string[] = [];

    // 1. Inline library (replaces #import "@preview/rendercv:0.2.0": *)
    parts.push(libTyp);
    parts.push('');

    // 2. Preamble
    parts.push(generatePreamble(cv, design, locale));
    parts.push('');

    // 3. Header
    parts.push(generateHeader(cv));
    parts.push('');

    // 4. Sections
    if (cv.sections) {
        const templates = td.templates;
        for (const [sectionTitle, entries] of Object.entries(cv.sections)) {
            parts.push(`== ${sectionTitle}`);
            parts.push('');
            if (Array.isArray(entries)) {
                for (const entry of entries) {
                    parts.push(generateEntry(entry, templates));
                    parts.push('');
                }
            }
        }
    }

    return parts.join('\n');
}
