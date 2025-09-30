import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `Ти — експертний помічник, який створює стислі та добре структуровані конспекти лекцій. Твоє завдання — взяти надану транскрипцію лекції і перетворити її на чіткий, організований конспект. Виділяй ключові теми, використовуй марковані списки для переліків і зберігай логічну послідовність. Форматуй відповідь у Markdown. Конспект має бути легким для читання та засвоєння, а також написаний українською мовою.`;

export const summarizeLecture = async (transcript: string, apiKey: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("API ключ не надано.");
  }
  if (!transcript.trim()) {
    throw new Error("Транскрипція порожня, неможливо створити конспект.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: transcript,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating summary:", error);
    if (error instanceof Error && (error.message.includes('API key not valid') || error.message.includes('invalid'))) {
       throw new Error("Наданий API ключ недійсний. Будь ласка, перевірте його та спробуйте ще раз.");
    }
    throw new Error("Не вдалося створити конспект. Спробуйте ще раз пізніше.");
  }
};