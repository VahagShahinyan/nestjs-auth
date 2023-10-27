import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { json, urlencoded } from 'express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NestConfigService } from './config/nest-config.service';
import { NestConfigModule } from './config/nest-config.module';
import { SnakeCaseNamingStrategy } from './config/snake-case-naming.strategy';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    NestConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [NestConfigModule],
      inject: [NestConfigService],
      useFactory: (nestConfigService: NestConfigService) => {
        return {
          type: 'postgres',
          host: nestConfigService.host,
          port: nestConfigService.port,
          username: nestConfigService.username,
          password: nestConfigService.password,
          database: nestConfigService.database,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
          logging: true,
          namingStrategy: new SnakeCaseNamingStrategy(),
        };
      },
    }),
    UserModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    },
  ],
})
export class AppModule implements NestModule {
  constructor(private readonly nestConfigService: NestConfigService) {}
  configure(consumer: MiddlewareConsumer) {
    const jsonLimitSize = this.nestConfigService.bodyJsonSize;
    const urlencodedLimitSize = this.nestConfigService.bodyUrlencodedSize;

    consumer.apply(json({ limit: jsonLimitSize })).forRoutes('*');
    consumer
      .apply(urlencoded({ extended: true, limit: urlencodedLimitSize }))
      .forRoutes('*');
  }
}
