import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NestConfigService {
  constructor(private configService: ConfigService) {}
  get host(): string {
    return this.configService.get<string>('HOST');
  }
  get port(): number {
    return this.configService.get<number>('PORT');
  }
  get password(): string {
    return this.configService.get<string>('PASSWORD');
  }
  get username(): string {
    return this.configService.get<string>('USERNAME');
  }
  get database(): string {
    return this.configService.get<string>('DATABASE');
  }
  get bodyJsonSize(): string {
    return this.configService.get<string>('BODY_JSON_SIZE', '50mb');
  }
  get bodyUrlencodedSize(): string {
    return this.configService.get<string>('BODY_URL_ENCODED_SIZE', '50mb');
  }

  get appPort(): number {
    return +this.configService.get<number>('APP_PORT', 3000);
  }

  get jwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET', 'dkjekjdbke');
  }

  get accessTokenExpire(): number {
    return +this.configService.get<number>('ACCESS_TOKEN_EXPIRE', 24 * 3600);
  }

  get salt(): number {
    return +this.configService.get<number>('SALT', 10);
  }
}
