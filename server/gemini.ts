// Reference: javascript_gemini blueprint
import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY must be set");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateArticleFromTrend(keyword: string, category?: string): Promise<{
  title: string;
  content: string;
  excerpt: string;
}> {
  // =================== VAQTINCHALIK TEST KODI ===================
  // Maqsad: Gemini API'dan 429 xatosini ataylab simulyatsiya qilish
  console.log("⚠️ TEST MODE: Simulating Gemini API 429 Error...");
  throw new Error("Simulated Gemini API Error: 429 Too Many Requests");
  // =============================================================
  
  const systemPrompt = `Siz professional uzbek tilida maqolalar yozadigan jurnalistsiz. 
Sizning vazifangiz - berilgan trend bo'yicha to'liq, mazmunli va grammatik jihatdan to'g'ri maqola yaratish.

Qoidalar:
- Maqola uzbek tilida bo'lishi kerak
- Matn rasmiy, lekin o'qish uchun qulay bo'lishi kerak
- Maqola kamida 300-500 so'zdan iborat bo'lishi kerak
- Faktlarga asoslangan ma'lumot berish
- Qiziqarli va dolzarb tarzda yozish
- MUHIM: Markdown belgilarini ishlatmang (**, __, ##, va boshqalar)
- Oddiy matn formatida yozing, markdown yoki maxsus belgilarsiz`;

  const userPrompt = `Trend mavzusi: "${keyword}"
${category ? `Kategoriya: ${category}` : ''}

Ushbu trend haqida to'liq maqola yozing. Maqola quyidagi qismlardan iborat bo'lishi kerak:
1. Qiziqarli sarlavha (title)
2. Qisqa tavsif - 100-150 so'z (excerpt)
3. To'liq maqola matni - 300-500 so'z (content)

JSON formatida javob bering:
{
  "title": "...",
  "excerpt": "...",
  "content": "..."
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
            excerpt: { type: "string" },
            content: { type: "string" },
          },
          required: ["title", "excerpt", "content"],
        },
      },
      contents: userPrompt,
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("Empty response from Gemini");
    }

    const article = JSON.parse(rawJson);
    return article;
  } catch (error) {
    console.error("Error generating article:", error);
    throw new Error(`Failed to generate article: ${error}`);
  }
}

export async function categorizeTrend(keyword: string): Promise<string> {
  const prompt = `Ushbu trend uchun eng mos kategoriyani tanlang: "${keyword}"

Kategoriyalar: Siyosat, Iqtisodiyot, Sport, Texnologiya, Madaniyat, Sog'liqni saqlash, Ta'lim, Ijtimoiy, Boshqa

Faqat kategoriya nomini yozing, boshqa hech narsa.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
    });

    return response.text?.trim() || "Boshqa";
  } catch (error) {
    console.error("Error categorizing trend:", error);
    return "Boshqa";
  }
}
