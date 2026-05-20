import { Injectable, InternalServerErrorException } from '@nestjs/common';
import ollama from 'ollama';

@Injectable()
export class AiClientService {
  async chat(model: string, messages: any[]) {
    try {
      return await ollama.chat({ model, messages });
    } catch (err) {
      throw new InternalServerErrorException('AI chat error');
    }
  }

  async stream(model: string, messages: any[]) {
    try {
      return await ollama.chat({ model, messages, stream: true });
    } catch (err) {
      throw new InternalServerErrorException('AI stream error');
    }
  }
}
