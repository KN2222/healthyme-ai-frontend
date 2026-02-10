import { GoogleGenAI } from '@google/genai';
import type { HealthReport, UserProfileInput } from '../types/report';

export type GenerateReportParams = UserProfileInput;

export interface GenerateReportResult {
  report: HealthReport;
  rawText: string;
}

const SYSTEM_PROMPT = `
You are a meticulous health and fitness assistant.

You MUST return a STRICT JSON object with no markdown, no prose outside JSON, and no comments.
The JSON MUST conform to this TypeScript-like shape:

{
  "summary": {
    "bmi": number,
    "category": string,
    "text": string
  },
  "exerciseCalendar": [
    {
      "day": string,
      "activityType": "cardio" | "strength" | "stretching" | "rest",
      "description": string,
      "durationMinutes": number,
      "caloriesBurned": number
    }
  ],
  "nutrition": {
    "dailyCalories": number,
    "macrosPercent": {
      "protein": number,
      "carbs": number,
      "fat": number
    }
  },
  "weightProgress": {
    "goalWeightKg": number,
    "points": [
      { "week": number, "weightKg": number }
    ]
  },
  "timeline": {
    "totalWeeks": number,
    "steps": [
      {
        "week": number,
        "label": string,
        "expectedWeightKg": number,
        "note": string
      }
    ]
  },
  "activityComposition": {
    "cardioMinutes": number,
    "strengthMinutes": number,
    "stretchingMinutes": number,
    "restMinutes": number
  },
  "bodyComposition": {
    "musclePercent": number,
    "fatPercent": number,
    "waterPercent": number,
    "bonePercent": number
  }
}

Numbers should be realistic and consistent with the user's goal and timeframe.
`.trim();

function buildUserPrompt(input: UserProfileInput): string {
  return `
User profile:
- Name: ${input.name}
- Age: ${input.age}
- Current weight (kg): ${input.weightKg}
- Height (cm): ${input.heightCm}
- Goal weight (kg): ${input.goalWeightKg}
- Available time for exercise per day (minutes): ${input.minutesPerDay}

Generate a realistic, sustainable plan for weight change per week and exercise schedule.
Return ONLY valid JSON as specified, no explanations.
`.trim();
}

export async function generateHealthReport(
  params: GenerateReportParams,
): Promise<GenerateReportResult> {
  const apiKey =
    import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error(
      'Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env.local file.',
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `${SYSTEM_PROMPT}\n\n${buildUserPrompt(params)}`,
          },
        ],
      },
    ],
  });

  const rawText: string = response.text ?? '';

  if (!rawText) {
    throw new Error('Gemini response was empty.');
  }

  let parsed: Omit<HealthReport, 'user'>;
  try {
    parsed = JSON.parse(rawText) as Omit<HealthReport, 'user'>;
  } catch {
    throw new Error('Failed to parse Gemini response as JSON.');
  }

  const report: HealthReport = {
    user: params,
    ...parsed,
  };

  return { report, rawText };
}
