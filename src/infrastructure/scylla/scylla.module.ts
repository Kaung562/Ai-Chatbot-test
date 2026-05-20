import { Module } from "@nestjs/common";
import { ScyllaService } from "./scylla.service";
import { AppConfigService } from "@config/config.service";

@Module({
  providers: [ScyllaService, AppConfigService],
  exports: [ScyllaService],
})
export class ScyllaModule {}