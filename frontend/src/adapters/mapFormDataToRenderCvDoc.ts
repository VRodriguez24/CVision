import type { CvEducationItem, CvExperienceItem, CvFormData, CvPersonalProjectItem, CvSkillItem } from '../types/cvForm.js';

function parseHighlights(highlights: string): string[] {
  return (highlights || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function hasContent(values: Array<string | undefined>): boolean {
  return values.some((value) => Boolean(value && value.trim()));
}

function mapExperience(items: CvExperienceItem[]) {
  return items
    .filter((item) => hasContent([item.company, item.position, item.location, item.date, item.summary, item.highlights]))
    .map((item) => ({
      company: item.company || '',
      position: item.position || '',
      location: item.location || '',
      date: item.date || '',
      summary: item.summary || '',
      highlights: parseHighlights(item.highlights),
    }));
}

function mapPersonalProjects(items: CvPersonalProjectItem[]) {
  return items
    .filter((item) => hasContent([item.name, item.detail, item.date, item.highlights]))
    .map((item) => ({
      name: item.name || '',
      summary: item.detail || '',
      date: item.date || '',
      highlights: parseHighlights(item.highlights),
    }));
}

function mapSkills(items: CvSkillItem[]) {
  return items
    .filter((item) => hasContent([item.label, item.details]))
    .map((item) => ({
      label: item.label || 'Skills',
      details: item.details || '',
    }));
}

function mapEducation(items: CvEducationItem[]) {
  return items
    .filter((item) => hasContent([item.institution, item.area, item.degree, item.location, item.date, item.summary]))
    .map((item) => ({
      institution: item.institution || '',
      area: item.area || '',
      degree: item.degree || '',
      location: item.location || '',
      date: item.date || '',
      summary: item.summary || '',
    }));
}

export function mapFormDataToRenderCvDoc(formData: CvFormData) {
  const sections: Record<string, unknown[]> = {};

  const experience = mapExperience(formData.sections.experience);
  if (experience.length > 0) {
    sections.Experience = experience;
  }

  const personalProjects = mapPersonalProjects(formData.sections.personalProjects);
  if (personalProjects.length > 0) {
    sections['Personal Projects'] = personalProjects;
  }

  const skills = mapSkills(formData.sections.skills);
  if (skills.length > 0) {
    sections.Skills = skills;
  }

  const education = mapEducation(formData.sections.education);
  if (education.length > 0) {
    sections.Education = education;
  }

  const socialNetworks = formData.socialsExtra
    .filter((social) => hasContent([social.network, social.username, social.url]))
    .map((social) => ({
      network: social.network || '',
      username: social.username || '',
      url: social.url || '',
    }));

  return {
    cv: {
      name: formData.basics.name || '',
      headline: formData.basics.headline || '',
      location: formData.basics.location || '',
      email: formData.basics.email || '',
      phone: formData.basics.phone || '',
      website: formData.basics.website || '',
      linkedin: formData.basics.linkedin || '',
      github: formData.basics.github || '',
      social_networks: socialNetworks,
      sections,
    },
    locale: {
      language: 'english',
    },
    design: {
      theme: formData.design.theme,
      typography: {
        font_family: formData.design.typography.font_family,
        font_size: {
          body: formData.design.typography.font_size.body,
          name: formData.design.typography.font_size.name,
          headline: formData.design.typography.font_size.headline,
        },
        line_spacing: formData.design.typography.line_spacing,
      },
      colors: {
        body: formData.design.colors.body,
        name: formData.design.colors.name,
        section_titles: formData.design.colors.section_titles,
        links: formData.design.colors.links,
      },
      sections: {
        space_between_regular_entries: formData.design.sections.space_between_regular_entries,
        space_between_text_based_entries: formData.design.sections.space_between_text_based_entries,
      },
    },
  };
}
