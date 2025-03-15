import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BestReposService } from './best-repos.service';
import { DatabaseModule } from 'src/database/database.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
	imports: [DatabaseModule, HttpModule, ScheduleModule.forRoot()],
  providers: [BestReposService],
	exports: [BestReposService]
})
export class BestReposModule {}
