import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Exception lancée quand une ressource n'est pas trouvée
 */
export class NotFoundException extends HttpException {
  constructor(resourceName: string, identifier: string | number) {
    const message = `${resourceName} introuvable (ID: ${identifier})`;
    super(message, HttpStatus.NOT_FOUND);
  }
}

/**
 * Exception lancée quand les données fournies sont invalides
 */
export class ValidationException extends HttpException {
  constructor(message: string, details?: any) {
    const errorMessage = details 
      ? { message, details }
      : message;
    super(errorMessage, HttpStatus.BAD_REQUEST);
  }
}

/**
 * Exception lancée quand une ressource existe déjà
 */
export class DuplicateException extends HttpException {
  constructor(resourceName: string, fieldName: string, value: any) {
    const message = `${resourceName} avec ${fieldName} "${value}" existe déjà`;
    super(message, HttpStatus.CONFLICT);
  }
}

/**
 * Exception lancée pour les erreurs métier
 */
export class BusinessException extends HttpException {
  constructor(message: string, details?: any) {
    const errorMessage = details 
      ? { message, details }
      : message;
    super(errorMessage, HttpStatus.BAD_REQUEST);
  }
}
