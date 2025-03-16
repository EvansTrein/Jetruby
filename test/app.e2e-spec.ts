import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { Repo } from '../src/database/entity/repo.entity';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let repoRepository: Repository<Repo>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    repoRepository = moduleFixture.get('RepoRepository');
  });

  afterAll(async () => {
    await app.close();
  });

	// database cleanup after test completion
  beforeEach(async () => {
    await repoRepository.clear();
  });

  describe('/api/repo/:key (GET)', () => {
    it('should return a repo by ID', async () => {
      const testRepo = repoRepository.create({
        id: 1,
        gitHub_id: 12345,
        name: 'repo1',
        html_url: 'http://example.com/repo1',
        description: 'Test repository',
        language: 'TypeScript',
        stargazers_count: 100,
      });
      await repoRepository.save(testRepo);

      const response = await request(app.getHttpServer()).get('/api/repo/1').expect(200);

      expect(response.body).toEqual({
        id: 1,
        gitHub_id: 12345,
        name: 'repo1',
        html_url: 'http://example.com/repo1',
        description: 'Test repository',
        language: 'TypeScript',
        stargazers_count: 100,
      });
    });

    it('should return 404 if repo is not found', async () => {
      await request(app.getHttpServer()).get('/api/repo/999').expect(404);
    });
  });

  describe('/api/repo (GET)', () => {
    it('should return all repos', async () => {
      const testRepos = [
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
      await repoRepository.save(testRepos);

      const response = await request(app.getHttpServer()).get('/api/repo').expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'repo1' }),
          expect.objectContaining({ name: 'repo2' }),
        ]),
      );
    });
  });
});
