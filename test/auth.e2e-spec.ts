import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserService } from '../src/user/user.service';
import { Repository } from 'typeorm';
import { UserEntity } from '../src/user/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { userFixture } from './fixtures/user.fixture';
import {
  USER_NOT_FOUND_ERROR,
  USER_WRONG_PASSWORD_ERROR,
} from '../src/user/user-error.message';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;
  let userRepository: Repository<UserEntity>;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    userService = moduleFixture.get<UserService>(UserService);
    userRepository = moduleFixture.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('when attempting to log in with accurate request data', () => {
    it('should be success', async () => {
      await userRepository.delete({});
      await userService.create(userFixture());

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userFixture().email,
          password: userFixture().password,
        });
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.accessToken).toBeDefined();
    });
  });

  describe("when attempting to log in, if the user's password is incorrect", () => {
    it('should be error', async () => {
      await userRepository.delete({});
      await userService.create(userFixture());
      const wrongPassword = userFixture().password + 'prefix';
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userFixture().email,
          password: wrongPassword,
        });
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      expect(response.body.message).toBe(USER_WRONG_PASSWORD_ERROR);
    });
  });

  describe('when attempting to log in, if the user does not exist', () => {
    it('should be error', async () => {
      await userRepository.delete({});

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userFixture().email,
          password: userFixture().password,
        });
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.message).toBe(USER_NOT_FOUND_ERROR);
    });
  });
});
