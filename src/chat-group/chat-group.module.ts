import { Module } from '@nestjs/common';
import { ChatGroupService } from './chat-group.service';
import { ChatGroupController } from './chat-group.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [ChatGroupController],
  providers: [ChatGroupService, PrismaService],
})
export class ChatGroupModule {}
