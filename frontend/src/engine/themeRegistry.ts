// Código obtenido de https://github.com/kirlts/YaCV. Todos los créditos al autor.

// ──────────────────────────────────────────
// Entry template definitions (per-theme)
// ──────────────────────────────────────────

export interface EntryTemplate {
    main_column: string;
    date_and_location_column: string;
    degree_column?: string | null;
}

export interface ThemeTemplates {
    experience_entry: EntryTemplate;
    education_entry: EntryTemplate;
    normal_entry: EntryTemplate;
    one_line_entry: { main_column: string };
}

// ──────────────────────────────────────────
// Theme defaults interface
// ──────────────────────────────────────────

export interface ThemeDefaults {
    colors: {
        body: string;
        name: string;
        headline: string;
        connections: string;
        section_titles: string;
        links: string;
        footer: string;
        top_note: string;
    };
    typography: {
        font_family: string;
        font_size: {
            body: string;
            name: string;
            headline: string;
            connections: string;
            section_titles: string;
        };
        line_spacing: string;
        alignment: string;
        bold: {
            name: boolean;
            headline: boolean;
            connections: boolean;
            section_titles: boolean;
        };
        small_caps: {
            name: boolean;
            headline: boolean;
            connections: boolean;
            section_titles: boolean;
        };
    };
    page: {
        size: string;
        top_margin: string;
        bottom_margin: string;
        left_margin: string;
        right_margin: string;
        show_footer: boolean;
        show_top_note: boolean;
    };
    header: {
        alignment: string;
        connections: {
            hyperlink: boolean;
            show_icons: boolean;
            display_urls_instead_of_usernames: boolean;
            separator: string;
        };
    };
    links: {
        underline: boolean;
        show_external_link_icon: boolean;
    };
    section_titles: {
        type: string;
        line_thickness: string;
        space_above: string;
        space_below: string;
    };
    entries: {
        date_and_location_width: string;
        side_space: string;
        space_between_columns: string;
        short_second_row: boolean;
        highlights_bullet: string;
        highlights_nested_bullet: string;
        highlights_space_left: string;
        highlights_space_above: string;
        highlights_space_between_items: string;
        highlights_space_between_bullet_and_text: string;
    };
    sections: {
        space_between_regular_entries: string;
        space_between_text_based_entries: string;
    };
    templates: ThemeTemplates;
}

// ──────────────────────────────────────────
// Classic defaults (Python classic_theme.py)
// ──────────────────────────────────────────

const CLASSIC_TEMPLATES: ThemeTemplates = {
    experience_entry: {
        main_column: '**COMPANY**, POSITION\nSUMMARY\nHIGHLIGHTS',
        date_and_location_column: 'LOCATION\nDATE',
    },
    education_entry: {
        main_column: '**INSTITUTION**, AREA\nSUMMARY\nHIGHLIGHTS',
        date_and_location_column: 'LOCATION\nDATE',
        degree_column: '**DEGREE**',
    },
    normal_entry: {
        main_column: '**NAME**\nSUMMARY\nHIGHLIGHTS',
        date_and_location_column: 'LOCATION\nDATE',
    },
    one_line_entry: {
        main_column: '**LABEL:** DETAILS',
    },
};

const BASE_DEFAULTS: ThemeDefaults = {
    colors: {
        body: 'rgb(0, 0, 0)',
        name: 'rgb(0, 79, 144)',
        headline: 'rgb(0, 79, 144)',
        connections: 'rgb(0, 0, 0)',
        section_titles: 'rgb(0, 79, 144)',
        links: 'rgb(0, 79, 144)',
        footer: 'rgb(128, 128, 128)',
        top_note: 'rgb(128, 128, 128)',
    },
    typography: {
        font_family: 'Source Sans 3',
        font_size: { body: '10pt', name: '30pt', headline: '10pt', connections: '10pt', section_titles: '1.4em' },
        line_spacing: '0.6em',
        alignment: 'justified',
        bold: { name: false, headline: false, connections: false, section_titles: false },
        small_caps: { name: false, headline: false, connections: false, section_titles: false },
    },
    page: {
        size: 'us-letter',
        top_margin: '0.7in',
        bottom_margin: '0.7in',
        left_margin: '0.7in',
        right_margin: '0.7in',
        show_footer: false,
        show_top_note: false,
    },
    header: {
        alignment: 'left',
        connections: {
            hyperlink: true,
            show_icons: true,
            display_urls_instead_of_usernames: false,
            separator: '',
        },
    },
    links: {
        underline: false,
        show_external_link_icon: false,
    },
    section_titles: {
        type: 'with_full_line',
        line_thickness: '0.5pt',
        space_above: '0.5cm',
        space_below: '0.3cm',
    },
    entries: {
        date_and_location_width: '4.15cm',
        side_space: '0.2cm',
        space_between_columns: '0.1cm',
        short_second_row: false,
        highlights_bullet: '•',
        highlights_nested_bullet: '•',
        highlights_space_left: '0cm',
        highlights_space_above: '0.12cm',
        highlights_space_between_items: '0.12cm',
        highlights_space_between_bullet_and_text: '0.5em',
    },
    sections: {
        space_between_regular_entries: '1.2em',
        space_between_text_based_entries: '0.3em',
    },
    templates: CLASSIC_TEMPLATES,
};

