import { useEffect, useRef, useState } from 'react';
import type { CvEducationItem, CvExperienceItem, CvFormData, CvLanguage, CvPersonalProjectItem, CvSkillItem, CvTheme } from '../../types/cvForm.js';
import { availableFonts } from '../../engine/themeRegistry.js';

interface FormPanelProps {
  value: CvFormData;
  onChange: React.Dispatch<React.SetStateAction<CvFormData>>;
  cvTitle?: string | null;
  onImproveField?: (request: ImproveFieldRequest) => void;
  improvingFieldPath?: string | null;
}

export interface ImproveFieldRequest {
  fieldPath: string;
  fieldLabel: string;
  text: string;
  selectionStart: number | null;
  selectionEnd: number | null;
}

const THEME_OPTIONS: Array<{ label: string; value: CvTheme }> = [
  { label: 'Mart', value: 'mart' },
  { label: 'ModernCV', value: 'moderncv' },
];
const LANGUAGE_OPTIONS: Array<{ label: string; value: CvLanguage }> = [
  { label: 'Español', value: 'spanish' },
  { label: 'English', value: 'english' },
];

const FONT_SIZE_OPTIONS = ['8pt', '9pt', '10pt', '11pt', '12pt', '14pt', '16pt', '18pt', '20pt', '25pt', '30pt'];
const LINE_SPACING_OPTIONS = ['0.2cm', '0.3cm', '0.4cm', '0.5cm', '0.6cm', '0.7cm'];
const REGULAR_ENTRY_SPACING_OPTIONS = ['0.2cm', '0.3cm', '0.4cm', '0.5cm', '0.6cm', '1.0em'];
const TEXT_ENTRY_SPACING_OPTIONS = ['0.1cm', '0.15cm', '0.2cm', '0.25cm', '0.3cm'];

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded border border-zinc-200 bg-white p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-600">{title}</h3>
      {children}
    </section>
  );
}

