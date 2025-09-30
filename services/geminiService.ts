
import { GoogleGenAI } from "@google/genai";

// Ensure API_KEY is available. In a real app, this should be handled more securely.
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  // This is a placeholder for environments where process.env is not defined.
  // In a real build process (like Vite or Create React App), this will be handled.
  console.warn("API_KEY environment variable not set. The application might not work correctly.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY as string });

const SYSTEM_INSTRUCTION = `Ти — експертний помічник, який створює стислі та добре структуровані конспекти лекцій. Твоє завдання — взяти надану транскрипцію лекції і перетворити її на чіткий, організований конспект. Виділяй ключові теми, використовуй марковані списки для переліків і зберігай логічну послідовність. Форматуй відповідь у Markdown. Конспект має бути легким для читання та засвоєння, а також написаний українською мовою.`;

export const summarizeLecture = async (transcript: string): Promise<string> => {
  if (!transcript.trim()) {
    throw new Error("Транскрипція порожня, неможливо створити конспект.");
  }

  try {
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
    throw new Error("Не вдалося створити конспект. Спробуйте ще раз пізніше.");
  }
};
