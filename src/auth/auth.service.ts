import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  USER_NOT_FOUND_ERROR,
  USER_WRONG_PASSWORD_ERROR,
} from '../user/user-error.message';
import { compare } from 'bcryptjs';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { NestConfigService } from '../config/nest-config.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly nestConfigService: NestConfigService,
  ) {}

  async isCorrectPassword(password: string, hashedPassword: string) {
    return compare(password, hashedPassword);
  }
  async login(authLoginDto) {
    const { email, password } = authLoginDto;
    const getUser = await this.userService.getUserByEmailWithPassword(email);
    if (!getUser) {
      throw new HttpException(USER_NOT_FOUND_ERROR, HttpStatus.NOT_FOUND);
    }

    const isCorrectPassword = await this.isCorrectPassword(
      password,
      getUser.password,
    );
    if (!isCorrectPassword) {
      throw new HttpException(USER_WRONG_PASSWORD_ERROR, HttpStatus.FORBIDDEN);
    }

    const payload = { email, id: getUser.id };
    const accessToken = await this.generateToken(payload);
    return { accessToken };
  }
  async generateToken(
    payload,
    expiresIn = this.nestConfigService.accessTokenExpire,
  ) {
    return this.jwtService.signAsync(payload, { expiresIn });
  }

  decodeToken(token: string) {
    return this.jwtService.decode(token);
  }

  verifyToken(token) {
    return this.jwtService.verifyAsync(token, {
      secret: this.nestConfigService.jwtSecret,
    });
  }
}
