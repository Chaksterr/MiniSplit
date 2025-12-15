import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  // ========================================
  // ROUTES SPÉCIFIQUES (AVANT LES ROUTES DYNAMIQUES)
  // ========================================

  @Get('with-budgets')
  findAllWithUserBudgets(@CurrentUser() user: any) {
    return this.categoryService.findAllWithUserBudgets(user?.id);
  }

  @Get('user/budgets')
  getUserBudgets(@CurrentUser() user: any) {
    return this.categoryService.getUserBudgets(user.id);
  }

  @Get('group/:groupId')
  findByGroup(@Param('groupId') groupId: number) {
    return this.categoryService.findByGroup(groupId);
  }

  // ========================================
  // ROUTES DYNAMIQUES (APRÈS LES ROUTES SPÉCIFIQUES)
  // ========================================

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findById(id);
  }

  @Get(':id/budget')
  getUserBudget(
    @Param('id', ParseIntPipe) categoryId: number,
    @CurrentUser() user: any,
  ) {
    return this.categoryService.getUserBudget(user.id, categoryId);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.delete(id);
  }

  // ========================================
  // ENDPOINTS POUR LES BUDGETS PERSONNELS
  // ========================================

  @Post(':id/budget')
  setUserBudget(
    @Param('id', ParseIntPipe) categoryId: number,
    @Body('budgetLimit') budgetLimit: number,
    @CurrentUser() user: any,
  ) {
    return this.categoryService.setUserBudget(user.id, +categoryId, +budgetLimit);
  }

  @Delete(':id/budget')
  deleteUserBudget(
    @Param('id', ParseIntPipe) categoryId: number,
    @CurrentUser() user: any,
  ) {
    return this.categoryService.deleteUserBudget(user.id, categoryId);
  }
}