function SectionItemCard({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2 rounded border border-zinc-200 bg-zinc-50 p-3">{children}</div>;
}

function ImproveButton({ disabled, isLoading, onClick }: { disabled: boolean; isLoading: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="shrink-0 rounded border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? 'Mejorando...' : 'Mejorar con IA'}
    </button>
  );
}

function AiTextArea({
  className,
  fieldLabel,
  fieldPath,
  improvingFieldPath,
  onChange,
  onImproveField,
  placeholder,
  rows,
  value,
}: {
  className: string;
  fieldLabel: string;
  fieldPath: string;
  improvingFieldPath?: string | null;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  onImproveField?: (request: ImproveFieldRequest) => void;
  placeholder: string;
  rows: number;
  value: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isLoading = improvingFieldPath === fieldPath;

  const handleImprove = () => {
    const element = textareaRef.current;
    onImproveField?.({
      fieldPath,
      fieldLabel,
      text: value,
      selectionStart: element?.selectionStart ?? null,
      selectionEnd: element?.selectionEnd ?? null,
    });
  };

  if (!onImproveField) {
    return <textarea className={className} rows={rows} placeholder={placeholder} value={value} onChange={onChange} />;
  }

  return (
    <div className="space-y-2">
      <textarea ref={textareaRef} className={className} rows={rows} placeholder={placeholder} value={value} onChange={onChange} />
      <div className="flex justify-end">
        <ImproveButton disabled={isLoading || !value.trim()} isLoading={isLoading} onClick={handleImprove} />
      </div>
    </div>
  );
}

export function FormPanel({ value, onChange, cvTitle, onImproveField, improvingFieldPath }: FormPanelProps) {
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isStylePopoverOpen, setIsStylePopoverOpen] = useState(false);
  const resolvedCvTitle = cvTitle?.trim() || 'Nuevo CV';

  const themeRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (themeRef.current && !themeRef.current.contains(target)) {
        setIsThemeMenuOpen(false);
      }
      if (languageRef.current && !languageRef.current.contains(target)) {
        setIsLanguageMenuOpen(false);
      }
      if (styleRef.current && !styleRef.current.contains(target)) {
        setIsStylePopoverOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const setBasicField = (key: keyof CvFormData['basics']) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const fieldValue = event.target.value;
    onChange((prev) => ({
      ...prev,
      basics: {
        ...prev.basics,
        [key]: fieldValue,
      },
    }));
  };

  const setDesignField = <K extends keyof CvFormData['design']>(key: K, fieldValue: CvFormData['design'][K]) => {
    onChange((prev) => ({
      ...prev,
      design: {
        ...prev.design,
        [key]: fieldValue,
      },
    }));
  };

  const setLanguage = (language: CvLanguage) => {
    onChange((prev) => ({
      ...prev,
      language,
    }));
  };

  const setDesignTypographyField = <K extends keyof CvFormData['design']['typography']>(
    key: K,
    fieldValue: CvFormData['design']['typography'][K],
  ) => {
    onChange((prev) => ({
      ...prev,
      design: {
        ...prev.design,
        typography: {
          ...prev.design.typography,
          [key]: fieldValue,
        },
      },
    }));
  };

  const setDesignFontSizeField = (key: keyof CvFormData['design']['typography']['font_size'], fieldValue: string) => {
    onChange((prev) => ({
      ...prev,
      design: {
        ...prev.design,
        typography: {
          ...prev.design.typography,
          font_size: {
            ...prev.design.typography.font_size,
            [key]: fieldValue,
          },
        },
      },
    }));
  };

  const setDesignColorField = (key: keyof CvFormData['design']['colors'], fieldValue: string) => {
    onChange((prev) => ({
      ...prev,
      design: {
        ...prev.design,
        colors: {
          ...prev.design.colors,
          [key]: fieldValue,
        },
      },
    }));
  };

  const setDesignSectionsField = (key: keyof CvFormData['design']['sections'], fieldValue: string) => {
    onChange((prev) => ({
      ...prev,
      design: {
        ...prev.design,
        sections: {
          ...prev.design.sections,
          [key]: fieldValue,
        },
      },
    }));
  };

  const setSocialField = (index: number, key: keyof CvFormData['socialsExtra'][number]) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const fieldValue = event.target.value;
    onChange((prev) => {
      const socialsExtra = [...prev.socialsExtra];
      socialsExtra[index] = {
        ...socialsExtra[index],
        [key]: fieldValue,
      };
      return {
        ...prev,
        socialsExtra,
      };
    });
  };

  const addSocial = () => {
    onChange((prev) => ({
      ...prev,
      socialsExtra: [...prev.socialsExtra, { network: '', username: '', url: '' }],
    }));
  };

  const removeSocial = (index: number) => {
    onChange((prev) => ({
      ...prev,
      socialsExtra: prev.socialsExtra.filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const setExperienceField = (index: number, key: keyof CvExperienceItem) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const fieldValue = event.target.value;
    onChange((prev) => {
      const experience = [...prev.sections.experience];
      experience[index] = {
        ...experience[index],
        [key]: fieldValue,
      };
      return {
        ...prev,
        sections: {
          ...prev.sections,
          experience,
        },
      };
    });
  };

  const addExperience = () => {
    onChange((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        experience: [
          ...prev.sections.experience,
          {
            company: '',
            position: '',
            location: '',
            date: '',
            summary: '',
            highlights: '',
          },
        ],
      },
    }));
  };

  const removeExperience = (index: number) => {
    onChange((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        experience: prev.sections.experience.filter((_, currentIndex) => currentIndex !== index),
      },
    }));
  };

  const setProjectField = (index: number, key: keyof CvPersonalProjectItem) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const fieldValue = event.target.value;
    onChange((prev) => {
      const personalProjects = [...prev.sections.personalProjects];
      personalProjects[index] = {
        ...personalProjects[index],
        [key]: fieldValue,
      };
      return {
        ...prev,
        sections: {
          ...prev.sections,
          personalProjects,
        },
      };
    });
  };

  const addProject = () => {
    onChange((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        personalProjects: [
          ...prev.sections.personalProjects,
          {
            name: '',
            detail: '',
            date: '',
            highlights: '',
          },
        ],
      },
    }));
  };

  const removeProject = (index: number) => {
    onChange((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        personalProjects: prev.sections.personalProjects.filter((_, currentIndex) => currentIndex !== index),
      },
    }));
  };

  const setSkillField = (index: number, key: keyof CvSkillItem) => (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const fieldValue = event.target.value;
    onChange((prev) => {
      const skills = [...prev.sections.skills];
      skills[index] = {
        ...skills[index],
        [key]: fieldValue,
      };
      return {
        ...prev,
        sections: {
          ...prev.sections,
          skills,
        },
      };
    });
  };

  const addSkill = () => {
    onChange((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        skills: [...prev.sections.skills, { label: '', details: '' }],
      },
    }));
  };

  const removeSkill = (index: number) => {
    onChange((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        skills: prev.sections.skills.filter((_, currentIndex) => currentIndex !== index),
      },
    }));
  };

  const setEducationField = (index: number, key: keyof CvEducationItem) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const fieldValue = event.target.value;
    onChange((prev) => {
      const education = [...prev.sections.education];
      education[index] = {
        ...education[index],
        [key]: fieldValue,
      };
      return {
        ...prev,
        sections: {
          ...prev.sections,
          education,
        },
      };
    });
  };

  const addEducation = () => {
    onChange((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        education: [
          ...prev.sections.education,
          {
            institution: '',
            area: '',
            degree: '',
            location: '',
            date: '',
            summary: '',
          },
        ],
      },
    }));
  };

  const removeEducation = (index: number) => {
    onChange((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        education: prev.sections.education.filter((_, currentIndex) => currentIndex !== index),
      },
    }));
  };

  return (
    <div className="h-full bg-zinc-100 p-4">
      <div className="flex items-center justify-between rounded border border-zinc-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-zinc-800">{resolvedCvTitle}</h2>
        <div className="flex items-center gap-2">
          <div className="relative" ref={themeRef}>
            <button
              type="button"
              className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              onClick={() => setIsThemeMenuOpen((current) => !current)}
            >
              Tema
            </button>
            {isThemeMenuOpen ? (
              <div className="absolute right-0 z-20 mt-2 w-44 rounded border border-zinc-200 bg-white p-1 shadow-lg">
                {THEME_OPTIONS.map((themeOption) => {
                  const selected = value.design.theme === themeOption.value;
                  return (
                    <button
                      key={themeOption.value}
                      type="button"
                      className={`w-full rounded px-3 py-2 text-left text-sm ${selected ? 'bg-blue-50 text-blue-700' : 'text-zinc-700 hover:bg-zinc-100'}`}
                      onClick={() => {
                        setDesignField('theme', themeOption.value);
                        setIsThemeMenuOpen(false);
                      }}
                    >
                      {themeOption.label}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="relative" ref={languageRef}>
            <button
              type="button"
              className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              onClick={() => setIsLanguageMenuOpen((current) => !current)}
            >
              Idioma
            </button>
            {isLanguageMenuOpen ? (
              <div className="absolute right-0 z-20 mt-2 w-44 rounded border border-zinc-200 bg-white p-1 shadow-lg">
                {LANGUAGE_OPTIONS.map((languageOption) => {
                  const selected = value.language === languageOption.value;
                  return (
                    <button
                      key={languageOption.value}
                      type="button"
                      className={`w-full rounded px-3 py-2 text-left text-sm ${selected ? 'bg-blue-50 text-blue-700' : 'text-zinc-700 hover:bg-zinc-100'}`}
                      onClick={() => {
                        setLanguage(languageOption.value);
                        setIsLanguageMenuOpen(false);
                      }}
                    >
                      {languageOption.label}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="relative" ref={styleRef}>
            <button
              type="button"
              className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              onClick={() => setIsStylePopoverOpen((current) => !current)}
            >
              Estilo
            </button>
            {isStylePopoverOpen ? (
              <div className="absolute right-0 z-20 mt-2 w-[28rem] max-w-[min(92vw,28rem)] space-y-3 rounded border border-zinc-200 bg-white p-4 shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Tipografía</p>

                <label className="block text-xs text-zinc-600">
                  Fuente
                  <select
                    className="mt-1 h-10 w-full rounded border border-zinc-300 bg-white px-2 text-sm"
                    value={value.design.typography.font_family}
                    onChange={(event) => setDesignTypographyField('font_family', event.target.value)}
                  >
                    {availableFonts.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <label className="text-xs text-zinc-600">
                    Body
                    <select
                      className="mt-1 h-10 w-full rounded border border-zinc-300 bg-white px-2 text-sm"
                      value={value.design.typography.font_size.body}
                      onChange={(event) => setDesignFontSizeField('body', event.target.value)}
                    >
                      {FONT_SIZE_OPTIONS.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="text-xs text-zinc-600">
                    Nombre
                    <select
                      className="mt-1 h-10 w-full rounded border border-zinc-300 bg-white px-2 text-sm"
                      value={value.design.typography.font_size.name}
                      onChange={(event) => setDesignFontSizeField('name', event.target.value)}
                    >
                      {FONT_SIZE_OPTIONS.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="text-xs text-zinc-600">
                    Titular
                    <select
                      className="mt-1 h-10 w-full rounded border border-zinc-300 bg-white px-2 text-sm"
                      value={value.design.typography.font_size.headline}
                      onChange={(event) => setDesignFontSizeField('headline', event.target.value)}
                    >
                      {FONT_SIZE_OPTIONS.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="block text-xs text-zinc-600">
                  Espaciado de línea
                  <select
                    className="mt-1 h-10 w-full rounded border border-zinc-300 bg-white px-2 text-sm"
                    value={value.design.typography.line_spacing}
                    onChange={(event) => setDesignTypographyField('line_spacing', event.target.value)}
                  >
                    {LINE_SPACING_OPTIONS.map((spacing) => (
                      <option key={spacing} value={spacing}>
                        {spacing}
                      </option>
                    ))}
                  </select>
                </label>

                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Colores</p>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs text-zinc-600">
                    Texto base
                    <input
                      type="color"
                      className="mt-1 h-10 w-full rounded border border-zinc-300 bg-white"
                      value={value.design.colors.body}
                      onChange={(event) => setDesignColorField('body', event.target.value)}
                    />
                  </label>
                  <label className="text-xs text-zinc-600">
                    Nombre
                    <input
                      type="color"
                      className="mt-1 h-10 w-full rounded border border-zinc-300 bg-white"
                      value={value.design.colors.name}
                      onChange={(event) => setDesignColorField('name', event.target.value)}
                    />
                  </label>
                  <label className="text-xs text-zinc-600">
                    Títulos
                    <input
                      type="color"
                      className="mt-1 h-10 w-full rounded border border-zinc-300 bg-white"
                      value={value.design.colors.section_titles}
                      onChange={(event) => setDesignColorField('section_titles', event.target.value)}
                    />
                  </label>
                  <label className="text-xs text-zinc-600">
                    Links
                    <input
                      type="color"
                      className="mt-1 h-10 w-full rounded border border-zinc-300 bg-white"
                      value={value.design.colors.links}
                      onChange={(event) => setDesignColorField('links', event.target.value)}
                    />
                  </label>
                </div>

                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Espaciado de secciones</p>
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-xs text-zinc-600">
                    Entradas regulares
                    <select
                      className="mt-1 h-10 w-full rounded border border-zinc-300 bg-white px-2 text-sm"
                      value={value.design.sections.space_between_regular_entries}
                      onChange={(event) => setDesignSectionsField('space_between_regular_entries', event.target.value)}
                    >
                      {REGULAR_ENTRY_SPACING_OPTIONS.map((spacing) => (
                        <option key={spacing} value={spacing}>
                          {spacing}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs text-zinc-600">
                    Entradas textuales
                    <select
                      className="mt-1 h-10 w-full rounded border border-zinc-300 bg-white px-2 text-sm"
                      value={value.design.sections.space_between_text_based_entries}
                      onChange={(event) => setDesignSectionsField('space_between_text_based_entries', event.target.value)}
                    >
                      {TEXT_ENTRY_SPACING_OPTIONS.map((spacing) => (
                        <option key={spacing} value={spacing}>
                          {spacing}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="xl:col-span-2">
          <PanelSection title="Información base">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input className="h-10 rounded border border-zinc-300 px-3 text-sm" placeholder="Nombre" value={value.basics.name} onChange={setBasicField('name')} />
              <input className="h-10 rounded border border-zinc-300 px-3 text-sm" placeholder="Titular" value={value.basics.headline} onChange={setBasicField('headline')} />
              <input className="h-10 rounded border border-zinc-300 px-3 text-sm" placeholder="Ubicación" value={value.basics.location} onChange={setBasicField('location')} />
              <input className="h-10 rounded border border-zinc-300 px-3 text-sm" placeholder="Email" value={value.basics.email} onChange={setBasicField('email')} />
              <input className="h-10 rounded border border-zinc-300 px-3 text-sm" placeholder="Teléfono" value={value.basics.phone} onChange={setBasicField('phone')} />
              <input className="h-10 rounded border border-zinc-300 px-3 text-sm" placeholder="LinkedIn (username)" value={value.basics.linkedin} onChange={setBasicField('linkedin')} />
            </div>
          </PanelSection>
        </div>

        <PanelSection title="Redes sociales extra">
          <div className="space-y-3">
            {value.socialsExtra.map((social, index) => (
              <SectionItemCard key={`social-${index}`}>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                  <input
                    className="h-10 rounded border border-zinc-300 px-3 text-sm"
                    placeholder="Red (ej: X, Behance)"
                    value={social.network}
                    onChange={setSocialField(index, 'network')}
                  />
                  <input
                    className="h-10 rounded border border-zinc-300 px-3 text-sm"
                    placeholder="Usuario"
                    value={social.username}
                    onChange={setSocialField(index, 'username')}
                  />
                  <input
                    className="h-10 rounded border border-zinc-300 px-3 text-sm"
                    placeholder="URL"
                    value={social.url}
                    onChange={setSocialField(index, 'url')}
                  />
                </div>
                <button type="button" onClick={() => removeSocial(index)} className="text-xs font-medium text-red-600 hover:text-red-700">
                  Quitar red
                </button>
              </SectionItemCard>
            ))}
            <button type="button" onClick={addSocial} className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm hover:bg-zinc-50">
              Agregar red social
            </button>
          </div>
        </PanelSection>

        <PanelSection title="Habilidades">
          <div className="space-y-3">
            {value.sections.skills.map((item, index) => (
              <SectionItemCard key={`skill-${index}`}>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <input className="h-10 rounded border border-zinc-300 px-3 text-sm" placeholder="Etiqueta" value={item.label} onChange={setSkillField(index, 'label')} />
                  <input className="h-10 rounded border border-zinc-300 px-3 text-sm" placeholder="Detalles" value={item.details} onChange={setSkillField(index, 'details')} />
                </div>
                <button type="button" onClick={() => removeSkill(index)} className="text-xs font-medium text-red-600 hover:text-red-700">
                  Quitar habilidad
                </button>
              </SectionItemCard>
            ))}
            <button type="button" onClick={addSkill} className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm hover:bg-zinc-50">
              Agregar habilidad
            </button>
          </div>
        </PanelSection>

        <div className="xl:col-span-2">
          <PanelSection title="Experiencia">
            <div className="space-y-3">
              {value.sections.experience.map((item, index) => (
                <SectionItemCard key={`experience-${index}`}>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <input className="h-10 rounded border border-zinc-300 px-3 text-sm" placeholder="Cargo" value={item.position} onChange={setExperienceField(index, 'position')} />
                    <input className="h-10 rounded border border-zinc-300 px-3 text-sm" placeholder="Empresa" value={item.company} onChange={setExperienceField(index, 'company')} />
                    <input className="h-10 rounded border border-zinc-300 px-3 text-sm" placeholder="Ubicación" value={item.location} onChange={setExperienceField(index, 'location')} />
                    <input className="h-10 rounded border border-zinc-300 px-3 text-sm" placeholder="Fecha" value={item.date} onChange={setExperienceField(index, 'date')} />
                  </div>
                  <AiTextArea
                    className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
                    fieldLabel="Resumen de experiencia"
                    fieldPath={`sections.experience.${index}.summary`}
                    improvingFieldPath={improvingFieldPath}
                    rows={3}
                    placeholder="Resumen"
                    value={item.summary}
                    onChange={setExperienceField(index, 'summary')}
                    onImproveField={onImproveField}
                  />
                  <AiTextArea
                    className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
                    fieldLabel="Logros de experiencia"
                    fieldPath={`sections.experience.${index}.highlights`}
                    improvingFieldPath={improvingFieldPath}
                    rows={3}
                    placeholder="Logros (uno por línea)"
                    value={item.highlights}
                    onChange={setExperienceField(index, 'highlights')}
                    onImproveField={onImproveField}
                  />
                  <button type="button" onClick={() => removeExperience(index)} className="text-xs font-medium text-red-600 hover:text-red-700">
                    Quitar experiencia
                  </button>
                </SectionItemCard>
              ))}
              <button type="button" onClick={addExperience} className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm hover:bg-zinc-50">
                Agregar experiencia
              </button>
            </div>
          </PanelSection>
        </div>

        <div className="xl:col-span-2">
          <PanelSection title="Proyectos personales">
            <div className="space-y-3">
              {value.sections.personalProjects.map((item, index) => (
                <SectionItemCard key={`project-${index}`}>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <input className="h-10 rounded border border-zinc-300 px-3 text-sm" placeholder="Nombre" value={item.name} onChange={setProjectField(index, 'name')} />
                    <input className="h-10 rounded border border-zinc-300 px-3 text-sm" placeholder="Fecha" value={item.date} onChange={setProjectField(index, 'date')} />
                  </div>
                  <AiTextArea
                    className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
                    fieldLabel="Detalle de proyecto"
                    fieldPath={`sections.personalProjects.${index}.detail`}
                    improvingFieldPath={improvingFieldPath}
                    rows={3}
                    placeholder="Detalle"
                    value={item.detail}
                    onChange={setProjectField(index, 'detail')}
                    onImproveField={onImproveField}
                  />
                  <AiTextArea
                    className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
                    fieldLabel="Logros de proyecto"
                    fieldPath={`sections.personalProjects.${index}.highlights`}
                    improvingFieldPath={improvingFieldPath}
                    rows={3}
                    placeholder="Logros (uno por línea)"
                    value={item.highlights}
                    onChange={setProjectField(index, 'highlights')}
                    onImproveField={onImproveField}
                  />
                  <button type="button" onClick={() => removeProject(index)} className="text-xs font-medium text-red-600 hover:text-red-700">
                    Quitar proyecto
                  </button>
                </SectionItemCard>
              ))}
              <button type="button" onClick={addProject} className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm hover:bg-zinc-50">
                Agregar proyecto
              </button>
            </div>
          </PanelSection>
        </div>

        <div className="xl:col-span-2">
          <PanelSection title="Educación">
            <div className="space-y-3">
              {value.sections.education.map((item, index) => (
                <SectionItemCard key={`education-${index}`}>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <input
                      className="h-10 rounded border border-zinc-300 px-3 text-sm"
                      placeholder="Institución"
                      value={item.institution}
                      onChange={setEducationField(index, 'institution')}
                    />
                    <input className="h-10 rounded border border-zinc-300 px-3 text-sm" placeholder="Área" value={item.area} onChange={setEducationField(index, 'area')} />
                    <input className="h-10 rounded border border-zinc-300 px-3 text-sm" placeholder="Grado (opcional)" value={item.degree} onChange={setEducationField(index, 'degree')} />
                    <input className="h-10 rounded border border-zinc-300 px-3 text-sm" placeholder="Ubicación" value={item.location} onChange={setEducationField(index, 'location')} />
                    <input className="h-10 rounded border border-zinc-300 px-3 text-sm md:col-span-2" placeholder="Fecha" value={item.date} onChange={setEducationField(index, 'date')} />
                  </div>
                  <AiTextArea
                    className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
                    fieldLabel="Resumen de educación"
                    fieldPath={`sections.education.${index}.summary`}
                    improvingFieldPath={improvingFieldPath}
                    rows={3}
                    placeholder="Resumen"
                    value={item.summary}
                    onChange={setEducationField(index, 'summary')}
                    onImproveField={onImproveField}
                  />
                  <button type="button" onClick={() => removeEducation(index)} className="text-xs font-medium text-red-600 hover:text-red-700">
                    Quitar educación
                  </button>
                </SectionItemCard>
              ))}
              <button type="button" onClick={addEducation} className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm hover:bg-zinc-50">
                Agregar educación
              </button>
            </div>
          </PanelSection>
        </div>
      </div>
    </div>
  );
}
