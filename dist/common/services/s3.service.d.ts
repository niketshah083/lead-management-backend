import { ConfigService } from '@nestjs/config';
export interface UploadResult {
    key: string;
    url: string;
    signedUrl: string;
}
export declare class S3Service {
    private readonly configService;
    private readonly logger;
    private readonly s3Client;
    private readonly bucket;
    private readonly region;
    constructor(configService: ConfigService);
    uploadFile(file: Express.Multer.File, folder: string, customFilename?: string): Promise<UploadResult>;
    uploadBuffer(buffer: Buffer, folder: string, filename: string, contentType: string): Promise<UploadResult>;
    deleteFile(key: string): Promise<void>;
    getSignedUrl(key: string, expiresIn?: number): Promise<string>;
    getUploadSignedUrl(key: string, contentType: string, expiresIn?: number): Promise<string>;
    fileExists(key: string): Promise<boolean>;
    extractKeyFromUrl(url: string): string | null;
    getSignedUrlFromFullUrl(url: string, expiresIn?: number): Promise<string | null>;
}
