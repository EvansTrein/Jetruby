import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BestReposService } from './best-repos.service';
import { DatabaseModule } from 'src/database/database.module';
import { ConfigService } from 'src/config/config.service';


@Module({
	imports: [DatabaseModule, HttpModule],
  providers: [BestReposService, ConfigService],
	exports: [BestReposService]
})
export class BestReposModule {}
