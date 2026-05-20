import { IsArray, IsString, ValidateNested, IsOptional } from "class-validator";
import { MessageDto } from "./message.dto";
import { Type } from "class-transformer";

export class ChatRequestDto {

  @IsString()
  model!: string;

  @IsOptional()
  @IsString()
  visitorId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages!: MessageDto[];
}