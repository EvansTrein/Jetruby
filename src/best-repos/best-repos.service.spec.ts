import { Test, TestingModule } from '@nestjs/testing';
import { BestReposService } from './best-repos.service';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '../config/config.service';
import { of, throwError } from 'rxjs';
import { Logger } from '@nestjs/common';

describe('BestReposService', () => {
  let service: BestReposService;
  let mockRepo: jest.Mocked<Repository<any>>;
  let mockHttpService: jest.Mocked<HttpService>;
  let mockConfigService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    // Creating mocs for dependencies
    mockRepo = {
      find: jest.fn().mockResolvedValue([{ gitHub_id: 1 }, { gitHub_id: 2 }]),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<any>>;

    mockHttpService = {
      get: jest.fn(),
      axiosRef: {
        getUri: jest
          .fn()
          .mockReturnValue(
            'https://api.github.com/search/repositories?q=stars:%3E1000&sort=stars&order=desc&page=1&per_page=20',
          ),
      },
    } as unknown as jest.Mocked<HttpService>;

    mockConfigService = {
      getGithubServ: jest.fn().mockReturnValue({
        queryInterval: 60000,
      }),
    } as unknown as jest.Mocked<ConfigService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BestReposService,
        {
          provide: 'RepoRepository',
          useValue: mockRepo,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<BestReposService>(BestReposService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initializeActualIdsToDB', () => {
    it('should initialize actualIdsToDB with existing gitHub_ids from the database', async () => {
      await service['initializeActualIdsToDB']();
      expect(service['actualIdsToDB']).toEqual([1, 2]);
    });

    it('should log an error if database query fails', async () => {
      mockRepo.find.mockRejectedValue(new Error('Database error'));
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');
      await service['initializeActualIdsToDB']();
      expect(loggerSpy).toHaveBeenCalledWith('Error initializing actualIdsToDB:', 'Database error');
    });
  });

  describe('handleInterval', () => {
    it('should fetch repositories from GitHub API and save new ones to the database', async () => {
      const mockResponse = {
        data: {
          total_count: 20,
          items: [
            {
              id: 1,
              name: 'repo1',
              html_url: 'http://example.com/repo1',
              description: 'desc1',
              language: 'JS',
              stargazers_count: 1000,
            },
            {
              id: 2,
              name: 'repo2',
              html_url: 'http://example.com/repo2',
              description: 'desc2',
              language: 'TS',
              stargazers_count: 2000,
            },
          ],
        },
      };
      mockHttpService.get.mockReturnValue(of(mockResponse as any));

      service['actualIdsToDB'] = [1]; // Assume that the repository with id=1 already exists in the database

      const loggerDebugSpy = jest.spyOn(Logger.prototype, 'debug');
      const loggerLogSpy = jest.spyOn(Logger.prototype, 'log');

      await service.handleInterval();

      expect(mockHttpService.get).toHaveBeenCalled();
      expect(loggerDebugSpy).toHaveBeenCalledWith(
        'Request to URL: https://api.github.com/search/repositories?q=stars:%3E1000&sort=stars&order=desc&page=1&per_page=20',
      );
      expect(loggerDebugSpy).toHaveBeenCalledWith('20 repositories were found, 2 were downloaded from them');
      expect(loggerDebugSpy).toHaveBeenCalledWith(
        '1 repositories left need to be saved as they are not in the database',
      );
      expect(mockRepo.save).toHaveBeenCalledWith([
        {
          gitHub_id: 2,
          name: 'repo2',
          html_url: 'http://example.com/repo2',
          description: 'desc2',
          language: 'TS',
          stargazers_count: 2000,
        },
      ]);
      expect(loggerLogSpy).toHaveBeenCalledWith('New repository id successfully saved in the service');
    });

    it('should log an error if fetching repositories fails', async () => {
      const mockError = new Error('API error');
      mockHttpService.get.mockReturnValue(throwError(() => mockError));
      const loggerErrorSpy = jest.spyOn(Logger.prototype, 'error');

      await service.handleInterval();

      expect(loggerErrorSpy).toHaveBeenCalledWith('Error fetching repositories:', mockError.message);
    });
  });
});