// ──────────────────────────────────────────
// Merge utility
// ──────────────────────────────────────────

function mergeDefaults(overrides: Record<string, any>): ThemeDefaults {
    return {
        colors: { ...BASE_DEFAULTS.colors, ...overrides.colors },
        typography: {
            ...BASE_DEFAULTS.typography,
            ...overrides.typography,
            font_size: { ...BASE_DEFAULTS.typography.font_size, ...(overrides.typography?.font_size || {}) },
            bold: { ...BASE_DEFAULTS.typography.bold, ...(overrides.typography?.bold || {}) },
            small_caps: { ...BASE_DEFAULTS.typography.small_caps, ...(overrides.typography?.small_caps || {}) },
        },
        page: { ...BASE_DEFAULTS.page, ...overrides.page },
        header: {
            ...BASE_DEFAULTS.header,
            ...overrides.header,
            connections: { ...BASE_DEFAULTS.header.connections, ...(overrides.header?.connections || {}) },
        },
        links: { ...BASE_DEFAULTS.links, ...overrides.links },
        section_titles: { ...BASE_DEFAULTS.section_titles, ...overrides.section_titles },
        entries: { ...BASE_DEFAULTS.entries, ...overrides.entries },
        sections: { ...BASE_DEFAULTS.sections, ...overrides.sections },
        templates: overrides.templates || CLASSIC_TEMPLATES,
    };
}

// ──────────────────────────────────────────
// Shared template sets for theme families
// ──────────────────────────────────────────

// engineeringclassic, engineeringresumes, moderncv all share these templates
const ENGINEERING_TEMPLATES: ThemeTemplates = {
    experience_entry: {
        main_column: '**POSITION**, COMPANY -- LOCATION\nSUMMARY\nHIGHLIGHTS',
        date_and_location_column: 'DATE',
    },
    education_entry: {
        main_column: '**INSTITUTION**, DEGREE_WITH_AREA -- LOCATION\nSUMMARY\nHIGHLIGHTS',
        date_and_location_column: 'DATE',
        degree_column: null,
    },
    normal_entry: {
        main_column: '**NAME** -- **LOCATION**\nSUMMARY\nHIGHLIGHTS',
        date_and_location_column: 'DATE',
    },
    one_line_entry: {
        main_column: '**LABEL:** DETAILS',
    },
};

const MART_TEMPLATES: ThemeTemplates = {
    experience_entry: {
        main_column: '**POSITION**\n*COMPANY*\nSUMMARY\nHIGHLIGHTS',
        date_and_location_column: '*LOCATION*\n*DATE*',
    },
    education_entry: {
        main_column: '**INSTITUTION**, AREA\nSUMMARY\nHIGHLIGHTS',
        date_and_location_column: '*LOCATION*\n*DATE*',
        degree_column: null,
    },
    normal_entry: {
        main_column: '**NAME**\nSUMMARY\nHIGHLIGHTS',
        date_and_location_column: '*LOCATION*\n*DATE*',
    },
    one_line_entry: {
        main_column: '**LABEL:** DETAILS',
    },
};

// ──────────────────────────────────────────
// Per-theme definitions (from Python YAML files)
// ──────────────────────────────────────────

