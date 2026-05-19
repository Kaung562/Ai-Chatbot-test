import { IsArray, IsString, ValidateNested } from "class-validator";
import { MessageDto } from "./message.dto";
import { Type } from "class-transformer";

export class ChatRequestDto {

  @IsString()
  model: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages: MessageDto[];
}