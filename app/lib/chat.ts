'use server';

import { Message } from '@/app/types/Message';
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';

const client = new OpenAIClient(
  process.env.AZURE_OPENAI_ENDPOINT ?? '',
  new AzureKeyCredential(process.env.AZURE_OPENAI_API_KEY ?? '')
);
const modelName = process.env.AZURE_OPENAI_MODEL_NAME ?? '';

export const chat = async (chats: Message[], message: Message): Promise<Message> => {
  const messages = [...chats, message].map((d) => ({
    role: d.role,
    content: d.content,
  }));

  try {
    const response = await client.getChatCompletions(modelName, messages);
    return response.choices[0].message as Message;
  } catch (error) {
    throw new Error('Chat Error error: ' + error);
  }
};
