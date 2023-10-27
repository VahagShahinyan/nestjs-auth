import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { UserController } from './user.controller';
import { ConfigService } from '@nestjs/config';
import { NestConfigModule } from '../config/nest-config.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [NestConfigModule, TypeOrmModule.forFeature([UserEntity])],
  providers: [UserService, ConfigService, JwtService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
