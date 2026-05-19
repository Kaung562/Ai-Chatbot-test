import { Module } from "@nestjs/common";
import { AiController } from "./presentation/Ai.controller";
import { ChatUseCase } from "./application/usecases/chat.usecase";
import { PromptService } from "./services/prompt.service";
import { KnowledgeService } from "./services/knowledge.service";


@Module({
  controllers: [AiController],
  providers: [ChatUseCase,
    PromptService,
    KnowledgeService
  ],
})
export class AiModule {}