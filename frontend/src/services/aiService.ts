import type { CvFormData } from '../types/cvForm.js';
import { apiClient } from './apiClient.js';

export type AiSuggestionCategory = 'redaction' | 'ats' | 'keyword' | 'inconsistency' | 'missing_field';
export type AiSeverity = 'low' | 'medium' | 'high';

export interface AiFieldImprovement {
  improvedText: string;
  explanation: string;
  atsNotes: string[];
}

export interface AiSuggestion {
  id: string;
  title: string;
  category: AiSuggestionCategory;
  fieldPath: string;
  currentValue: string;
  suggestedValue: string;
  rationale: string;
  severity: AiSeverity;
}

export interface AiCvAnalysis {
  summary: string;
  score: number;
  suggestions: AiSuggestion[];
  inconsistencies: Array<{
    fieldPath: string;
    message: string;
    severity: AiSeverity;
  }>;
  missingFields: Array<{
    fieldPath: string;
    label: string;
    reason: string;
  }>;
  keywords: string[];
}

export async function improveField(payload: {
  fieldPath: string;
  fieldLabel: string;
  text: string;
  selectedText?: string;
  targetRole?: string;
  cv: CvFormData;
}) {
  const response = await apiClient('/ai/improve-field', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return response.data as AiFieldImprovement;
}

export async function analyzeCv(payload: {
  targetRole: string;
  cv: CvFormData;
}) {
  const response = await apiClient('/ai/analyze-cv', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return response.data as AiCvAnalysis;
}
