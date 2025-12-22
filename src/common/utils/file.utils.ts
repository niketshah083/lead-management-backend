import { BadRequestException } from '@nestjs/common';
import { diskStorage, memoryStorage } from 'multer';
import { Request } from 'express';
import { extname, join } from 'path';
import * as fs from 'fs';
import { FileConstants } from '../constants';

interface ExtendedRequest extends Request {
  userDetails?: {
    organizationName?: string;
    companyName?: string;
  };
}

export class FileUtils {
  /**
   * Multer configuration for disk storage with dynamic directory creation
   */
  static multerDiskConfig = (
    allowedExtensions: string[][],
    size: number = FileConstants.FILE_SIZE.TEN_MB,
  ) => ({
    storage: diskStorage({
      destination: (
        req: ExtendedRequest,
        _file: Express.Multer.File,
        callback: (error: Error | null, destination: string) => void,
      ) => {
        const organizationName = req.userDetails?.organizationName || '';
        const companyName = req.userDetails?.companyName || '';

        let uploadPath = './uploads';
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }

        if (organizationName) {
          uploadPath = join(uploadPath, `${organizationName}`);
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
        }

        if (companyName) {
          uploadPath = join(uploadPath, `${companyName}`);
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
        }

        callback(null, uploadPath);
      },
      filename: (
        _req: Request,
        file: Express.Multer.File,
        callback: (error: Error | null, filename: string) => void,
      ) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileName =
          file.fieldname + '-' + uniqueSuffix + extname(file.originalname);
        callback(null, fileName);
      },
    }),
    fileFilter: (
      _req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, acceptFile: boolean) => void,
    ) => {
      const fileExt = extname(file.originalname).toLowerCase();
      const flatAllowedExtensions = allowedExtensions.flat(1);
      if (
        flatAllowedExtensions.findIndex((e) => e.toLowerCase() === fileExt) !==
        -1
      ) {
        cb(null, true);
      } else {
        cb(
          new BadRequestException(
            `Invalid file type. Allowed: ${flatAllowedExtensions.join(', ')}`,
          ),
          false,
        );
      }
    },
    limits: {
      fileSize: size,
    },
  });

  /**
   * Multer configuration for memory storage (for S3 uploads)
   */
  static multerMemoryConfig = (
    allowedExtensions: string[][],
    size: number = FileConstants.FILE_SIZE.TEN_MB,
  ) => ({
    storage: memoryStorage(),
    fileFilter: (
      _req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, acceptFile: boolean) => void,
    ) => {
      const fileExt = extname(file.originalname).toLowerCase();
      const flatAllowedExtensions = allowedExtensions.flat(1);
      if (
        flatAllowedExtensions.findIndex((e) => e.toLowerCase() === fileExt) !==
        -1
      ) {
        cb(null, true);
      } else {
        cb(
          new BadRequestException(
            `Invalid file type. Allowed: ${flatAllowedExtensions.join(', ')}`,
          ),
          false,
        );
      }
    },
    limits: {
      fileSize: size,
    },
  });

  /**
   * Validate file type based on mimetype and extension
   */
  static validateFileType(
    mimetype: string,
    filename: string,
    allowedMimeTypes: string[],
    allowedExtensions: string[],
  ): boolean {
    const extension = extname(filename).toLowerCase();
    return (
      allowedMimeTypes.includes(mimetype) &&
      allowedExtensions.includes(extension)
    );
  }

  /**
   * Get file extension from filename
   */
  static getExtension(filename: string): string {
    return extname(filename).toLowerCase();
  }

  /**
   * Generate unique filename
   */
  static generateUniqueFilename(originalFilename: string): string {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = extname(originalFilename);
    return `${uniqueSuffix}${extension}`;
  }
}
