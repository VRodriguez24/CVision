import { z } from 'zod';
import { env } from '../../config/env.js';
import { AppError } from '../../errors/AppError.js';
import { errorCodes } from '../../errors/errorCodes.js';

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

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

function assertGeminiConfigured() {
  if (!env.GEMINI_API_KEY) {
    throw new AppError('Gemini API key is not configured', {
      statusCode: 503,
      code: errorCodes.AI_CONFIGURATION_ERROR,
    });
  }
}

function extractOutputText(payload) {
  const candidate = payload?.candidates?.[0];

  if (candidate?.finishReason === 'MAX_TOKENS') {
    throw new AppError('Gemini response was truncated before producing complete JSON', {
      statusCode: 502,
      code: errorCodes.AI_PROVIDER_ERROR,
      details: candidate.safetyRatings ?? [],
    });
  }

  if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
    throw new AppError(`Gemini finished without usable output: ${candidate.finishReason}`, {
      statusCode: 422,
      code: errorCodes.AI_PROVIDER_ERROR,
      details: candidate.safetyRatings ?? [],
    });
  }

  const outputText = candidate?.content?.parts
    ?.map((part) => part.text)
    .filter((text) => typeof text === 'string')
    .join('')
    .trim();

  if (outputText) {
    return outputText;
  }

  for (const feedback of [payload?.promptFeedback, candidate]) {
    if (feedback?.blockReason) {
      throw new AppError(`Gemini blocked the request: ${feedback.blockReason}`, {
        statusCode: 422,
        code: errorCodes.AI_PROVIDER_ERROR,
        details: feedback.safetyRatings ?? [],
      });
    }
  }

  throw new AppError('Gemini response did not include usable text output', {
    statusCode: 502,
    code: errorCodes.AI_PROVIDER_ERROR,
  });
}

function parseStructuredJson(outputText) {
  try {
    return JSON.parse(outputText);
  } catch {
    const firstObjectIndex = outputText.indexOf('{');
    const lastObjectIndex = outputText.lastIndexOf('}');

    if (firstObjectIndex >= 0 && lastObjectIndex > firstObjectIndex) {
      try {
        return JSON.parse(outputText.slice(firstObjectIndex, lastObjectIndex + 1));
      } catch {
      }
    }

    throw new AppError('Gemini response was not valid JSON', {
      statusCode: 502,
      code: errorCodes.AI_PROVIDER_ERROR,
    });
  }
}

async function createStructuredResponse({ instructions, input, schema, maxOutputTokens }) {
  assertGeminiConfigured();

  const response = await fetch(`${GEMINI_API_BASE_URL}/models/${env.AI_MODEL}:generateContent`, {
    method: 'POST',
    headers: {
      'x-goog-api-key': env.GEMINI_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text: instructions,
          },
        ],
      },
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: JSON.stringify(input),
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens,
        responseMimeType: 'application/json',
        responseJsonSchema: schema,
      },
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new AppError(payload?.error?.message ?? 'Gemini request failed', {
      statusCode: response.status >= 500 ? 502 : 400,
      code: errorCodes.AI_PROVIDER_ERROR,
      details: payload?.error ? [payload.error] : [],
    });
  }

  const outputText = extractOutputText(payload);
  return parseStructuredJson(outputText);
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
    schema: cvAnalysisJsonSchema,
    maxOutputTokens: 8192,
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
