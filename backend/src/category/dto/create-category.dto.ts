import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'Nom requis' })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  name: string;

  @IsOptional()
  @IsString({ message: 'L\'icône doit être une chaîne de caractères' })
  icon?: string;

  @IsOptional()
  @IsString({ message: 'La couleur doit être une chaîne de caractères' })
  color?: string;

  @IsOptional()
  @IsBoolean({ message: 'isDefault doit être un booléen' })
  isDefault?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'ID de l\'utilisateur invalide' })
  createdBy?: number;

  @IsOptional()
  @IsNumber({}, { message: 'ID du groupe invalide' })
  groupId?: number;
}
