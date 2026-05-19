import { Injectable } from '@nestjs/common';
import ollama from 'ollama';
import { ChatRequestDto } from '../dtos/chat.request.dto';
import { PromptService } from '../../services/prompt.service';

@Injectable()
export class ChatUseCase {

  constructor(private readonly promptService: PromptService) {}

  async execute(dto: ChatRequestDto) {

    const messages = this.promptService.build(dto.messages);
    
    const res = await ollama.chat({
      model: dto.model,
      messages,
    });

    return {
      message: res.message,
    };
  }
}