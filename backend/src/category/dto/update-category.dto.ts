import { IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'L\'icône doit être une chaîne de caractères' })
  icon?: string;

  @IsOptional()
  @IsString({ message: 'La couleur doit être une chaîne de caractères' })
  color?: string;

  @IsOptional()
  budgetLimit?: number | null;

  @IsOptional()
  @IsBoolean({ message: 'isDefault doit être un booléen' })
  isDefault?: boolean;
}
