import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../../application/dtos/category.dto';
import { CreateCategoryUseCase } from '../../application/use-cases/categories/create-category.use-case';
import { GetCategoriesUseCase } from '../../application/use-cases/categories/get-categories.use-case';
import { UpdateCategoryUseCase } from '../../application/use-cases/categories/update-category.use-case';
import { DeleteCategoryUseCase } from '../../application/use-cases/categories/delete-category.use-case';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly getCategoriesUseCase: GetCategoriesUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
  ) {}

  @Post()
  async create(@CurrentUser() user: any, @Body() dto: CreateCategoryDto) {
    const category = await this.createCategoryUseCase.execute(
      user.id,
      dto.name,
      dto.type,
    );
    return {
      id: category.id,
      name: category.name,
      type: category.type,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  @Get()
  async findAll(@CurrentUser() user: any) {
    const categories = await this.getCategoriesUseCase.execute(user.id);
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      type: category.type,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));
  }

  @Put(':id')
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    await this.updateCategoryUseCase.execute(user.id, id, dto.name);
    return { message: 'Category updated successfully' };
  }

  @Delete(':id')
  async delete(@CurrentUser() user: any, @Param('id') id: string) {
    await this.deleteCategoryUseCase.execute(user.id, id);
    return { message: 'Category deleted successfully' };
  }
}
