import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ImageValidationPipe implements PipeTransform {
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  private readonly maxSize = 5 * 1024 * 1024; // 5MB

  transform(
    file: Express.Multer.File | Express.Multer.File[],
  ): Express.Multer.File | Express.Multer.File[] {
    if (!file) {
      return file;
    }

    if (Array.isArray(file)) {
      file.forEach((f) => this.validateFile(f));
    } else {
      this.validateFile(file);
    }

    return file;
  }

  private validateFile(file: Express.Multer.File): void {
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido. Solo se permiten: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    if (file.size > this.maxSize) {
      throw new BadRequestException(
        `El archivo es demasiado grande. Tamaño máximo permitido: 5MB`,
      );
    }
  }
}
