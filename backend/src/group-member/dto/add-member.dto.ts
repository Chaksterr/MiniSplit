import { IsNotEmpty, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class AddMemberDto {
  @IsNotEmpty({ message: 'ID utilisateur requis' })
  @IsNumber({}, { message: 'ID utilisateur invalide' })
  userId: number;

  @IsNotEmpty({ message: 'ID du groupe requis' })
  @IsNumber({}, { message: 'ID du groupe invalide' })
  groupId: number;

  @IsOptional()
  @IsBoolean({ message: 'isAdmin doit être un booléen' })
  isAdmin?: boolean;
}
