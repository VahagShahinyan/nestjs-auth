import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { getJWTConfig } from './jwt-config/jwt.config';
import { UserModule } from '../user/user.module';
import { NestConfigModule } from '../config/nest-config.module';
import { NestConfigService } from '../config/nest-config.service';

@Module({
  imports: [
    NestConfigModule,
    JwtModule.registerAsync({
      imports: [NestConfigModule],
      inject: [NestConfigService],
      useFactory: getJWTConfig,
    }),
    UserModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
