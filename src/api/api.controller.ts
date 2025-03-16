import { Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { ApiService } from './api.service';
import { Repo } from 'src/database/entity/repo.entity';
import { BestReposService } from 'src/best-repos/best-repos.service';

@Controller('api')
export class ApiController {
  private readonly logger: Logger = new Logger(ApiController.name);

  constructor(
    private readonly apiService: ApiService,
    private readonly bestReposService: BestReposService,
  ) {}

  @Get('/repo/:key')
  async getRepo(@Param('key') key: string): Promise<Repo> {
		this.logger.debug(`call getRepo, param - ${key}`)
    const req = await this.apiService.getRepo(key);
    return req;
  }
	
  @Get('/repo')
  async getAllRepos(): Promise<Repo[]> {
		this.logger.debug(`call getAllRepos`)
    const req = await this.apiService.getAllRepos();
    return req;
  }
	
  @Post('/reset')
  resetTimer(): void {
		this.logger.debug(`call resetTimer`)
    this.bestReposService.resetTimer();
  }
}
