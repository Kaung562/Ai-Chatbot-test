import { Module } from "@nestjs/common";
import { AiController } from "./presentation/Ai.controller";
import { ChatUseCase } from "./application/usecases/chat.usecase";
import { PromptService } from "./services/prompt.service";
import { KnowledgeService } from "./services/knowledge.service";
import { ScyllaModule } from "src/infrastructure/scylla/scylla.module";
import { AiClientModule } from "src/infrastructure/agent/ai-client.module";


@Module({
   imports: [
    ScyllaModule,
    AiClientModule,
  ],
  controllers: [AiController],
  providers: [
    ChatUseCase,
    PromptService,
    KnowledgeService,
  ],
})
export class AiModule {}