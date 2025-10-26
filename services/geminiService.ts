import { GoogleGenAI, Chat } from "@google/genai";
import type { BotProfile, GeminiChat } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

let chats: GeminiChat[] = [];

function getOrCreateChat(botProfile: BotProfile): Chat {
  const existingChat = chats.find(c => c.botId === botProfile.id);
  if (existingChat) {
    return existingChat.chat;
  }

  const newChat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: botProfile.systemInstruction,
    },
  });

  chats.push({ botId: botProfile.id, chat: newChat });
  return newChat;
}

export const generateBotResponse = async (
  message: string,
  botProfile: BotProfile
): Promise<string> => {
  try {
    const chat = getOrCreateChat(botProfile);
    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Error generating bot response:", error);
    return "Sorry, I'm having a little trouble thinking right now. Please try again in a moment.";
  }
};

export const clearChatHistory = () => {
    chats = [];
}
