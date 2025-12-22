import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums';
import { AutoReplyService } from './auto-reply.service';
import { CreateAutoReplyTemplateDto, UpdateAutoReplyTemplateDto } from './dto';

@Controller('auto-reply-templates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AutoReplyController {
  constructor(private readonly autoReplyService: AutoReplyService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateAutoReplyTemplateDto) {
    return this.autoReplyService.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findAll(@Query('categoryId') categoryId?: string) {
    return this.autoReplyService.findAll(categoryId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.autoReplyService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAutoReplyTemplateDto,
  ) {
    return this.autoReplyService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.autoReplyService.remove(id);
  }
}
