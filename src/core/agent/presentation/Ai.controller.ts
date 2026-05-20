import { Body, Controller, Post, Res } from "@nestjs/common";
import { Response } from "express";
import { ChatUseCase } from "../application/usecases/chat.usecase";
import { ChatRequestDto } from "../application/dtos/chat.request.dto";

@Controller("ai")
export class AiController {
  constructor(
    private readonly chatUseCase: ChatUseCase
  ) {}

  @Post("chat")
  async chat(@Body() dto: ChatRequestDto) {
    return this.chatUseCase.execute(dto);
  }

  @Post("chat-stream")
  async chatStream(
    @Body() dto: ChatRequestDto,
    @Res() res: Response,
  ) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    const stream = await this.chatUseCase.stream(dto);

    let buffer = "";
    let aborted = false;

    res.on('close', () => {
      aborted = true;
    });

    try {
      for await (const chunk of stream) {
        if (aborted) break;

        const text = chunk && typeof chunk === 'object' ? chunk.message?.content || '' : typeof chunk === 'string' ? chunk : '';

        buffer += text;

        // word-by-word effect
        const words = buffer.split(' ');
        buffer = words.pop() || '';

        for (const w of words) {
          res.write(`data: ${JSON.stringify({ token: w + ' ' })}\n\n`);
        }
      }

      if (!aborted && buffer) {
        res.write(`data: ${JSON.stringify({ token: buffer })}\n\n`);
      }

      if (!aborted) {
        res.write(`data: [DONE]\n\n`);
        res.end();
      }
    } catch (err) {
      if (!aborted) {
        res.write(`data: ${JSON.stringify({ error: 'stream_error' })}\n\n`);
        res.end();
      }
    }
  }
}