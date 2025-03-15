import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { Repo } from 'src/database/entity/repo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BestReposService {
  private readonly baseUrl = 'https://api.github.com';

  constructor(
    @InjectRepository(Repo) private readonly dbRepo: Repository<Repo>,
    private readonly httpService: HttpService,
  ) {}

  @Interval(10000)
  async handleInterval() {
    try {
      const url = `${this.baseUrl}/search/repositories`;
      const params = {
        q: 'stars:>1',
        sort: 'stars',
        order: 'desc',
        page: 1,
        per_page: 20,
      };

      const response = await firstValueFrom(this.httpService.get(url, { params }));
			console.log('Fetched repositories:', response.data.items);

    } catch (error: unknown) {
      console.error('Error fetching repositories:', (error as Error).message);
    }
  }
}
