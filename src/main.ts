import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    rawBody: true,
  });
  app.enableCors({
    origin: '*',
    methods: 'GET,PUT,POST,DELETE',
  });
  app.use(bodyParser.text({ type: ['application/x-yaml', 'text/yaml', 'text/plain', 'application/yaml'] }));

  const config = new DocumentBuilder()
    .setTitle('Guaritos API')
    .setDescription('This is the main guaritos apis for rule engine and other services')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
