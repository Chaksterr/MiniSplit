import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, Min, IsArray, ArrayMinSize } from 'class-validator';

export class CreateExpenseDto {
  @IsNotEmpty({ message: 'Titre requis' })
  @IsString({ message: 'Le titre doit être une chaîne de caractères' })
  title: string;

  @IsNotEmpty({ message: 'Montant requis' })
  @IsNumber({}, { message: 'Le montant doit être un nombre' })
  @Min(0.01, { message: 'Montant invalide (doit être positif)' })
  amount: number;

  @IsOptional()
  @IsString({ message: 'La description doit être une chaîne de caractères' })
  description?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Format de date invalide' })
  date?: string;

  @IsNotEmpty({ message: 'ID du payeur requis' })
  @IsNumber({}, { message: 'ID du payeur invalide' })
  paidBy: number;

  @IsNotEmpty({ message: 'ID du groupe requis' })
  @IsNumber({}, { message: 'ID du groupe invalide' })
  groupId: number;

  @IsNotEmpty({ message: 'Au moins un participant requis' })
  @IsArray({ message: 'Les participants doivent être un tableau' })
  @ArrayMinSize(1, { message: 'Au moins un participant requis' })
  @IsNumber({}, { each: true, message: 'Chaque participant doit être un ID valide' })
  participants: number[];

  @IsOptional()
  @IsNumber({}, { message: 'ID de la catégorie invalide' })
  categoryId?: number;
}
