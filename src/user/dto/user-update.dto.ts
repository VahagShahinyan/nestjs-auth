import { UserCreateDto } from './user-create.dto';
import { PartialType } from '@nestjs/mapped-types';
export class UserUpdateDto extends PartialType(UserCreateDto) {}
