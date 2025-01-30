import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function* streamChat(prompt: string, temperature: number = 0.7) {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-pro',
    generationConfig: {
      temperature,
    },
  });
  
  const result = await model.generateContentStream(prompt);
  
  for await (const chunk of result.stream) {
    yield chunk.text();
  }
}