import { Injectable, Logger } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { IDbConfig, IHttpServer, IGithubServ } from './interfaces';

@Injectable()
export class ConfigService {
	private readonly logger = new Logger(ConfigService.name)
  private readonly dbConf: IDbConfig;
  private readonly serverConf: IHttpServer;
	private readonly githubServ : IGithubServ;

  constructor(private readonly nestConfigService: NestConfigService) {
    this.dbConf = {
      host: this.getRequired<string>('POSTGRES_HOST'),
      port: this.getRequired<number>('POSTGRES_PORT'),
      username: this.getRequired<string>('POSTGRES_USER'),
      password: this.getRequired<string>('POSTGRES_PASSWORD'),
      database: this.getRequired<string>('POSTGRES_NAME'),
    };

		this.serverConf = {
			port: parseInt(this.getRequired<string>('HTTP_API_PORT'), 10)
		}

		this.githubServ = {
			queryInterval: parseInt(this.getRequired<string>('QUERY_INTERVAL'), 10)
		}

		this.logger.log('ENV variables read successfully')
  }

  getDbConfig(): IDbConfig {
    return this.dbConf;
  }

	getServerConf(): IHttpServer {
    return this.serverConf;
  }

	getGithubServ(): IGithubServ {
		return this.githubServ
	}

  private getRequired<T>(key: string): T {
    const value = this.nestConfigService.get<T>(key);
    if (value === undefined) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }
}
