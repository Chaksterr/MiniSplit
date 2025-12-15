import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  create(@Body() expenseData: CreateExpenseDto, @CurrentUser() user: any) {
    return this.expenseService.create(expenseData);
  }

  @Get()
  findAll() {
    return this.expenseService.findAll();
  }

  @Get('group/:groupId')
  findByGroup(@Param('groupId') groupId: number) {
    return this.expenseService.findByGroup(groupId);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.expenseService.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateData: UpdateExpenseDto, @CurrentUser() user: any) {
    return this.expenseService.update(id, updateData, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: number, @CurrentUser() user: any) {
    return this.expenseService.delete(id, user.id);
  }

  @Post(':id/attachments')
  @UseInterceptors(FilesInterceptor('files', 5, {
    storage: diskStorage({
      destination: './uploads/expenses',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `expense-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|pdf)$/)) {
        return cb(new BadRequestException('Seuls les fichiers JPG, PNG et PDF sont acceptés'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max
    },
  }))
  async uploadAttachments(
    @Param('id') id: number,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Aucun fichier fourni');
    }
    return this.expenseService.addAttachments(id, files.map(f => f.filename));
  }

  @Delete(':id/attachments/:filename')
  async deleteAttachment(
    @Param('id') id: number,
    @Param('filename') filename: string,
  ) {
    return this.expenseService.removeAttachment(id, filename);
  }
}
