import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';

interface IPayload {
  receiverId: string;
  senderId: string;
}

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private activeUsers: Map<string, { userId: string; activeChatId?: string }> =
    new Map(); // Map<SocketId, UserId>
  constructor(
    private jwtService: JwtService,
    private readonly chatService: ChatService,
    private user: UserService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.headers.authorization;
      if (!token) throw new Error('Unauthorized');
      console.log('token', token.split(' ')[1]);
      const decoded = this.extractPayload(token);
      const user = await this.user.getById(decoded.id);
      if (!user) throw new Error('Unauthorized');
      this.activeUsers.set(client.id, { userId: user.id });
      console.log('this.ac', this.activeUsers);
    } catch (error) {
      console.log('Ошибка авторизации:', error);
      //   //   client.disconnect();
    }
  }

  handleDisconnect(client: any) {
    const userData = this.activeUsers.get(client.id);
    if (userData) {
      console.log(`User ${userData.userId} disconnected`);
    }
    this.activeUsers.delete(client.id);
  }

  @SubscribeMessage('createChat')
  async create(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: CreateChatDto,
  ) {
    console.log('dto', dto);
    const chatId = this.getChatId(dto.receiverId, dto.senderId);
    const existetChat = await this.chatService.checkIsChatExsit(chatId);
    if (!existetChat?.id) {
      const newChat = await this.chatService.createChat(chatId);
      client.emit('chatCreated', newChat);
      return newChat;
    }
    client.emit('chatCreated', existetChat);
    return existetChat;
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    client: Socket,
    payload: { receiverId: string; text: string; senderId: string },
  ) {
    const chatId = this.getChatId(payload.receiverId, payload.senderId);
    const message = await this.chatService.createMessage({
      text: payload.text,
      senderId: payload.senderId,
      receiverId: payload.receiverId,
      chatId,
    });

    // Отправляем сообщение только если активный чат совпадает
    for (const [socketId, userData] of this.activeUsers.entries()) {
      if (
        userData.userId === payload.receiverId &&
        userData.activeChatId === chatId
      ) {
        this.server.to(socketId).emit('receiveMessage', message);
        break;
      }
    }

    // Обновляем интерфейс отправителя
    for (const [socketId, userData] of this.activeUsers.entries()) {
      if (userData.userId === payload.senderId) {
        this.server.to(socketId).emit('receiveMessage', message);
      }
    }
  }

  @SubscribeMessage('fetchMessages')
  async fetchMessages(
    client: Socket,
    payload: { receiverId: string; senderId: string },
  ) {
    const messages = await this.chatService.getMessagesByChatId(
      this.getChatId(payload.receiverId, payload.senderId),
    );

    client.emit('messagesHistory', messages);
  }

  @SubscribeMessage('joinChat')
  joinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() { receiverId, senderId }: IPayload,
  ) {
    const userData = this.activeUsers.get(client.id);
    const chatId = this.getChatId(receiverId, senderId);
    if (userData) {
      this.activeUsers.set(client.id, { ...userData, activeChatId: chatId });
      console.log(`User ${userData.userId} joined chat ${chatId}`);
    }
  }

  @SubscribeMessage('findAllChat')
  findAll() {
    return this.chatService.findAll();
  }

  @SubscribeMessage('findOneChat')
  findOne(@MessageBody() id: number) {
    return this.chatService.findOne(id);
  }

  @SubscribeMessage('updateChat')
  update(@MessageBody() updateChatDto: UpdateChatDto) {
    return this.chatService.update(updateChatDto.id, updateChatDto);
  }

  @SubscribeMessage('removeChat')
  remove(@MessageBody() id: number) {
    return this.chatService.remove(id);
  }
  private getChatId = (receiverId: string, senderId: string) => {
    return createHash('sha256')
      .update([receiverId, senderId].sort().join('-'))
      .digest('hex');
  };

  async sendMessageToRoom(chatId: string, message: any) {
    this.server.to(chatId).emit('receiveMessage', message);
    console.log(`Message sent to room ${chatId}:`, message);
  }

  private extractPayload = (token: string) => {
    try {
      // Убираем префикс "Bearer" и получаем сам токен
      const tokenParts = token.split(' ');
      if (tokenParts.length !== 2) {
        throw new Error('Invalid token format');
      }

      const jwt = tokenParts[1]; // Берем сам токен
      const payloadBase64 = jwt.split('.')[1]; // Вторая часть токена

      if (!payloadBase64) {
        throw new Error('Payload is missing');
      }

      const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
      const payload = JSON.parse(payloadJson);

      return payload;
    } catch (error) {
      console.error('Error extracting payload:', error);
      return null;
    }
  };
}
