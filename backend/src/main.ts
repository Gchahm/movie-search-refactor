import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { getEnvConfig } from "./config/env.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const env = getEnvConfig();
  app.enableCors({
    origin: env.corsOrigin,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  await app.listen(env.port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
