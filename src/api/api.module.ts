import { Module } from '@nestjs/common';
import { ApiService } from './api.service';
import { ApiController } from './api.controller';

@Module({
  imports: [],
  providers: [ApiService],
  controllers: [ApiController],
  exports: [],
})
export class ApiModule {}
