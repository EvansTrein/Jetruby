import { Test, TestingModule } from '@nestjs/testing';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { BestReposService } from '../best-repos/best-repos.service';
import { Repo } from '../database/entity/repo.entity';
import { Logger } from '@nestjs/common';

describe('ApiController', () => {
  let controller: ApiController;
  let mockApiService: jest.Mocked<ApiService>;
  let mockBestReposService: jest.Mocked<BestReposService>;

  beforeEach(async () => {
		jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    // Creating mocs for dependencies
    mockApiService = {
      getRepo: jest.fn(),
      getAllRepos: jest.fn(),
    } as unknown as jest.Mocked<ApiService>;

    mockBestReposService = {
      resetTimer: jest.fn(),
    } as unknown as jest.Mocked<BestReposService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiController],
      providers: [
        {
          provide: ApiService,
          useValue: mockApiService,
        },
        {
          provide: BestReposService,
          useValue: mockBestReposService,
        },
      ],
    }).compile();

    controller = module.get<ApiController>(ApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRepo', () => {
    it('should call apiService.getRepo with the correct key and return the result', async () => {
      const mockRepoData: Repo = {
        id: 1,
        gitHub_id: 12345,
        name: 'repo1',
        html_url: 'http://example.com/repo1',
        description: 'Test repository',
        language: 'TypeScript',
        stargazers_count: 100,
      };
      const key = '1';
      mockApiService.getRepo.mockResolvedValue(mockRepoData);

      const result = await controller.getRepo(key);

      expect(result).toEqual(mockRepoData);
      expect(mockApiService.getRepo).toHaveBeenCalledWith(key);
    });
  });

  describe('getAllRepos', () => {
    it('should call apiService.getAllRepos and return the result', async () => {
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
      mockApiService.getAllRepos.mockResolvedValue(mockRepos);

      const result = await controller.getAllRepos();

      expect(result).toEqual(mockRepos);
      expect(mockApiService.getAllRepos).toHaveBeenCalled();
    });
  });

  describe('resetTimer', () => {
    it('should call bestReposService.resetTimer', () => {
      controller.resetTimer();

      expect(mockBestReposService.resetTimer).toHaveBeenCalled();
    });
  });
});