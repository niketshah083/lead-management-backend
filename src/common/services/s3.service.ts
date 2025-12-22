import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

export interface UploadResult {
  key: string;
  url: string;
  signedUrl: string;
}

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    this.region =
      this.configService.get<string>('aws.s3.region') || 'us-east-1';
    this.bucket = this.configService.get<string>('aws.s3.bucket') || '';

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('aws.accessKeyId') || '',
        secretAccessKey:
          this.configService.get<string>('aws.secretAccessKey') || '',
      },
    });
  }

  /**
   * Upload a file to S3
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string,
    customFilename?: string,
  ): Promise<UploadResult> {
    const extension = extname(file.originalname);
    const filename = customFilename || `${uuidv4()}${extension}`;
    const key = `${folder}/${filename}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await this.s3Client.send(command);

      const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
      const signedUrl = await this.getSignedUrl(key);

      this.logger.log(`File uploaded successfully: ${key}`);

      return {
        key,
        url,
        signedUrl,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file: ${key}`, error);
      throw error;
    }
  }

  /**
   * Upload a buffer to S3
   */
  async uploadBuffer(
    buffer: Buffer,
    folder: string,
    filename: string,
    contentType: string,
  ): Promise<UploadResult> {
    const key = `${folder}/${filename}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    try {
      await this.s3Client.send(command);

      const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
      const signedUrl = await this.getSignedUrl(key);

      this.logger.log(`Buffer uploaded successfully: ${key}`);

      return {
        key,
        url,
        signedUrl,
      };
    } catch (error) {
      this.logger.error(`Failed to upload buffer: ${key}`, error);
      throw error;
    }
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${key}`, error);
      throw error;
    }
  }

  /**
   * Get a signed URL for accessing a private S3 object
   * @param key - The S3 object key
   * @param expiresIn - URL expiration time in seconds (default: 1 hour)
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });
      return signedUrl;
    } catch (error) {
      this.logger.error(`Failed to generate signed URL for: ${key}`, error);
      throw error;
    }
  }

  /**
   * Get a signed URL for uploading a file (pre-signed PUT URL)
   */
  async getUploadSignedUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    try {
      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });
      return signedUrl;
    } catch (error) {
      this.logger.error(
        `Failed to generate upload signed URL for: ${key}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Check if a file exists in S3
   */
  async fileExists(key: string): Promise<boolean> {
    const command = new HeadObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Extract S3 key from a full S3 URL
   */
  extractKeyFromUrl(url: string): string | null {
    const urlParts = url.split('.amazonaws.com/');
    if (urlParts.length === 2) {
      return urlParts[1];
    }
    return null;
  }

  /**
   * Get signed URL from a full S3 URL
   */
  async getSignedUrlFromFullUrl(
    url: string,
    expiresIn: number = 3600,
  ): Promise<string | null> {
    const key = this.extractKeyFromUrl(url);
    if (!key) {
      return null;
    }
    return this.getSignedUrl(key, expiresIn);
  }
}
