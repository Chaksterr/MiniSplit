import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { ActivityAction } from '../activity.entity';

export class CreateActivityDto {
  @IsNotEmpty({ message: 'ID utilisateur requis' })
  @IsNumber({}, { message: 'ID utilisateur invalide' })
  userId: number;

  @IsOptional()
  @IsNumber({}, { message: 'ID du groupe invalide' })
  groupId?: number;

  @IsNotEmpty({ message: 'Action requise' })
  @IsEnum(ActivityAction, { message: 'Action invalide' })
  action: ActivityAction;

  @IsOptional()
  @IsString({ message: 'Le type d\'entité doit être une chaîne' })
  entityType?: string;

  @IsOptional()
  @IsNumber({}, { message: 'ID de l\'entité invalide' })
  entityId?: number;

  @IsOptional()
  details?: any;
}
