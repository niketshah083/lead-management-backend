import { Request } from 'express';
export declare class FileUtils {
    static multerDiskConfig: (allowedExtensions: string[][], size?: number) => {
        storage: import("multer").StorageEngine;
        fileFilter: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => void;
        limits: {
            fileSize: number;
        };
    };
    static multerMemoryConfig: (allowedExtensions: string[][], size?: number) => {
        storage: import("multer").StorageEngine;
        fileFilter: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => void;
        limits: {
            fileSize: number;
        };
    };
    static validateFileType(mimetype: string, filename: string, allowedMimeTypes: string[], allowedExtensions: string[]): boolean;
    static getExtension(filename: string): string;
    static generateUniqueFilename(originalFilename: string): string;
}
