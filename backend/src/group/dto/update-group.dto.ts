import { IsOptional, IsString, IsIn } from 'class-validator';

export class UpdateGroupDto {
  @IsOptional()
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'La description doit être une chaîne de caractères' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'La catégorie doit être une chaîne de caractères' })
  @IsIn(['travel', 'sport', 'food', 'entertainment', 'work', 'family', 'friends', 'other'], {
    message: 'Catégorie invalide'
  })
  category?: string;
}
