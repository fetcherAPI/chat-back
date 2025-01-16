import { Injectable } from '@nestjs/common';
import { CreateChatGroupDto } from './dto/create-chat-group.dto';
import { UpdateChatGroupDto } from './dto/update-chat-group.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ChatGroupService {
  constructor(private prisma: PrismaService) {}

  create(createChatGroupDto: CreateChatGroupDto) {
    return this.prisma.chatGroup.create({ data: createChatGroupDto });
  }

  findAll() {
    return this.prisma.chatGroup.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} chatGroup`;
  }

  update(id: number, updateChatGroupDto: UpdateChatGroupDto) {
    return `This action updates a #${id} chatGroup`;
  }

  remove(id: number) {
    return `This action removes a #${id} chatGroup`;
  }
}
