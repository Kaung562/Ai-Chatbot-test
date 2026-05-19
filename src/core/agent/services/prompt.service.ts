import { Injectable } from "@nestjs/common";
import { KnowledgeService } from "./knowledge.service";
import { MessageDto } from "../application/dtos/message.dto";


@Injectable()
export class PromptService {
  constructor(private readonly knowledgeService:  KnowledgeService) {}

  build(messages: MessageDto[]) {
    const knowledge = this.knowledgeService.getKnowledge();

    return [
      {
        role: 'system',
        content: `
You are a customer support AI.

Use ONLY the knowledge below when answering:
---
${knowledge}
---

If answer is not in knowledge, use your general knowledge but say you are not fully sure.
Keep answers short and helpful.
        `,
      },
      ...messages,
    ];
  }
}