import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from 'src/config/config.module';
import { DatabaseService } from './database.service';
import { ConfigService } from 'src/config/config.service';
import { Repo } from './entity/repo.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getDbConfig().host,
        port: configService.getDbConfig().port,
        username: configService.getDbConfig().username,
        password: configService.getDbConfig().password,
        database: configService.getDbConfig().database,
        entities: [Repo],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Repo]),
  ],
  controllers: [],
  providers: [DatabaseService, ConfigService],
  exports: [DatabaseService, TypeOrmModule],
})
export class DatabaseModule {}
