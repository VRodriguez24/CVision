import { z } from 'zod';
import { env } from '../../config/env.js';
import { AppError } from '../../errors/AppError.js';
import { errorCodes } from '../../errors/errorCodes.js';

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';

const fieldImprovementResponseSchema = z.object({
  improvedText: z.string(),
  explanation: z.string(),
  atsNotes: z.array(z.string()),
});

const cvAnalysisResponseSchema = z.object({
  summary: z.string(),
  score: z.number().min(0).max(100),
  suggestions: z.array(z.object({
    id: z.string(),
    title: z.string(),
    category: z.enum(['redaction', 'ats', 'keyword', 'inconsistency', 'missing_field']),
    fieldPath: z.string(),
    currentValue: z.string(),
    suggestedValue: z.string(),
    rationale: z.string(),
    severity: z.enum(['low', 'medium', 'high']),
  })),
  inconsistencies: z.array(z.object({
    fieldPath: z.string(),
    message: z.string(),
    severity: z.enum(['low', 'medium', 'high']),
  })),
  missingFields: z.array(z.object({
    fieldPath: z.string(),
    label: z.string(),
    reason: z.string(),
  })),
  keywords: z.array(z.string()),
});

const fieldImprovementJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['improvedText', 'explanation', 'atsNotes'],
  properties: {
    improvedText: { type: 'string' },
    explanation: { type: 'string' },
    atsNotes: {
      type: 'array',
      items: { type: 'string' },
    },
  },
};

const cvAnalysisJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['summary', 'score', 'suggestions', 'inconsistencies', 'missingFields', 'keywords'],
  properties: {
    summary: { type: 'string' },
    score: { type: 'number' },
    suggestions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'title', 'category', 'fieldPath', 'currentValue', 'suggestedValue', 'rationale', 'severity'],
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          category: { type: 'string', enum: ['redaction', 'ats', 'keyword', 'inconsistency', 'missing_field'] },
          fieldPath: { type: 'string' },
          currentValue: { type: 'string' },
          suggestedValue: { type: 'string' },
          rationale: { type: 'string' },
          severity: { type: 'string', enum: ['low', 'medium', 'high'] },
        },
      },
    },
    inconsistencies: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['fieldPath', 'message', 'severity'],
        properties: {
          fieldPath: { type: 'string' },
          message: { type: 'string' },
          severity: { type: 'string', enum: ['low', 'medium', 'high'] },
        },
      },
    },
    missingFields: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['fieldPath', 'label', 'reason'],
        properties: {
          fieldPath: { type: 'string' },
          label: { type: 'string' },
          reason: { type: 'string' },
        },
      },
    },
    keywords: {
      type: 'array',
      items: { type: 'string' },
    },
  },
};

function assertOpenAiConfigured() {
  if (!env.OPENAI_API_KEY) {
    throw new AppError('OpenAI API key is not configured', {
      statusCode: 503,
      code: errorCodes.AI_CONFIGURATION_ERROR,
    });
  }
}

function extractOutputText(payload) {
  if (typeof payload.output_text === 'string') {
    return payload.output_text;
  }

  for (const item of payload.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === 'output_text' && typeof content.text === 'string') {
        return content.text;
      }

      if (content.type === 'refusal' && typeof content.refusal === 'string') {
        throw new AppError(content.refusal, {
          statusCode: 422,
          code: errorCodes.AI_PROVIDER_ERROR,
        });
      }
    }
  }

  throw new AppError('OpenAI response did not include usable text output', {
    statusCode: 502,
    code: errorCodes.AI_PROVIDER_ERROR,
  });
}

async function createStructuredResponse({ instructions, input, schemaName, schema, maxOutputTokens }) {
  assertOpenAiConfigured();

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.AI_MODEL,
      instructions,
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: JSON.stringify(input),
            },
          ],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: schemaName,
          schema,
          strict: true,
        },
      },
      max_output_tokens: maxOutputTokens,
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new AppError(payload?.error?.message ?? 'OpenAI request failed', {
      statusCode: response.status >= 500 ? 502 : 400,
      code: errorCodes.AI_PROVIDER_ERROR,
      details: payload?.error ? [payload.error] : [],
    });
  }

  const outputText = extractOutputText(payload);

  try {
    return JSON.parse(outputText);
  } catch {
    throw new AppError('OpenAI response was not valid JSON', {
      statusCode: 502,
      code: errorCodes.AI_PROVIDER_ERROR,
    });
  }
}

export async function improveField({ fieldPath, fieldLabel, text, selectedText, targetRole, cv }) {
  const textToImprove = selectedText?.trim() || text.trim();

  if (!textToImprove) {
    throw new AppError('The selected field text is empty', {
      statusCode: 400,
      code: errorCodes.VALIDATION_ERROR,
    });
  }

  const result = await createStructuredResponse({
    schemaName: 'cv_field_improvement',
    schema: fieldImprovementJsonSchema,
    maxOutputTokens: 900,
    instructions: [
      'Eres un especialista en empleabilidad chilena, redacción profesional y CVs compatibles con ATS.',
      'Mejora solo el texto indicado, manteniendo idioma, veracidad, longitud razonable y formato de líneas cuando corresponda.',
      'No inventes cargos, empresas, fechas, métricas ni tecnologías no presentes.',
      'Devuelve JSON válido según el esquema solicitado.',
    ].join(' '),
    input: {
      fieldPath,
      fieldLabel,
      text: textToImprove,
      fullFieldText: text,
      targetRole: targetRole?.trim() || '',
      cv,
    },
  });

  return fieldImprovementResponseSchema.parse(result);
}

export async function analyzeCv({ targetRole, cv }) {
  const result = await createStructuredResponse({
    schemaName: 'cv_analysis',
    schema: cvAnalysisJsonSchema,
    maxOutputTokens: 3500,
    instructions: [
      'Eres un experto en reclutamiento, ATS y revisión de CVs para estudiantes próximos a egresar y recién titulados en Chile.',
      'Analiza redacción, claridad, compatibilidad ATS, campos relevantes vacíos, fechas inconsistentes y palabras clave para el cargo o área objetivo.',
      'Cada sugerencia aplicable debe usar un fieldPath existente del objeto CV recibido y un suggestedValue listo para reemplazar ese campo.',
      'No inventes experiencia, instituciones, fechas ni logros. Si recomiendas keywords, inclúyelas en la lista keywords.',
      'Devuelve JSON válido según el esquema solicitado.',
    ].join(' '),
    input: {
      targetRole,
      cv,
    },
  });

  return cvAnalysisResponseSchema.parse(result);
}
