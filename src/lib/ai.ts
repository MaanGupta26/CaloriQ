import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const PHOTO_SYSTEM_PROMPT = `You are a nutrition analysis AI. When given a food photo, identify every food item visible, estimate portion sizes based on visual cues (plate size, utensils, context), and return structured nutrition data. Always account for Indian cuisine accurately. Respond ONLY with a valid JSON object matching this exact schema:
{
  "meal_name": "string",
  "confidence": "high | medium | low",
  "items": [
    {
      "name": "string",
      "portion_description": "string",
      "quantity_grams": number,
      "calories": number,
      "protein_g": number,
      "carbs_g": number,
      "fat_g": number,
      "fiber_g": number
    }
  ],
  "totals": { "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number, "fiber_g": number },
  "notes": "string"
}`;

const NLP_SYSTEM_PROMPT = `You are a nutrition parsing AI specialising in Indian cuisine and Hinglish food descriptions. Parse the user's natural language meal description into individual food items with nutrition estimates. Use standard Indian portion sizes where no quantity is specified. Be accurate with desi foods.

Standard Indian portion sizes to use when not specified:
- 1 roti = 40g = 120 kcal
- 1 bowl dal = 200ml = 150 kcal  
- 1 cup cooked rice = 175g = 230 kcal
- 1 medium paratha = 80g = 260 kcal
- 1 cup chai with milk & sugar = 80 kcal

If the input is too vague, return clarifying question.

Respond ONLY with valid JSON matching the schema below.
Schema:
{
  "meal_name": "string",
  "confidence": "high | medium | low",
  "items": [ { "name": "string", "portion_description": "string", "quantity_grams": number, "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number, "fiber_g": number } ],
  "totals": { "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number, "fiber_g": number },
  "notes": "string",
  "clarification_needed": boolean,
  "question": "string (only if clarification_needed is true)"
}`;

const CHAT_SYSTEM_PROMPT = `You are a knowledgeable, warm nutrition coach. You have full access to the user's meal logs and goals.

Your role:
- Answer nutrition questions using their ACTUAL data.
- Give practical food recommendations suited to Indian cuisine.
- If user asks to log food through chat, extract items and return BOTH a response AND a log_item JSON block.

If logging food via chat, return this JSON structure at the END of your reply inside <LOG_ITEM> tags:
<LOG_ITEM>
{
  "meal_slot": "breakfast | lunch | dinner | snack",
  "meal_name": "string",
  "calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "fiber_g": number,
  "items_json": []
}
</LOG_ITEM>`;

export async function analyzeMealPhoto(base64Image: string) {
  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
          { text: "Analyse this meal and return the nutrition JSON." }
        ]
      }
    ],
    config: {
      systemInstruction: PHOTO_SYSTEM_PROMPT,
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(result.text || '{}');
}

export async function parseMealText(text: string) {
  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: text,
    config: {
      systemInstruction: NLP_SYSTEM_PROMPT,
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(result.text || '{}');
}

export async function getCoachResponse(messages: { role: 'user' | 'assistant', content: string }[], context: string) {
  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    })),
    config: {
      systemInstruction: CHAT_SYSTEM_PROMPT + "\n\n" + context
    }
  });

  const raw = result.text || '';
  
  // Parse log item if exists
  let logItem = null;
  let cleanText = raw;
  const logMatch = raw.match(/<LOG_ITEM>([\s\S]*?)<\/LOG_ITEM>/);
  if (logMatch) {
    try {
      logItem = JSON.parse(logMatch[1]);
      cleanText = raw.replace(/<LOG_ITEM>[\s\S]*?<\/LOG_ITEM>/, '').trim();
    } catch (e) {
      console.error("Failed to parse log item", e);
    }
  }

  return { message: cleanText, logItem };
}
