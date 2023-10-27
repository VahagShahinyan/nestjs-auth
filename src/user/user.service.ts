import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { genSalt, hash } from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { UserUpdateDto } from './dto/user-update.dto';
import { sign } from 'jsonwebtoken';
import { UserCreateDto } from './dto/user-create.dto';
import { NestConfigService } from '../config/nest-config.service';
import {
  USER_EMAIL_EXIST_ERROR,
  USER_NOT_FOUND_ERROR,
} from './user-error.message';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly nestConfigService: NestConfigService,
  ) {}

  async create(createUserDto: UserCreateDto) {
    const { email, password, name } = createUserDto;
    const getUser = await this.getUserByEmail(email);
    if (getUser) {
      throw new HttpException(USER_EMAIL_EXIST_ERROR, HttpStatus.CONFLICT);
    }
    const getSalt = this.nestConfigService.salt;

    const salt = await genSalt(getSalt);

    const newUser = new UserEntity();
    newUser.email = email;
    newUser.password = await hash(password, salt);
    newUser.name = name;
    return this.userRepository.save(newUser);
  }

  async getUserByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }

  async getUserByEmailWithPassword(email: string) {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where({ email })
      .getOne();
  }

  async updateById(
    id: number,
    updateUserDto: UserUpdateDto,
  ): Promise<UserEntity> {
    const getUser = await this.findOneById(id);
    if (!getUser) {
      throw new HttpException(USER_NOT_FOUND_ERROR, HttpStatus.NOT_FOUND);
    }
    Object.assign(getUser, updateUserDto);
    return this.userRepository.save(getUser);
  }

  deleteAll() {
    return this.userRepository.delete({});
  }

  generateJwt(user: UserEntity): string {
    return sign(
      {
        id: user.id,
        email: user.email,
      },
      this.nestConfigService.jwtSecret,
    );
  }

  findAll() {
    return this.userRepository.find();
  }

  findOneById(id) {
    return this.userRepository.findOne({ where: { id } });
  }

  async removeById(id) {
    const getUser = await this.findOneById(id);
    if (!getUser) {
      throw new HttpException(USER_NOT_FOUND_ERROR, HttpStatus.NOT_FOUND);
    }
    await this.userRepository.remove(getUser);
    return;
  }
}
