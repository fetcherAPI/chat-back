import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ChatGroupService } from './chat-group.service';
import { CreateChatGroupDto } from './dto/create-chat-group.dto';
import { UpdateChatGroupDto } from './dto/update-chat-group.dto';

@Controller('chat-group')
export class ChatGroupController {
  constructor(private readonly chatGroupService: ChatGroupService) {}

  @Post('/createGroup')
  create(@Body() createChatGroupDto: CreateChatGroupDto) {
    return this.chatGroupService.create(createChatGroupDto);
  }

  @Get('/allChats')
  findAll() {
    return this.chatGroupService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatGroupService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateChatGroupDto: UpdateChatGroupDto,
  ) {
    return this.chatGroupService.update(+id, updateChatGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatGroupService.remove(+id);
  }
}
