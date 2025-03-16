import { Module } from '@nestjs/common';
import { ApiService } from './api.service';
import { ApiController } from './api.controller';
import { DatabaseModule } from 'src/database/database.module';
import { BestReposModule } from 'src/best-repos/best-repos.module'; 

@Module({
  imports: [DatabaseModule, BestReposModule],
  controllers: [ApiController],
  providers: [ApiService],
  exports: [],
})
export class ApiModule {}
