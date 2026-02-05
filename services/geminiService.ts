
import { GoogleGenAI, Type } from "@google/genai";
import { WhoisResult } from "../types";

const MODEL_NAME = 'gemini-3-flash-preview';

export async function fetchIpWhois(ip: string): Promise<WhoisResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    Perform a professional WHOIS intelligence lookup for the IP address: ${ip}.
    Use Google Search to find real-time registry information from RIPE, ARIN, APNIC, or other relevant RIRs.
    
    Return the data in a structured JSON format with the following fields:
    - summary: A 2-sentence explanation of what this IP is and who owns it.
    - networkInfo: { name, organization, netRange, cidr, status, registry }
    - geography: { country, city, coordinates }
    - contacts: { abuse, admin }
    
    Ensure the response is a valid JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            networkInfo: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                organization: { type: Type.STRING },
                netRange: { type: Type.STRING },
                cidr: { type: Type.STRING },
                status: { type: Type.STRING },
                registry: { type: Type.STRING }
              }
            },
            geography: {
              type: Type.OBJECT,
              properties: {
                country: { type: Type.STRING },
                city: { type: Type.STRING },
                coordinates: { type: Type.STRING }
              }
            },
            contacts: {
              type: Type.OBJECT,
              properties: {
                abuse: { type: Type.STRING },
                admin: { type: Type.STRING }
              }
            }
          },
          required: ["summary", "networkInfo", "geography", "contacts"]
        }
      },
    });

    const data = JSON.parse(response.text || "{}");
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Source',
      uri: chunk.web?.uri || '#'
    })) || [];

    return {
      ip,
      ...data,
      sources
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to fetch IP information. Please try again.");
  }
}
