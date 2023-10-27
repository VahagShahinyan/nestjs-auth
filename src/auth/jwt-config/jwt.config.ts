import { JwtModuleOptions } from '@nestjs/jwt';
import { NestConfigService } from '../../config/nest-config.service';

export const getJWTConfig = async (
  nestConfigService: NestConfigService,
): Promise<JwtModuleOptions> => {
  return {
    secret: nestConfigService.jwtSecret,
  };
};
