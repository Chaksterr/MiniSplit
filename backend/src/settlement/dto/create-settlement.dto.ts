import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum, IsDateString, Min } from 'class-validator';
import { SettlementStatus } from '../settlement.entity';

export class CreateSettlementDto {
  @IsNotEmpty({ message: 'ID de l\'utilisateur qui paie requis' })
  @IsNumber({}, { message: 'ID de l\'utilisateur qui paie invalide' })
  fromUserId: number;

  @IsNotEmpty({ message: 'ID de l\'utilisateur qui reçoit requis' })
  @IsNumber({}, { message: 'ID de l\'utilisateur qui reçoit invalide' })
  toUserId: number;

  @IsNotEmpty({ message: 'Montant requis' })
  @IsNumber({}, { message: 'Le montant doit être un nombre' })
  @Min(0.01, { message: 'Le montant doit être positif' })
  amount: number;

  @IsNotEmpty({ message: 'ID du groupe requis' })
  @IsNumber({}, { message: 'ID du groupe invalide' })
  groupId: number;

  @IsOptional()
  @IsDateString({}, { message: 'Format de date invalide' })
  date?: string;

  @IsOptional()
  @IsEnum(SettlementStatus, { message: 'Statut invalide' })
  status?: SettlementStatus;

  @IsOptional()
  @IsString({ message: 'Les notes doivent être une chaîne de caractères' })
  notes?: string;

  @IsOptional()
  @IsString({ message: 'L\'image doit être une chaîne de caractères' })
  proofImage?: string;
}
