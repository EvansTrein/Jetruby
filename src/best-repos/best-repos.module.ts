import { Module } from '@nestjs/common';
import { BestReposService } from './best-repos.service';

@Module({
  providers: [BestReposService]
})
export class BestReposModule {}
