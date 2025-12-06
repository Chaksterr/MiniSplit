import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { SettlementStatus } from '../settlement.entity';

export class UpdateSettlementDto {
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
