import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { ConfigService } from 'src/config/config.service';

@Module({
	imports: [],
  providers: [DatabaseService, ConfigService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
