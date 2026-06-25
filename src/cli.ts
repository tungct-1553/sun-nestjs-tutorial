import { CommandFactory } from 'nest-commander';
import { AppCliModule } from '@main/app.cli.module';

async function bootstrap() {
  await CommandFactory.run(AppCliModule, {
    logger: ['error', 'warn', 'log'],
  });
}

void bootstrap();
