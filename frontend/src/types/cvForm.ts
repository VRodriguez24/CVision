export type CvTheme = 'mart' | 'moderncv';

export interface CvBasics {
  name: string;
  headline: string;
  location: string;
  email: string;
  phone: string;
  website: string;
  linkedin: string;
  github: string;
}

export interface CvSocialExtra {
  network: string;
  username: string;
  url: string;
}

export interface CvExperienceItem {
  company: string;
  position: string;
  location: string;
  date: string;
  summary: string;
  highlights: string;
}

export interface CvPersonalProjectItem {
  name: string;
  detail: string;
  date: string;
  highlights: string;
}

export interface CvSkillItem {
  label: string;
  details: string;
}

export interface CvEducationItem {
  institution: string;
  area: string;
  degree: string;
  location: string;
  date: string;
  summary: string;
}

export interface CvFormSections {
  experience: CvExperienceItem[];
  personalProjects: CvPersonalProjectItem[];
  skills: CvSkillItem[];
  education: CvEducationItem[];
}

export interface CvDesignForm {
  theme: CvTheme;
  typography: {
    font_family: string;
    font_size: {
      body: string;
      name: string;
      headline: string;
    };
    line_spacing: string;
  };
  colors: {
    body: string;
    name: string;
    section_titles: string;
    links: string;
  };
  sections: {
    space_between_regular_entries: string;
    space_between_text_based_entries: string;
  };
}

export interface CvFormData {
  basics: CvBasics;
  socialsExtra: CvSocialExtra[];
  sections: CvFormSections;
  design: CvDesignForm;
}
