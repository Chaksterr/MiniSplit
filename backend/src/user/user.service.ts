import { Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { NotFoundException, ValidationException, DuplicateException } from '../common/exceptions';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userReposistory: Repository<User>,
  ) {}

  //Create user
  async create(userData: CreateUserDto){
    // Validate required fields
    if (!userData.name || !userData.email || !userData.password) {
      throw new ValidationException(
        'Nom, email et mot de passe requis'
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new ValidationException(
        "Email invalide"
      );
    }

    // Check if email already exists
    const existingUser = await this.userReposistory.findOne({
      where: { email: userData.email }
    });

    if (existingUser) {
      throw new DuplicateException('Utilisateur', 'email', userData.email);
    }

    // Validate password length
    if (userData.password.length < 6) {
      throw new ValidationException(
        'Mot de passe trop court (minimum 6 caractères)'
      );
    }

    try {
      const user = this.userReposistory.create(userData);
      return await this.userReposistory.save(user);
    } catch (error) {
      throw new ValidationException(
        "Impossible de créer l'utilisateur"
      );
    }
  }

  //Get all users
   async findAll(){
    return this.userReposistory.find();
  }

  //Get user by id
  async findById(id: number){
    if (!id || id <= 0) {
      throw new ValidationException(
        "ID invalide"
      );
    }

    const user = await this.userReposistory.findOneBy({id});
    
    if (!user) {
      throw new NotFoundException('Utilisateur', id);
    }

    return user;
  }

  //Get user by name
  async findByName(name: string){
    if (!name || name.trim().length === 0) {
      throw new ValidationException(
        'Nom requis'
      );
    }

    const user = await this.userReposistory.findOneBy({name});
    
    if (!user) {
      throw new NotFoundException('Utilisateur', name);
    }

    return user;
  }

  //Get user by email (pour JWT authentication)
  async findByEmail(email: string): Promise<User | null> {
    if (!email || email.trim().length === 0) {
      return null;
    }

    return this.userReposistory.findOne({
      where: { email }
    });
  }

  //Find one user (alias pour findById, utilisé par JWT Strategy)
  async findOne(id: number): Promise<User | null> {
    if (!id || id <= 0) {
      return null;
    }

    return this.userReposistory.findOne({
      where: { id }
    });
  }
  
  //Update user
  async update(id: number, updateData: UpdateUserDto){
    // Check if user exists
    await this.findById(id);

    // Validate email if provided
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        throw new ValidationException(
          "Email invalide"
        );
      }

      // Check if email already used by another user
      const existingUser = await this.userReposistory.findOne({
        where: { email: updateData.email }
      });

      if (existingUser && existingUser.id !== id) {
        throw new DuplicateException('Utilisateur', 'email', updateData.email);
      }
    }

    // Validate password if provided
    if (updateData.password && updateData.password.length < 6) {
      throw new ValidationException(
        'Mot de passe trop court (minimum 6 caractères)'
      );
    }

    const result = await this.userReposistory.update(id, updateData);

    if (result.affected === 0) {
      throw new NotFoundException('Utilisateur', id);
    }

    return this.findById(id);
  }
  
  //Delete user
  async delete(id: number){
    // Check if user exists
    await this.findById(id);

    const result = await this.userReposistory.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Utilisateur', id);
    }

    return {
      message: 'Utilisateur supprimé avec succès',
      id
    };
  }
  
}
