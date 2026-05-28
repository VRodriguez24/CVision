/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#fbf9fa',
          dim: '#dbd9da',
          bright: '#fbf9fa',
          variant: '#e4e2e3',
          tint: '#4e616e',
          container: {
            lowest: '#ffffff',
            low: '#f5f3f4',
            DEFAULT: '#efedee',
            high: '#e9e8e8',
            highest: '#e4e2e3',
          },
        },
        background: '#fbf9fa',
        outline: {
          DEFAULT: '#73787c',
          variant: '#c3c7cb',
        },
        primary: {
          DEFAULT: '#000306',
          container: '#0b1f2a',
          fixed: '#d1e5f5',
          'fixed-dim': '#b5c9d8',
        },
        secondary: {
          DEFAULT: '#416182',
          container: '#b7d7fe',
          fixed: '#d0e4ff',
          'fixed-dim': '#a9c9ef',
        },
        tertiary: {
          DEFAULT: '#080200',
          container: '#2c1907',
          fixed: '#ffdcc1',
          'fixed-dim': '#e3c0a4',
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
        on: {
          surface: '#1b1c1c',
          'surface-variant': '#43474b',
          primary: '#ffffff',
          'primary-container': '#748895',
          secondary: '#ffffff',
          'secondary-container': '#3e5e7f',
          tertiary: '#ffffff',
          'tertiary-container': '#9e7f66',
          error: '#ffffff',
          'error-container': '#93000a',
          background: '#1b1c1c',
          'primary-fixed': '#091e29',
          'primary-fixed-variant': '#364955',
          'secondary-fixed': '#001d34',
          'secondary-fixed-variant': '#294969',
          'tertiary-fixed': '#2a1706',
          'tertiary-fixed-variant': '#5a422c',
        },
        inverse: {
          surface: '#303031',
          'on-surface': '#f2f0f1',
          primary: '#b5c9d8',
        },
        field: {
          border: '#CBD5E1',
        },
        card: {
          border: '#E2E8F0',
        },
        chip: {
          DEFAULT: '#F1F5F9',
        },
        ai: {
          accent: '#A5D8FF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Geist', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display: ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
        'headline-lg': ['32px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-lg-mobile': ['28px', { lineHeight: '1.2', fontWeight: '600' }],
        'headline-md': ['24px', { lineHeight: '1.3', fontWeight: '500' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'label-md': ['14px', { lineHeight: '1', letterSpacing: '0.02em', fontWeight: '500' }],
        'label-sm': ['12px', { lineHeight: '1', fontWeight: '600' }],
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
      },
      spacing: {
        gutter: '24px',
        'margin-desktop': '40px',
        'margin-mobile': '16px',
      },
      maxWidth: {
        container: '1280px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(11, 31, 42, 0.05)',
        modal: '0 10px 15px -3px rgba(11, 31, 42, 0.1)',
        focus: '0 0 0 3px rgba(165, 216, 255, 0.45)',
      },
    },
  },
  plugins: [],
};
