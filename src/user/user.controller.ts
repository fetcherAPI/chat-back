import { CreateUserDto } from './dto/create-user.dto';
import {
  Body,
  Controller,
  Get,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @UsePipes(new ValidationPipe())
  async createUser(@Body() dto: CreateUserDto) {
    const { password, ...user } = await this.userService.create(dto);
    return user;
  }

  @Get('getAll')
  async getAll() {
    return this.userService.getAll();
  }
}
