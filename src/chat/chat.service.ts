import { Injectable } from '@nestjs/common';
import { CreateChatDto, CreateMessageDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}
  create(createChatDto: CreateChatDto) {
    return 'This action adds a new chat';
  }

  async createChat(chatId: string) {
    // Создаем запись в базе данных
    const chat = await this.prisma.chat.create({
      data: {
        id: chatId, // Используем наш составной id
      },
    });

    return chat.id;
  }

  async checkIsChatExsit(chatId) {
    const chat = await this.prisma.chat.findUnique({ where: { id: chatId } });
    console.log('chat2', chat);
    return chat;
  }

  async createMessage(dto: CreateMessageDto) {
    const message = await this.prisma.message.create({
      data: dto,
      include: { sender: true, receiver: true },
    });
    return message;
  }

  async findMany(params: any) {
    const messages = await this.prisma.message.findMany(params);
    return messages;
  }

  async getMessagesByChatId(chatId: string) {
    const messages = await this.prisma.message.findMany({
      where: {
        chatId: chatId,
      },
      include: {
        sender: true,
        receiver: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    return messages;
  }

  findAll() {
    return `This action returns all chat`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chat`;
  }

  update(id: number, updateChatDto: UpdateChatDto) {
    return `This action updates a #${id} chat`;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
}
