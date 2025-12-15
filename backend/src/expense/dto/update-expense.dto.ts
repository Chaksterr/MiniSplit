import { IsOptional, IsNumber, IsString, IsDateString, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UserRef {
  @IsNumber({}, { message: 'ID utilisateur invalide' })
  id: number;
}

export class UpdateExpenseDto {
  @IsOptional()
  @IsString({ message: 'Le titre doit être une chaîne de caractères' })
  title?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Le montant doit être un nombre' })
  @Min(0.01, { message: 'Montant invalide (doit être positif)' })
  amount?: number;

  @IsOptional()
  @IsString({ message: 'La description doit être une chaîne de caractères' })
  description?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Format de date invalide' })
  date?: string;

  @IsOptional()
  @IsNumber({}, { message: 'ID de la personne qui a payé invalide' })
  paidBy?: number;

  @IsOptional()
  @IsNumber({}, { message: 'ID de catégorie invalide' })
  categoryId?: number;

  @IsOptional()
  @IsArray({ message: 'Les participants doivent être un tableau' })
  participants?: number[];
}
