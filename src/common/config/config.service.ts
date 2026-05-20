import { Injectable } from "@nestjs/common";
import { ConfigService as NestConfigService } from "@nestjs/config";

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: NestConfigService) {}

  get nodeEnv(): "development" | "production" | "test" {
    return this.configService.get<string>("NODE_ENV") as any;
  }

  get port(): number {
    return parseInt(this.configService.get<string>("PORT", "3000"), 10);
  }

  get redisHost(): string | undefined {
    return this.configService.get<string>("REDIS_HOST");
  }

  get redisPort(): number | undefined {
    const port = this.configService.get<string>("REDIS_PORT");
    return port ? parseInt(port, 10) : undefined;
  }

  get scyllaContactPoints(): string[] {
    return (this.configService.get<string>("SCYLLA_CONTACT_POINTS", "127.0.0.1") || "")
      .split(",")
      .map((v) => v.trim());
  }

  get scyllaLocalDc(): string {
    return this.configService.get<string>("SCYLLA_LOCAL_DC", "datacenter1") || "datacenter1";
  }

  get scyllaKeyspace(): string {
    return this.configService.get<string>("SCYLLA_KEYSPACE", "support") || "support";
  }

}
