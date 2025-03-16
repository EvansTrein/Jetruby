import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Repo } from 'src/database/entity/repo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { IGitHubResponse } from './interfaces';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class BestReposService {
  private readonly logger: Logger = new Logger(BestReposService.name);
  private readonly baseUrl: string = 'https://api.github.com';
  private readonly intervalMs: number;
  private intervalReq!: NodeJS.Timeout;
  private actualIdsToDB: number[] = [];

  constructor(
    @InjectRepository(Repo) private readonly dbRepo: Repository<Repo>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.intervalMs = configService.getGithubServ().queryInterval;
  }

  onModuleInit(): void {
    this.intervalReq = setInterval(() => this.handleInterval(), this.intervalMs);
    this.logger.debug('Interval started:', this.intervalReq);
  }

  onModuleDestroy(): void {
    if (this.intervalReq) {
      clearInterval(this.intervalReq);
      this.logger.log('Interval cleared.');
    }
  }

  async handleInterval(): Promise<void> {
    try {
      const url = `${this.baseUrl}/search/repositories`;
      const params = {
        q: 'stars:>1000',
        sort: 'stars',
        order: 'desc',
        page: 1,
        per_page: 20,
      };

      const response: AxiosResponse<IGitHubResponse, void> = await firstValueFrom(
        this.httpService.get<IGitHubResponse>(url, { params }),
      );

      const reposResponce = response.data.items.map((item) => ({
        id: item.id,
        name: item.name,
        html_url: item.html_url,
        description: item.description || null,
        language: item.language || null,
        stargazers_count: item.stargazers_count,
      }));

      this.logger.debug(
        `${response.data.total_count} repositories were found, ${reposResponce.length} were downloaded from them`,
      );

      // Filter repositories, leaving only those whose ids are missing in actualIdsToDB
      const newRepos = reposResponce.filter((repo) => !this.actualIdsToDB.includes(repo.id));
      this.logger.debug(`${newRepos.length} repositories left need to be saved as they are not in the database`);

      if (newRepos.length > 0) {
        // TODO: add to DB

        // Add new id to actualIdsToDB
        newRepos.forEach((repo) => this.actualIdsToDB.push(repo.id));
        this.logger.log('new repository id successfully saved in the service');

        const newRepoIds = newRepos.map((repo) => repo.id);
        this.logger.debug(`New repository IDs: ${JSON.stringify(newRepoIds)}`);
      }
    } catch (error: unknown) {
      this.logger.error('Error fetching repositories:', (error as Error).message);
    }
  }
}
