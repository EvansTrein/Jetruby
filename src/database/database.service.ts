import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { DataSource, MigrationExecutor } from 'typeorm';
import { ConfigService } from 'src/config/config.service';
import { IDbConfig } from 'src/config/interfaces';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private dataSource: DataSource;
  private readonly dbConfig: IDbConfig;

  constructor(private readonly configService: ConfigService) {
    this.dbConfig = configService.getDbConfig();
    this.dataSource = new DataSource({
      type: 'postgres',
      ...this.dbConfig,
      synchronize: false,
      entities: [__dirname + '/../database/entity/*{.ts,.js}'],
      migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
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
          this.logger.log('Database connection established');
        })
        .catch((err) => {
          this.logger.error('Error Database initialization:', err);
        });

      const pendingMigrations = await this.dataSource.showMigrations();
      this.logger.debug(`Pending migrations: ${pendingMigrations}`);

			// launch migrations at startup
      await this.runMigrations();
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.dataSource.isInitialized) {
      await this.dataSource
        .destroy()
        .then(() => {
          this.logger.log('Database connection closed');
        })
        .catch((err) => {
          this.logger.error('Error when disconnecting from the database:', err);
        });
    }
  }

  async runMigrations(): Promise<void> {
    const migrationExecutor = new MigrationExecutor(this.dataSource);
    await migrationExecutor
      .executePendingMigrations()
      .then(() => {
        this.logger.log('Migrations applied');
      })
      .catch((err) => {
        this.logger.error('Failed migrations:', err);
      });
  }

  async revertLastMigration(): Promise<void> {
    const migrationExecutor = new MigrationExecutor(this.dataSource);
    await migrationExecutor
      .undoLastMigration()
      .then(() => {
        this.logger.log('Last migration reverted');
      })
      .catch((err) => {
        this.logger.error('Failed to roll back migrations:', err);
      });
  }
}
