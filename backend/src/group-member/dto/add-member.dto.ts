import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddMemberDto {
  @IsNotEmpty({ message: 'ID utilisateur requis' })
  @IsNumber({}, { message: 'ID utilisateur invalide' })
  userId: number;

  @IsNotEmpty({ message: 'ID du groupe requis' })
  @IsNumber({}, { message: 'ID du groupe invalide' })
  groupId: number;
}
