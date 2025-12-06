import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { NotFoundException, ValidationException } from '../common/exceptions';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(data: CreateCategoryDto) {
    const categoryData: any = {
      name: data.name,
      icon: data.icon || '📦',
      color: data.color || '#6366f1',
      isDefault: data.isDefault || false,
    };

    if (data.createdBy) {
      categoryData.createdBy = { id: data.createdBy };
    }

    if (data.groupId) {
      categoryData.group = { id: data.groupId };
    }

    const category = this.categoryRepository.create(categoryData);
    return await this.categoryRepository.save(category);
  }

  async findAll() {
    return this.categoryRepository.find({
      order: { isDefault: 'DESC', name: 'ASC' },
    });
  }

  async findByGroup(groupId: number) {
    return this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.createdBy', 'createdBy')
      .leftJoinAndSelect('category.group', 'group')
      .where('category.groupId = :groupId', { groupId })
      .orWhere('category.groupId IS NULL AND category.isDefault = true')
      .orderBy('category.isDefault', 'DESC')
      .addOrderBy('category.name', 'ASC')
      .getMany();
  }

  async findById(id: number) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Catégorie', id);
    }
    return category;
  }

  async update(id: number, data: UpdateCategoryDto) {
    const category = await this.findById(id);
    
    if (category.isDefault) {
      throw new ValidationException('Impossible de modifier une catégorie par défaut');
    }

    await this.categoryRepository.update(id, data);
    return this.findById(id);
  }

  async delete(id: number) {
    const category = await this.findById(id);
    
    if (category.isDefault) {
      throw new ValidationException('Impossible de supprimer une catégorie par défaut');
    }

    await this.categoryRepository.delete(id);
    return { message: 'Catégorie supprimée avec succès' };
  }
}
