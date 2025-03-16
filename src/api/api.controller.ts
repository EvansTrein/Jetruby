import { Controller, Get, Logger, Param } from '@nestjs/common';
import { ApiService } from './api.service';
import { Repo } from 'src/database/entity/repo.entity';

@Controller('api')
export class ApiController {
  private readonly logger: Logger = new Logger(ApiController.name);

  constructor(private readonly apiService: ApiService) {}

  @Get('/repo/:key')
  async getRepo(@Param('key') key: string): Promise<Repo> {
    const req = await this.apiService.getRepo(key);
    return req;
  }

  @Get('/repo')
  async getAllRepos(): Promise<Repo[]> {
    const req = await this.apiService.getAllRepos();
    return req;
  }
}
