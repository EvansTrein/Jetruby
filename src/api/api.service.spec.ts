import { Test, TestingModule } from '@nestjs/testing';
import { ApiService } from './api.service';
import { Repository } from 'typeorm';
import { Repo } from '../database/entity/repo.entity';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';

describe('ApiService', () => {
  let service: ApiService;
  let mockRepo: jest.Mocked<Repository<Repo>>;

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    // Creating a moc for Repository
    const mockRepoData: Repo = {
      id: 1,
      gitHub_id: 12345,
      name: 'repo1',
      html_url: 'http://example.com/repo1',
      description: 'Test repository',
      language: 'TypeScript',
      stargazers_count: 100,
    };

    mockRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<Repo>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiService,
        {
          provide: 'RepoRepository',
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<ApiService>(ApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRepo', () => {
    it('should return a repo by ID when key is a valid number', async () => {
      const mockRepoData: Repo = {
        id: 1,
        gitHub_id: 12345,
        name: 'repo1',
        html_url: 'http://example.com/repo1',
        description: 'Test repository',
        language: 'TypeScript',
        stargazers_count: 100,
      };
      mockRepo.findOne.mockResolvedValue(mockRepoData);

      const result = await service.getRepo('1');
      expect(result).toEqual(mockRepoData);
      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw an HttpException if the ID is invalid (<= 0)', async () => {
      await expect(service.getRepo('0')).rejects.toThrow(
        new HttpException(`Invalid ID: 0. ID must be greater than 0.`, HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw an HttpException if no repo is found by ID', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.getRepo('1')).rejects.toThrow(
        new HttpException(`Repo with ID 1 not found`, HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('getAllRepos', () => {
    it('should return all repos from the database', async () => {
      const mockRepos: Repo[] = [
        {
          id: 1,
          gitHub_id: 12345,
          name: 'repo1',
          html_url: 'http://example.com/repo1',
          description: 'Test repository',
          language: 'TypeScript',
          stargazers_count: 100,
        },
        {
          id: 2,
          gitHub_id: 67890,
          name: 'repo2',
          html_url: 'http://example.com/repo2',
          description: 'Another test repository',
          language: 'JavaScript',
          stargazers_count: 200,
        },
      ];
      mockRepo.find.mockResolvedValue(mockRepos);

      const result = await service.getAllRepos();
      expect(result).toEqual(mockRepos);
      expect(mockRepo.find).toHaveBeenCalled();
    });
  });
});
