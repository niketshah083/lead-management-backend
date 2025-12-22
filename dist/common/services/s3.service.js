"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var S3Service_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const uuid_1 = require("uuid");
const path_1 = require("path");
let S3Service = S3Service_1 = class S3Service {
    configService;
    logger = new common_1.Logger(S3Service_1.name);
    s3Client;
    bucket;
    region;
    constructor(configService) {
        this.configService = configService;
        this.region =
            this.configService.get('aws.s3.region') || 'us-east-1';
        this.bucket = this.configService.get('aws.s3.bucket') || '';
        this.s3Client = new client_s3_1.S3Client({
            region: this.region,
            credentials: {
                accessKeyId: this.configService.get('aws.accessKeyId') || '',
                secretAccessKey: this.configService.get('aws.secretAccessKey') || '',
            },
        });
    }
    async uploadFile(file, folder, customFilename) {
        const extension = (0, path_1.extname)(file.originalname);
        const filename = customFilename || `${(0, uuid_1.v4)()}${extension}`;
        const key = `${folder}/${filename}`;
        const command = new client_s3_1.PutObjectCommand({
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
        }
        catch (error) {
            this.logger.error(`Failed to upload file: ${key}`, error);
            throw error;
        }
    }
    async uploadBuffer(buffer, folder, filename, contentType) {
        const key = `${folder}/${filename}`;
        const command = new client_s3_1.PutObjectCommand({
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
        }
        catch (error) {
            this.logger.error(`Failed to upload buffer: ${key}`, error);
            throw error;
        }
    }
    async deleteFile(key) {
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });
        try {
            await this.s3Client.send(command);
            this.logger.log(`File deleted successfully: ${key}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete file: ${key}`, error);
            throw error;
        }
    }
    async getSignedUrl(key, expiresIn = 3600) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });
        try {
            const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, {
                expiresIn,
            });
            return signedUrl;
        }
        catch (error) {
            this.logger.error(`Failed to generate signed URL for: ${key}`, error);
            throw error;
        }
    }
    async getUploadSignedUrl(key, contentType, expiresIn = 3600) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: contentType,
        });
        try {
            const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, {
                expiresIn,
            });
            return signedUrl;
        }
        catch (error) {
            this.logger.error(`Failed to generate upload signed URL for: ${key}`, error);
            throw error;
        }
    }
    async fileExists(key) {
        const command = new client_s3_1.HeadObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });
        try {
            await this.s3Client.send(command);
            return true;
        }
        catch (error) {
            if (error.name === 'NotFound') {
                return false;
            }
            throw error;
        }
    }
    extractKeyFromUrl(url) {
        const urlParts = url.split('.amazonaws.com/');
        if (urlParts.length === 2) {
            return urlParts[1];
        }
        return null;
    }
    async getSignedUrlFromFullUrl(url, expiresIn = 3600) {
        const key = this.extractKeyFromUrl(url);
        if (!key) {
            return null;
        }
        return this.getSignedUrl(key, expiresIn);
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = S3Service_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], S3Service);
//# sourceMappingURL=s3.service.js.map