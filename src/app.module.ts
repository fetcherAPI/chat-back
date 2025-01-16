import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { ChatGroupModule } from './chat-group/chat-group.module';

@Module({
  imports: [ConfigModule.forRoot(), PrismaModule, AuthModule, UserModule, ChatModule, ChatGroupModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
