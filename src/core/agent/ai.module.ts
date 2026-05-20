import { Module } from "@nestjs/common";
import { AiController } from "./presentation/Ai.controller";
import { ChatUseCase } from "./application/usecases/chat.usecase";
import { PromptService } from "./services/prompt.service";
import { KnowledgeService } from "./services/knowledge.service";
import { AiClientService } from "./services/ai-client.service";
import { ScyllaService } from "./services/scylla.service";


@Module({
  controllers: [AiController],
  providers: [
    ChatUseCase,
    PromptService,
    KnowledgeService,
    AiClientService,
    ScyllaService,
  ],
})
export class AiModule {}