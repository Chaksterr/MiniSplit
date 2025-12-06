import { Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group} from './group.entity';
import { NotFoundException, ValidationException, DuplicateException } from '../common/exceptions';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private groupReposistory: Repository<Group>,
  ) {}

    //Create group
    async create(data: CreateGroupDto){
      // Validate required fields
      if (!data.name || data.name.trim().length === 0) {
        throw new ValidationException(
          'Nom du groupe requis'
        );
      }

      // Check if group name already exists
      const existingGroup = await this.groupReposistory.findOne({
        where: { name: data.name }
      });

      if (existingGroup) {
        throw new DuplicateException('Groupe', 'nom', data.name);
      }

      try {
        const group = this.groupReposistory.create(data);
        return await this.groupReposistory.save(group);
      } catch (error) {
        throw new ValidationException(
          'Impossible de créer le groupe'
        );
      }
    }

    //Get all groups
    async findAll(){
        return this.groupReposistory.find();
    }

    //Get group by id
    async findById(id: number){
        if (!id || id <= 0) {
          throw new ValidationException(
            'ID invalide'
          );
        }

        const group = await this.groupReposistory.findOneBy({id});

        if (!group) {
          throw new NotFoundException('Groupe', id);
        }

        return group;
    }

    //Find group by name
    async findByName(name: string){
      if (!name || name.trim().length === 0) {
        throw new ValidationException(
          'Nom du groupe requis'
        );
      }

      const group = await this.groupReposistory.findOneBy({name});

      if (!group) {
        throw new NotFoundException('Groupe', name);
      }

      return group;
    }

    //Update group
    async update(id: number, updateData: UpdateGroupDto){
        // Check if group exists
        await this.findById(id);

        // Validate name if provided
        if (updateData.name && updateData.name.trim().length === 0) {
          throw new ValidationException(
            'Nom du groupe requis'
          );
        }

        // Check if new name already used by another group
        if (updateData.name) {
          const existingGroup = await this.groupReposistory.findOne({
            where: { name: updateData.name }
          });

          if (existingGroup && existingGroup.id !== id) {
            throw new DuplicateException('Groupe', 'nom', updateData.name);
          }
        }

        const result = await this.groupReposistory.update(id, updateData);

        if (result.affected === 0) {
          throw new NotFoundException('Groupe', id);
        }

        return this.findById(id);
    }

    //Delete group
    async delete(id: number){
        // Check if group exists
        await this.findById(id);

        const result = await this.groupReposistory.delete(id);

        if (result.affected === 0) {
          throw new NotFoundException('Groupe', id);
        }

        return {
          message: 'Groupe supprimé avec succès',
          id
        };
    }
    
}

