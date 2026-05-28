import type { CvFormData } from '../../types/cvForm.js';

export const initialFormData: CvFormData = {
  language: 'spanish',
  basics: {
    name: 'Ada Lovelace',
    headline: 'Software Engineer',
    location: 'Santiago, Chile',
    email: 'ada@example.com',
    phone: '+56 9 1234 5678',
    website: '',
    linkedin: 'ada-lovelace',
    github: '',
  },
  socialsExtra: [
    {
      network: 'X',
      username: '@ada',
      url: 'https://x.com/ada',
    },
  ],
  sections: {
    experience: [
      {
        company: 'Analytical Engines SPA',
        position: 'Frontend Developer',
        location: 'Remote',
        date: '2024 - Presente',
        summary: 'Desarrollo de interfaces React y mejoras de rendimiento.',
        highlights: 'Implementé diseño responsive\nReduje tiempos de carga en 35%',
      },
    ],
    personalProjects: [
      {
        name: 'CVision',
        detail: 'Herramienta para construir CVs y renderizarlos a PDF con Typst.',
        date: '2025',
        highlights: 'Diseñé la arquitectura del frontend\nIntegré previsualización en vivo',
      },
    ],
    skills: [
      {
        label: 'Frontend',
        details: 'React, TypeScript, TailwindCSS',
      },
      {
        label: 'Backend',
        details: 'Node.js, Express, PostgreSQL',
      },
    ],
    education: [
      {
        institution: 'Universidad de Chile',
        area: 'Ingeniería Civil en Computación',
        degree: 'Licenciatura',
        location: 'Santiago',
        date: '2018 - 2023',
        summary: 'Enfoque en sistemas distribuidos y experiencia de usuario.',
      },
    ],
  },
  design: {
    theme: 'mart',
    typography: {
      font_family: 'Lato',
      font_size: {
        body: '10pt',
        name: '30pt',
        headline: '12pt',
      },
      line_spacing: '0.4cm',
    },
    colors: {
      body: '#000000',
      name: '#004F90',
      section_titles: '#004F90',
      links: '#004F90',
    },
    sections: {
      space_between_regular_entries: '0.3cm',
      space_between_text_based_entries: '0.2cm',
    },
  },
};
