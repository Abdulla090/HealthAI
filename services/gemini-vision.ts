const GEMINI_API_KEY = 'AIzaSyBWYzUp7Q8SWDPzWr5p1N2GDEK-23dnAgA';

// Model fallback order
const MODELS = [
  'gemini-3.1-flash-lite-preview',
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
];

function getApiUrl(model: string) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
}

export interface FoodAnalysis {
  name: string;
  totalCalories: number;
  carbsG: number;
  proteinG: number;
  fatG: number;
  items: { name: string; portion: string; kcal: number }[];
  healthScore: number; // 1-10
  tips: string;
}

const PROMPT = `You are a professional nutritionist AI. Analyze this food image and return ONLY a valid JSON object (no markdown, no code fences, no explanation) with the following schema:

{
  "name": "Name of the meal or dish",
  "totalCalories": <number>,
  "carbsG": <number>,
  "proteinG": <number>,
  "fatG": <number>,
  "items": [
    { "name": "individual food item", "portion": "estimated portion size", "kcal": <number> }
  ],
  "healthScore": <number 1-10>,
  "tips": "One short health/nutrition tip about this meal"
}

Be as accurate as possible with calorie and macro estimates. If you see multiple food items on the plate, list each separately. Return ONLY the JSON.`;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Analyze a food image using Gemini Vision with retry + model fallback.
 * @param base64Image  Base64 encoded image data (no data: prefix)
 * @param mimeType     e.g. "image/jpeg" or "image/png"
 */
export async function analyzeFood(
  base64Image: string,
  mimeType: string = 'image/jpeg'
): Promise<FoodAnalysis> {
  const body = {
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Image,
            },
          },
          { text: PROMPT },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1024,
    },
  };

  const jsonBody = JSON.stringify(body);

  let lastError: Error | null = null;

  // Try each model with retries
  for (const model of MODELS) {
    const url = getApiUrl(model);

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: jsonBody,
        });

        // If rate-limited, wait with exponential backoff
        if (response.status === 429) {
          const waitMs = Math.pow(2, attempt) * 1500; // 1.5s, 3s, 6s
          console.warn(`Rate limited on ${model}, retrying in ${waitMs}ms...`);
          await sleep(waitMs);
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Gemini (${model}) error:`, response.status, errorText);
          lastError = new Error(`API error ${response.status}`);
          break; // try next model for non-retryable errors
        }

        const data = await response.json();

        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        if (!text) {
          lastError = new Error('No analysis received');
          break;
        }

        // Clean up: strip markdown fences if present
        let cleaned = text.trim();
        if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        }

        try {
          const parsed: FoodAnalysis = JSON.parse(cleaned);
          // Validate required fields
          if (typeof parsed.totalCalories !== 'number' || !parsed.name) {
            throw new Error('Invalid structure');
          }
          return parsed;
        } catch (e) {
          console.error('Failed to parse Gemini response:', cleaned);
          lastError = new Error('Could not parse nutrition data. Try another photo.');
          break;
        }
      } catch (e: any) {
        // Network error — retry same model
        lastError = e;
        if (attempt < 2) {
          await sleep(1000);
          continue;
        }
      }
    }
  }

  throw lastError || new Error('Unable to analyze image. Please try again.');
}
