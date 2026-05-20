import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ChatRequestDto } from '../dtos/chat.request.dto';
import { PromptService } from '../../services/prompt.service';
import { AiClientService } from '../../services/ai-client.service';
import { ScyllaService } from '../../services/scylla.service';


@Injectable()
export class ChatUseCase {
  constructor(
    private readonly promptService: PromptService,
    private readonly aiClient: AiClientService,
    private readonly scylla: ScyllaService,
  ) {}

  async stream(dto: ChatRequestDto) {
    const messages = this.promptService.build(dto.messages);

    const visitorId = dto.visitorId;
    const conversationId = await this.scylla.createOrGetConversation(visitorId || null);

    // Persist the user's last user message (best-effort)
    const lastUser = [...dto.messages].reverse().find((m) => m.role === 'user') || dto.messages[dto.messages.length - 1];
    if (lastUser) {
      await this.scylla.insertMessage(conversationId, 'user', lastUser.content, { source: 'ai' });
    }

    const stream = await this.aiClient.stream(dto.model, messages);

    const self = this;

    async function* wrapper() {
      let assistantBuf = '';
      try {
        for await (const chunk of stream) {
          const text = chunk && typeof chunk === 'object' ? chunk.message?.content || '' : typeof chunk === 'string' ? chunk : '';
          assistantBuf += text;
          yield chunk;
        }

        if (assistantBuf) {
          await self.scylla.insertMessage(conversationId, 'assistant', assistantBuf, {});
        }
      } catch (err) {
        throw err;
      }
    }

    return wrapper();
  }

  async execute(dto: ChatRequestDto) {
    const messages = this.promptService.build(dto.messages);

    const visitorId = dto.visitorId;
    const conversationId = await this.scylla.createOrGetConversation(visitorId || null);

    // Persist user message
    const lastUser = [...dto.messages].reverse().find((m) => m.role === 'user') || dto.messages[dto.messages.length - 1];
    if (lastUser) {
      await this.scylla.insertMessage(conversationId, 'user', lastUser.content, { source: 'ai' });
    }

    let res;
    try {
      res = await this.aiClient.chat(dto.model, messages);
    } catch (err) {
      throw new InternalServerErrorException('AI service error');
    }

    // Persist assistant response
    const assistantText = res?.message?.content || '';
    if (assistantText) {
      await this.scylla.insertMessage(conversationId, 'assistant', assistantText, {});
    }

    return {
      conversationId,
      message: res?.message,
    };
  }
}