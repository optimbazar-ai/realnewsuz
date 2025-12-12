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
      model: "gemini-2.5-flash",
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
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text?.trim() || "Boshqa";
  } catch (error) {
    console.error("Error categorizing trend:", error);
    return "Boshqa";
  }
}

export async function rewriteLocalArticle(
  originalTitle: string,
  originalContent: string,
  sourceUrl: string
): Promise<{
  title: string;
  content: string;
  excerpt: string;
}> {
  const systemPrompt = `Siz professional uzbek tilida maqolalar yozadigan tajribali jurnalistsiz.
Sizning vazifangiz - boshqa manbadan olingan maqolani to'liq o'qib, uning asosiy ma'nosini saqlagan holda, 
BUTUNLAY YANGI, KREATIV VA O'ZIGA XOS uslubda qayta yozish (rewrite).

MUHIM QOIDALAR:
1. KONTENT:
   - Original maqolaning asosiy faktlari va ma'nosi saqlanishi SHART
   - Lekin so'zlar, jumlalar va tuzilishi BUTUNLAY BOSHQACHA bo'lishi kerak
   - Har bir paragrafni boshqa strukturada quring
   
2. USLUB:
   - Matn rasmiy, lekin o'qish uchun qulay bo'lishi kerak
   - Jurnalistik yondashuv: faktlar + tahlil + kontekst
   - Har bir maqola UNIKAL bo'lishi kerak
   
3. TUZILMA:
   - Sarlavhani BUTUNLAY o'zgartiring (lekin ma'noni saqlang)
   - Kirish qismini boshqacha yozing
   - Paragraflarni boshqa tartibda tashkil qiling
   - Xulosa qismini kreativ yakunlang
   
4. HAJM:
   - Maqola 300-500 so'zdan iborat bo'lishi kerak
   - Har bir jumla ma'noli va aniq bo'lishi kerak
   
5. FORMAT:
   - MUHIM: Markdown belgilarini ishlatmang (**, __, ##, va boshqalar)
   - Oddiy matn formatida yozing
   - Maxsus belgilarsiz, faqat oddiy matndagi nuqta, vergul, va boshqa oddiy tinish belgilar

KREATIVLIK MASLAHATLAR:
- Sinonim so'zlardan keng foydalaning
- Jumlalar strukturasini o'zgartiring
- Original bo'lmagan iboralarni o'zingizniki bilan almashtiring
- Kontekstni boy va qiziqarli qiling`;

  const userPrompt = `Original maqola manbasi: ${sourceUrl}
Original sarlavha: "${originalTitle}"

Original matn:
${originalContent}

Ushbu maqolani qayta yozing. Javob quyidagi qismlardan iborat bo'lishi kerak:
1. Yangi sarlavha (title) - original ma'noni saqlagan holda
2. Qisqa tavsif (excerpt) - 100-150 so'z
3. To'liq qayta yozilgan maqola (content) - 300-500 so'z

JSON formatida javob bering:
{
  "title": "...",
  "excerpt": "...",
  "content": "..."
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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

    return JSON.parse(rawJson);
  } catch (error) {
    console.error("Error rewriting local article:", error);
    throw new Error(`Failed to rewrite article: ${error}`);
  }
}

export async function translateAndRewriteForeignArticle(
  originalTitle: string,
  originalContent: string,
  sourceUrl: string
): Promise<{
  title: string;
  content: string;
  excerpt: string;
}> {
  const systemPrompt = `Siz professional tarjimon va tajribali xalqaro jurnalistsiz.
Sizning vazifangiz - xorijiy (asosan ingliz) tilidagi maqolani o'zbek tiliga professional darajada 
tarjima qilish va KREATIV, O'ZIGA XOS uslubda qayta yozish (rewrite).

MUHIM QOIDALAR:
1. TARJIMA VA KONTENT:
   - Original maqolaning asosiy faktlari, ma'nosi va konteksti saqlanishi SHART
   - Tarjima tabiiy va o'zbek o'quvchilari uchun tushunarli bo'lishi kerak
   - Madaniy kontekstni o'zbek o'quvchilariga moslashtirib bering
   
2. LOKALIZATSIYA:
   - Xorijiy nomlar va atamalar latincha yozilishi mumkin
   - O'lchovlar, valyutalar va sanalarni o'zbek standartiga moslashtiring
   - Global kontekstni mahalliy auditoriya uchun qiziqarli qiling
   
3. KREATIVLIK VA USLUB:
   - Har bir maqola UNIKAL bo'lishi kerak
   - Sarlavhani BUTUNLAY o'zgartiring (lekin ma'noni saqlang)
   - Paragraf tuzilmasini kreativ ravishda o'zgartiring
   - O'zbek jurnalistik uslubiga moslashtiring
   
4. STRUKTURAL XILMA-XILLIK:
   - Kirish qismini har safar boshqacha yozing
   - Paragraflarning tartibini o'zgartiring
   - Faktlarni turli usullarda taqdim qiling
   - Xulosa qismini kreativ va o'ylantiradigan qiling
   
5. HAJM VA FORMAT:
   - Maqola 300-500 so'zdan iborat bo'lishi kerak
   - MUHIM: Markdown belgilarini ishlatmang (**, __, ##, va boshqalar)
   - Oddiy matn formatida yozing
   - Faqat oddiy tinish belgilaridan foydalaning

TARJIMA MASLAHATLAR:
- Inglizcha idiomalarni o'zbek muqobillariga almashtiring
- Komplex jumlalarni oddiy va tushunarli qilib bering
- O'zbek o'quvchilarga qiziqarli kontekst qo'shing
- Har bir tarjima original va kreativ bo'lishi kerak`;

  const userPrompt = `Original maqola manbasi: ${sourceUrl}
Original sarlavha (ingliz tilida): "${originalTitle}"

Original matn (ingliz yoki boshqa til):
${originalContent}

Ushbu xorijiy maqolani o'zbek tiliga tarjima qiling va qayta yozing. Javob quyidagi qismlardan iborat bo'lishi kerak:
1. O'zbek tilidagi sarlavha (title)
2. Qisqa tavsif (excerpt) - 100-150 so'z
3. To'liq tarjima qilingan va qayta yozilgan maqola (content) - 300-500 so'z

JSON formatida javob bering:
{
  "title": "...",
  "excerpt": "...",
  "content": "..."
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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

    return JSON.parse(rawJson);
  } catch (error) {
    console.error("Error translating and rewriting foreign article:", error);
    throw new Error(`Failed to translate and rewrite article: ${error}`);
  }
}
