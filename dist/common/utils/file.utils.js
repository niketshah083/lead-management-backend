"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUtils = void 0;
const common_1 = require("@nestjs/common");
const multer_1 = require("multer");
const path_1 = require("path");
const fs = require("fs");
const constants_1 = require("../constants");
class FileUtils {
    static multerDiskConfig = (allowedExtensions, size = constants_1.FileConstants.FILE_SIZE.TEN_MB) => ({
        storage: (0, multer_1.diskStorage)({
            destination: (req, _file, callback) => {
                const organizationName = req.userDetails?.organizationName || '';
                const companyName = req.userDetails?.companyName || '';
                let uploadPath = './uploads';
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }
                if (organizationName) {
                    uploadPath = (0, path_1.join)(uploadPath, `${organizationName}`);
                    if (!fs.existsSync(uploadPath)) {
                        fs.mkdirSync(uploadPath, { recursive: true });
                    }
                }
                if (companyName) {
                    uploadPath = (0, path_1.join)(uploadPath, `${companyName}`);
                    if (!fs.existsSync(uploadPath)) {
                        fs.mkdirSync(uploadPath, { recursive: true });
                    }
                }
                callback(null, uploadPath);
            },
            filename: (_req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const fileName = file.fieldname + '-' + uniqueSuffix + (0, path_1.extname)(file.originalname);
                callback(null, fileName);
            },
        }),
        fileFilter: (_req, file, cb) => {
            const fileExt = (0, path_1.extname)(file.originalname).toLowerCase();
            const flatAllowedExtensions = allowedExtensions.flat(1);
            if (flatAllowedExtensions.findIndex((e) => e.toLowerCase() === fileExt) !==
                -1) {
                cb(null, true);
            }
            else {
                cb(new common_1.BadRequestException(`Invalid file type. Allowed: ${flatAllowedExtensions.join(', ')}`), false);
            }
        },
        limits: {
            fileSize: size,
        },
    });
    static multerMemoryConfig = (allowedExtensions, size = constants_1.FileConstants.FILE_SIZE.TEN_MB) => ({
        storage: (0, multer_1.memoryStorage)(),
        fileFilter: (_req, file, cb) => {
            const fileExt = (0, path_1.extname)(file.originalname).toLowerCase();
            const flatAllowedExtensions = allowedExtensions.flat(1);
            if (flatAllowedExtensions.findIndex((e) => e.toLowerCase() === fileExt) !==
                -1) {
                cb(null, true);
            }
            else {
                cb(new common_1.BadRequestException(`Invalid file type. Allowed: ${flatAllowedExtensions.join(', ')}`), false);
            }
        },
        limits: {
            fileSize: size,
        },
    });
    static validateFileType(mimetype, filename, allowedMimeTypes, allowedExtensions) {
        const extension = (0, path_1.extname)(filename).toLowerCase();
        return (allowedMimeTypes.includes(mimetype) &&
            allowedExtensions.includes(extension));
    }
    static getExtension(filename) {
        return (0, path_1.extname)(filename).toLowerCase();
    }
    static generateUniqueFilename(originalFilename) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const extension = (0, path_1.extname)(originalFilename);
        return `${uniqueSuffix}${extension}`;
    }
}
exports.FileUtils = FileUtils;
//# sourceMappingURL=file.utils.js.map