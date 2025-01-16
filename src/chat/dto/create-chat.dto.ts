export class CreateChatDto {
  receiverId: string;
  senderId: string;
}

export class CreateMessageDto {
  text: string;
  receiverId: string;
  senderId: string;
  chatId: string;
}

export class CreateMessageGroupDto {
  text: string;
  senderId: string;
  chatGroupId: string;
}
