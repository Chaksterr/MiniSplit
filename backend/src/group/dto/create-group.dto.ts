import { IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';

export class CreateGroupDto {
  @IsNotEmpty({ message: 'Nom du groupe requis' })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  name: string;

  @IsOptional()
  @IsString({ message: 'La description doit être une chaîne de caractères' })
  description?: string;
}
