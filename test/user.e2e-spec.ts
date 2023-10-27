import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserService } from '../src/user/user.service';
import { userFixture } from './fixtures/user.fixture';
import { Repository } from 'typeorm';
import { UserEntity } from '../src/user/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  USER_EMAIL_EXIST_ERROR,
  USER_NOT_FOUND_ERROR,
} from '../src/user/user-error.message';
import { AuthService } from '../src/auth/auth.service';

describe('User (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;
  let authService: AuthService;
  let userRepository: Repository<UserEntity>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    userService = moduleFixture.get<UserService>(UserService);
    authService = moduleFixture.get<AuthService>(AuthService);
    userRepository = moduleFixture.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  const createUserAndToken = async () => {
    const user = await userService.create(userFixture());
    const getAccessToken = await authService.generateToken({
      id: user.id,
      email: user.email,
    });
    return { user, getAccessToken };
  };

  describe('when attempting to create a user with accurate data', () => {
    it('should be success', async () => {
      await userRepository.delete({});
      const response = await request(app.getHttpServer())
        .post('/user')
        .send(userFixture());

      expect(response.status).toBe(HttpStatus.CREATED);
      const { id, email, name } = response.body;
      expect(id).toBeDefined();
      expect(email).toBe(userFixture().email);
      expect(name).toBe(userFixture().name);
    });
  });

  describe("when attempting to create a user, if the user's email already exists.", () => {
    it('should be error', async () => {
      await userRepository.delete({});
      await userService.create(userFixture());
      const response = await request(app.getHttpServer())
        .post('/user')
        .send(userFixture());
      expect(response.status).toBe(HttpStatus.CONFLICT);
      expect(response.body.message).toBe(USER_EMAIL_EXIST_ERROR);
    });
  });

  describe('when attempting to retrieve users when they exist', () => {
    it('should be success', async () => {
      await userRepository.delete({});
      const { user, getAccessToken } = await createUserAndToken();
      const response = await request(app.getHttpServer())
        .get(`/user/${user.id}`)
        .set('authorization', `Bearer ${getAccessToken}`);
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.id).toBe(user.id);
      expect(response.body.email).toBe(user.email);
      expect(response.body.name).toBe(user.name);
      expect(response.body.password).toBeUndefined();
      expect(response.body.createdAt).toBe(user.createdAt.toISOString());
      expect(response.body.updatedAt).toBe(user.updatedAt.toISOString());
    });
  });

  describe('when attempting to get a user by user ID, if the user does not exist', () => {
    it('should be error', async () => {
      await userRepository.delete({});
      const { user, getAccessToken } = await createUserAndToken();

      const response = await request(app.getHttpServer())
        .get(`/user/${user.id + 1}`)
        .set('authorization', `Bearer ${getAccessToken}`);
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.message).toBe(USER_NOT_FOUND_ERROR);
    });
  });

  describe('when attempting to update a user if the user already exists', () => {
    it('should be success', async () => {
      await userRepository.delete({});
      const { user, getAccessToken } = await createUserAndToken();

      const updateUserData = userFixture({
        name: 'newName',
        email: 'new@gmail.com',
      });
      const response = await request(app.getHttpServer())
        .patch(`/user/${user.id}`)
        .send(updateUserData)
        .set('authorization', `Bearer ${getAccessToken}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.id).toBe(user.id);
      expect(response.body.email).toBe(updateUserData.email);
      expect(response.body.name).toBe(updateUserData.name);
      expect(response.body.createdAt).toBe(user.createdAt.toISOString());
      expect(response.body.updatedAt).toBeDefined();
    });
  });

  describe('when attempting to update a user, if the user does not exist', () => {
    it('should be error', async () => {
      const { user, getAccessToken } = await createUserAndToken();

      const updateUserData = userFixture({
        name: 'newName',
        email: 'new@gmail.com',
      });
      const response = await request(app.getHttpServer())
        .patch(`/user/${user.id + 1}`)
        .send(updateUserData)
        .set('authorization', `Bearer ${getAccessToken}`);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.message).toBe(USER_NOT_FOUND_ERROR);
    });
  });

  describe('when attempting to delete a user if the user exists', () => {
    it('should be success', async () => {
      await userRepository.delete({});
      const { user, getAccessToken } = await createUserAndToken();

      const response = await request(app.getHttpServer())
        .delete(`/user/${user.id}`)
        .set('authorization', `Bearer ${getAccessToken}`);

      expect(response.status).toBe(HttpStatus.OK);
      const getUser = await userService.findOneById(user.id);
      expect(getUser).toBeNull();
    });
  });

  describe('when attempting to delete a user, if the user does not exist', () => {
    it('should be error', async () => {
      await userRepository.delete({});
      const { user, getAccessToken } = await createUserAndToken();

      const response = await request(app.getHttpServer())
        .delete(`/user/${user.id + 1}`)
        .set('authorization', `Bearer ${getAccessToken}`);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.message).toBe(USER_NOT_FOUND_ERROR);
    });
  });
});
