import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Repo } from 'src/database/entity/repo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { IGitHubResponse } from './interfaces';
import { ConfigService } from 'src/config/config.service';

/* 
BestReposService is designed to periodically query popular GitHub repositories and store them in a database.

- Each time at startup, it retrieves all gitHub_id from the database
  and saves them to understand which repositories are not in the database yet
- Queries popular GitHub repositories via API.
- Filters new repositories that are not yet in the database (by `gitHub_id` field).
- Saves new repositories in the database.

`queryInterval`: the interval of requests to the GitHub API (in milliseconds) is set in the .ENV file and can be read here 
*/
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
    this.initializeActualIdsToDB();
  }

  onModuleInit(): void {
    this.startTimer();
    this.logger.debug('Interval started:', this.intervalReq);
  }

  onModuleDestroy(): void {
    this.clearTimer();
    this.logger.log('Interval cleared');
  }

  // ----------  timer control   ----------
  private startTimer(): void {
    this.clearTimer();
    this.intervalReq = setInterval(() => this.handleInterval(), this.intervalMs);
    this.logger.debug('Timer started with interval:', this.intervalMs);
  }

  private clearTimer(): void {
    if (this.intervalReq) {
      clearInterval(this.intervalReq);
      this.logger.debug('Timer cleared');
    }
  }

  public resetTimer(): void {
    this.logger.log('Resetting timer');
    this.clearTimer();
    this.startTimer();
  }
  // ---------------------------------------

  private async initializeActualIdsToDB(): Promise<void> {
    try {
      // Get all gitHub_ids from the database
      const existingRepos = await this.dbRepo.find({ select: ['gitHub_id'] });
      this.actualIdsToDB = existingRepos.map((repo) => repo.gitHub_id);

      this.logger.debug(`Initialized actualIdsToDB with ${this.actualIdsToDB.length} IDs`);
    } catch (error: unknown) {
      this.logger.error('Error initializing actualIdsToDB:', (error as Error).message);
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

      const fullUrl = this.httpService.axiosRef.getUri({ url, params });
      this.logger.debug(`Making request to URL: ${fullUrl}`);

      const reposResponce = response.data.items.map((item) => ({
        gitHub_id: item.id,
        name: item.name,
        html_url: item.html_url,
        description: item.description || undefined,
        language: item.language || undefined,
        stargazers_count: item.stargazers_count,
      }));

      this.logger.debug(
        `${response.data.total_count} repositories were found, ${reposResponce.length} were downloaded from them`,
      );

      // Filter repositories, leaving only those whose ids are missing in actualIdsToDB
      const newRepos = reposResponce.filter((repo) => !this.actualIdsToDB.includes(repo.gitHub_id));
      this.logger.debug(`${newRepos.length} repositories left need to be saved as they are not in the database`);

      if (newRepos.length > 0) {
        await this.dbRepo.save(newRepos);

        // Add new id to actualIdsToDB
        newRepos.forEach((repo) => this.actualIdsToDB.push(repo.gitHub_id));
        this.logger.log('New repository id successfully saved in the service');

        const newRepoIds = newRepos.map((repo) => repo.gitHub_id);
        this.logger.debug(`New repository IDs: ${JSON.stringify(newRepoIds)}`);
      }
    } catch (error: unknown) {
      this.logger.error('Error fetching repositories:', (error as Error).message);
    }
  }
}
