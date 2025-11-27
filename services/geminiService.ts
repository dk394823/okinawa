import { GoogleGenAI, Type } from "@google/genai";
import { ItemType } from "../types";

// Access the API key injected by Vite config
// Note: In Vite, process.env is polyfilled by the define plugin in vite.config.ts
const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-2.5-flash';

/**
 * Gets a simulated weather forecast and a brief tip for a specific location and date.
 */
export const getLocationInsight = async (location: string, date: string, type: ItemType): Promise<{ weather: string; tip: string }> => {
  if (!apiKey) {
      console.warn("API Key is missing. Please check your Netlify environment variables.");
      return { weather: "晴朗, 22°C", tip: "請設定 API Key 以獲取 AI 建議" };
  }
  try {
    const prompt = `
      I am planning a trip to Okinawa, Japan (specifically ${location}) on ${date}.
      Provide a very short, concise weather prediction based on historical averages for March in Okinawa in Traditional Chinese (e.g., "晴時多雲, 23°C") 
      and a one-sentence travel tip in Traditional Chinese (Taiwan usage) relevant to this specific location and activity type (${type}).
      If the location is generic ("Okinawa"), assume Naha or a popular spot.
      Return JSON.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weather: { type: Type.STRING, description: "Short weather summary in Traditional Chinese like '晴天, 22°C'" },
            tip: { type: Type.STRING, description: "A helpful, short travel tip in Traditional Chinese for Okinawa" }
          },
          required: ["weather", "tip"]
        }
      }
    });

    const json = JSON.parse(response.text || '{}');
    return {
      weather: json.weather || "晴朗, 22°C",
      tip: json.tip || "享受沖繩的海風吧！"
    };

  } catch (error) {
    console.error("Error fetching Gemini insight:", error);
    return {
      weather: "晴朗, 22°C",
      tip: "記得防曬並補充水分！"
    };
  }
};

/**
 * Suggests an itinerary item if the user is stuck.
 */
export const suggestItem = async (currentLocation: string, date: string, timeOfDay: string): Promise<{ title: string; type: ItemType; location: string }> => {
  if (!apiKey) {
      return { title: "國際通散步", location: "那霸市國際通", type: ItemType.ACTIVITY };
  }
  try {
    const prompt = `
      Suggest a single realistic travel itinerary item for an Okinawa trip (near ${currentLocation || "Naha"}) on ${date} around ${timeOfDay}.
      It should be a specific place in Okinawa.
      The title and location should be in Traditional Chinese (e.g., 美麗海水族館, 美國村).
      Return JSON.
    `;
    
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            location: { type: Type.STRING },
            type: { type: Type.STRING, enum: [ItemType.ACTIVITY, ItemType.FOOD, ItemType.TRANSPORT, ItemType.HOTEL] }
          }
        }
      }
    });

    const json = JSON.parse(response.text || '{}');
    return {
      title: json.title || "美麗海水族館",
      location: json.location || "沖繩縣國頭郡本部町",
      type: (json.type as ItemType) || ItemType.ACTIVITY
    };
  } catch (error) {
    return {
      title: "國際通散步",
      location: "那霸市國際通",
      type: ItemType.ACTIVITY
    };
  }
};