import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserCreateDto } from './dto/user-create.dto';
import { UserEntity } from './user.entity';
import { UserUpdateDto } from './dto/user-update.dto';
import { AuthGuard } from '../auth/guard/auth.guard';
import { USER_NOT_FOUND_ERROR } from './user-error.message';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(
    @Body() createUserDto: UserCreateDto,
  ): Promise<Omit<UserEntity, 'password'>> {
    return this.userService.create(createUserDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOneById(@Param('id') id: number) {
    const getUser = await this.userService.findOneById(id);
    if (!getUser) {
      throw new HttpException(USER_NOT_FOUND_ERROR, HttpStatus.NOT_FOUND);
    }
    return getUser;
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  updateById(@Param('id') id: number, @Body() userUpdateDto: UserUpdateDto) {
    return this.userService.updateById(id, userUpdateDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async removeById(@Param('id') id: number) {
    return this.userService.removeById(id);
  }
}
