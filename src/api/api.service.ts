import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Repo } from 'src/database/entity/repo.entity';

@Injectable()
export class ApiService {
  private readonly logger: Logger = new Logger(ApiService.name);

  constructor(@InjectRepository(Repo) private readonly dbRepo: Repository<Repo>) {}

  public async getRepo(key: string): Promise<Repo> {
    this.logger.debug(`call getRepo, key - ${key}`);
    const numKey = parseInt(key, 10);

    if (!isNaN(numKey)) {
      if (numKey <= 0) {
        throw new HttpException(`Invalid ID: ${numKey}. ID must be greater than 0.`, HttpStatus.BAD_REQUEST);
      }
      return this.findRepoById(numKey);
    } else {
      return this.findRepoByName(key.toLowerCase());
    }
  }

  public async getAllRepos(): Promise<Repo[]> {
    this.logger.debug('call getAllRepos');
    const repos = await this.dbRepo.find();
    return repos;
  }

  private async findRepoById(id: number): Promise<Repo> {
    const repo = await this.dbRepo.findOne({ where: { id: id } });

    if (!repo) {
      this.logger.warn(`Repo with ID ${id} not found`);
      throw new HttpException(`Repo with ID ${id} not found`, HttpStatus.NOT_FOUND);
    }
    return repo;
  }

  private async findRepoByName(name: string): Promise<Repo> {
    this.logger.debug(`call findRepoByName, name - ${name}`);
    const repo = await this.dbRepo
      .createQueryBuilder('repo')
      .where('LOWER(repo.name) = :name', { name: name.toLowerCase() })
      .getOne();

    if (!repo) {
      this.logger.warn(`Repo with name "${name}" not found`);
      throw new HttpException(`Repo with name "${name}" not found`, HttpStatus.NOT_FOUND);
    }
    return repo;
  }
}
