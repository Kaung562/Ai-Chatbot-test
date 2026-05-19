import { Body, Controller, Post } from "@nestjs/common";
import { ChatUseCase } from "../application/usecases/chat.usecase";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ChatResponseDto } from "../application/dtos/chat.response.dto";
import { ChatRequestDto } from "../application/dtos/chat.request.dto";


@Controller("ai")
export class AiController {
    constructor(
        private readonly chatUseCase: ChatUseCase
    ) {}

    @Post("chat")
    @ApiOperation({ summary: "Chat with AI" })
    @ApiResponse({
        status: 201,
        type: ChatResponseDto,
    })
  async chat(@Body() dto: ChatRequestDto): Promise<ChatResponseDto> {
    return this.chatUseCase.execute(dto);
  }
}