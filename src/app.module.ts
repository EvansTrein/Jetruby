import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { ApiModule } from './api/api.module';
import { BestReposModule } from './best-repos/best-repos.module';
import { ApiController } from './api/api.controller';
import { ApiService } from './api/api.service';
import { UiController } from './ui.controller';

@Module({
  imports: [ConfigModule, DatabaseModule, ApiModule, BestReposModule],
  controllers: [ApiController, UiController],
  providers: [ApiService],
  exports: [],
})
export class AppModule {}
