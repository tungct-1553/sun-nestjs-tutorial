import { Module } from '@nestjs/common';
import { TagsCoreModule } from '@main/modules/tags/tags.core.module';
import { TagsController } from '@presentation/api/controllers/tags.controller';

@Module({
  imports: [TagsCoreModule],
  controllers: [TagsController],
})
export class TagsApiModule {}