export const themes: Record<string, ThemeDefaults> = {
    // Classic: Python classic_theme.py defaults
    classic: mergeDefaults({
        header: {
            alignment: 'left',
            connections: { hyperlink: true, show_icons: true, display_urls_instead_of_usernames: false, separator: '' },
        },
        templates: CLASSIC_TEMPLATES,
    }),

    // engineeringclassic.yaml
    engineeringclassic: mergeDefaults({
        typography: {
            font_family: 'Raleway',
            bold: { name: false, headline: false, connections: false, section_titles: false },
        },
        header: {
            alignment: 'left',
        },
        links: { underline: false, show_external_link_icon: false },
        section_titles: {
            type: 'with_full_line',
        },
        entries: {
            short_second_row: false,
            highlights_space_left: '0cm',
            highlights_space_above: '0.12cm',
            highlights_space_between_items: '0.12cm',
        },
        templates: ENGINEERING_TEMPLATES,
    }),

    // engineeringresumes.yaml
    engineeringresumes: mergeDefaults({
        page: { show_footer: false },
        colors: {
            name: 'rgb(0, 0, 0)',
            connections: 'rgb(0, 0, 0)',
            headline: 'rgb(0, 0, 0)',
            section_titles: 'rgb(0, 0, 0)',
            links: 'rgb(0, 0, 0)',
        },
        typography: {
            font_family: 'XCharter',
            font_size: { name: '25pt', section_titles: '1.2em' },
            bold: { name: false, headline: false, connections: false, section_titles: false },
        },
        header: {
            connections: { separator: '|', show_icons: false, display_urls_instead_of_usernames: true },
        },
        links: { underline: true, show_external_link_icon: false },
        section_titles: {
            type: 'with_full_line',
            space_above: '0.5cm',
            space_below: '0.3cm',
        },
        sections: {
            space_between_regular_entries: '0.42cm',
            space_between_text_based_entries: '0.15cm',
        },
        entries: {
            short_second_row: false,
            side_space: '0cm',
            highlights_space_left: '0cm',
            highlights_space_above: '0.08cm',
            highlights_space_between_items: '0.08cm',
            highlights_space_between_bullet_and_text: '0.3em',
        },
        templates: ENGINEERING_TEMPLATES,
    }),

    // moderncv.yaml
    moderncv: mergeDefaults({
        colors: {
            name: 'rgb(0, 79, 144)',
            headline: 'rgb(0, 79, 144)',
            section_titles: 'rgb(0, 79, 144)',
            links: 'rgb(0, 79, 144)',
        },
        typography: {
            font_family: 'Source Sans 3',
            line_spacing: '0.6em',
            font_size: { name: '25pt', section_titles: '1.4em' },
            bold: { name: false, headline: false, connections: false, section_titles: false },
        },
        header: {
            alignment: 'left',
            connections: { separator: '', show_icons: true, display_urls_instead_of_usernames: false, hyperlink: true },
        },
        links: { underline: true, show_external_link_icon: false },
        section_titles: {
            type: 'moderncv',
            space_above: '0.55cm',
            space_below: '0.3cm',
            line_thickness: '0.15cm',
        },
        entries: {
            short_second_row: false,
            side_space: '0cm',
            space_between_columns: '0.3cm',
            highlights_space_left: '0cm',
            highlights_space_above: '0.15cm',
            highlights_space_between_items: '0.1cm',
            highlights_space_between_bullet_and_text: '0.3em',
        },
        templates: ENGINEERING_TEMPLATES,
    }),

    // mart.yaml
    mart: mergeDefaults({
        colors: {
            name: '#004F90',
            connections: 'rgb(0, 0, 0)',
            headline: 'rgb(0, 0, 0)',
            section_titles: '#004F90',
            links: '#004F90',
        },
        typography: {
            font_family: 'Lato',
            font_size: { body: '8pt', name: '30pt', headline: '14pt', connections: '9pt', section_titles: '12pt' },
            line_spacing: '0.2cm',
        },
        header: {
            connections: { hyperlink: true, show_icons: false, display_urls_instead_of_usernames: true, separator: '•' },
        },
        links: { underline: true, show_external_link_icon: false },
        section_titles: {
            type: 'with_full_line',
            space_above: '0.3cm',
            space_below: '0.2cm',
        },
        entries: {
            short_second_row: false,
            highlights_bullet: '◦',
            highlights_nested_bullet: '◦',
        },
        sections: {
            space_between_regular_entries: '0.3cm',
        },
        templates: MART_TEMPLATES,
    }),
};

// Available fonts bundled in public/fonts/
export const availableFonts = [
    'Source Sans 3',
    'Lato',
    'Roboto',
    'Fira Sans',
    'Montserrat',
    'Open Sans',
    'Raleway',
];

// Human-friendly display names for themes
export const themeDisplayNames: Record<string, string> = {
    classic: 'Classic',
    engineeringclassic: 'Engineeringclassic',
    engineeringresumes: 'Engineeringresumes',
    mart: 'Mart',
    moderncv: 'Moderncv',
};

export function getThemeDefaults(themeName: string): ThemeDefaults {
    return themes[themeName] || themes['classic'];
}
