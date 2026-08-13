import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
  private model = this.client.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });

  async classify(text: string, isOwner: boolean) {
    const intents = isOwner
      ? ['ORDER','CATALOGUE_QUERY','TALK_TO_OWNER','OWNER_ADD_PRODUCT','OWNER_CONFIRM_PAYMENT','OWNER_KHATA','OTHER']
      : ['ORDER','CATALOGUE_QUERY','TALK_TO_OWNER','OTHER'];

    const prompt = `Classify this WhatsApp message into exactly one of these categories: ${intents.join(', ')}.
Message: "${text}"
Reply with ONLY the category word, nothing else.`;

    const result = await this.model.generateContent(prompt);
    const raw = result.response.text().trim().toUpperCase();
    const matched = intents.find(i => raw.includes(i)) || 'OTHER';
    return { type: matched };
  }

  async extractOrderItems(text: string, products: {name:string;price:number}[]) {
    const catalogue = products.map(p => `${p.name} - ${p.price}`).join('\n');
    const prompt = `Catalogue:\n${catalogue}\n\nCustomer message: "${text}"
Extract ordered items and quantities. Reply ONLY with valid JSON array like:
[{"name":"Product Name","qty":2}]
No explanation, just the JSON array.`;

    const result = await this.model.generateContent(prompt);
    let raw = result.response.text().trim();
    raw = raw.replace(/```json|```/g, '').trim();
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
}