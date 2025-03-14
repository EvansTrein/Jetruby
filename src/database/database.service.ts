import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { DataSource, MigrationExecutor } from 'typeorm';
import { ConfigService } from 'src/config/config.service';
import { IDbConfig } from 'src/config/interfaces';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(DatabaseService.name)
  private dataSource: DataSource;
  private readonly dbConfig: IDbConfig;

  constructor(private readonly configService: ConfigService) {
    this.dbConfig = configService.getDbConfig();
    this.dataSource = new DataSource({
      type: 'postgres',
      ...this.dbConfig,
      synchronize: false,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: ['./migrations/*{.ts,.js}'],
    });
  }

  getDataSource(): DataSource {
    return this.dataSource;
  }

  async onModuleInit(): Promise<void> {
    if (!this.dataSource.isInitialized) {
      await this.dataSource
        .initialize()
        .then(() => {
          console.log('Database connection established');
        })
        .catch((err) => {
					this.logger.error('Error Database initialization:', err)
          // console.error('Error during Data Source initialization:', err);
        });
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.dataSource.isInitialized) {
      await this.dataSource
        .destroy()
        .then(() => {
          console.log('Database connection closed');
        })
        .catch((err) => {
          console.error('Error when disconnecting from the database:', err);
        });
    }
  }

  async runMigrations(): Promise<void> {
    const migrationExecutor = new MigrationExecutor(this.dataSource);
    await migrationExecutor
      .executePendingMigrations()
      .then(() => {
        console.log('Migrations applied');
      })
      .catch((err) => {
        console.error('Failed migrations:', err);
      });
  }

  async revertLastMigration(): Promise<void> {
    const migrationExecutor = new MigrationExecutor(this.dataSource);
    await migrationExecutor
      .undoLastMigration()
      .then(() => {
        console.log('Last migration reverted');
      })
      .catch((err) => {
        console.error('Failed to roll back migrations:', err);
      });
  }
}
