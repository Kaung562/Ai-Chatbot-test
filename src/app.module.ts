import { MiddlewareConsumer, Module } from "@nestjs/common";
import { SentryGlobalFilter, SentryModule } from "@sentry/nestjs/setup";
import { APP_FILTER } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { EnvSchema } from "@config/env.schema";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AppConfigService } from "@config/config.service";
import { RequestMiddleware } from "@middlewares/request.middleware";
import { AiModule } from "./core/agent/ai.module";

@Module({
  imports: [
    SentryModule.forRoot(),
    AiModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validate: env => {
        const parsed = EnvSchema.safeParse(env);
        if (!parsed.success) {
          // Collect readable error messages
          const errors = Object.values(parsed.error.format())
            .map((e: any) => e?._errors?.join(", "))
            .filter(Boolean)
            .join("; ");
          throw new Error(`Environment validation failed: ${errors}`);
        }
        return parsed.data;
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },

    AppService,
    AppConfigService,
  ],
  exports: [AppConfigService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestMiddleware).forRoutes("*");
  }
}
