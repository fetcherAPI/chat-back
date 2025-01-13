import { Injectable } from '@nestjs/common';
import { hash } from 'argon2';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  getById(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  getByLogin(login: string) {
    return this.prisma.user.findUnique({
      where: {
        login,
      },
    });
  }

  async getAll() {
    return await this.prisma.user.findMany();
  }

  async create(dto: CreateUserDto) {
    const user = {
      ...dto,
      password: await hash(dto.password),
    };

    return this.prisma.user.create({
      data: user,
    });
  }
}
