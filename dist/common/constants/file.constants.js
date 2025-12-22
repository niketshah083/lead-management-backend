"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileConstants = void 0;
class FileConstants {
    static FILE_EXTENSION = {
        PDF: '.pdf',
        XLSX: '.xlsx',
        JPG: '.jpg',
        JPEG: '.jpeg',
        PNG: '.png',
        WEBP: '.webp',
        CSV: '.csv',
        XLS: '.xls',
        XML: '.xml',
        MP4: '.mp4',
        WEBM: '.webm',
    };
    static FILE_TYPE = {
        IMAGE: [
            FileConstants.FILE_EXTENSION.JPEG,
            FileConstants.FILE_EXTENSION.JPG,
            FileConstants.FILE_EXTENSION.PNG,
            FileConstants.FILE_EXTENSION.WEBP,
        ],
        VIDEO: [
            FileConstants.FILE_EXTENSION.MP4,
            FileConstants.FILE_EXTENSION.WEBM,
        ],
        DOCUMENT: [FileConstants.FILE_EXTENSION.PDF],
        EXCEL: [
            FileConstants.FILE_EXTENSION.XLSX,
            FileConstants.FILE_EXTENSION.XLS,
            FileConstants.FILE_EXTENSION.CSV,
        ],
        XML: [FileConstants.FILE_EXTENSION.XML],
    };
    static FILE_SIZE = {
        ONE_MB: 1 * 1024 * 1024,
        FIVE_MB: 5 * 1024 * 1024,
        TEN_MB: 10 * 1024 * 1024,
        TWENTY_MB: 20 * 1024 * 1024,
        FIFTY_MB: 50 * 1024 * 1024,
        HUNDRED_MB: 100 * 1024 * 1024,
    };
    static MIME_TYPES = {
        IMAGE: ['image/jpeg', 'image/png', 'image/webp'],
        VIDEO: ['video/mp4', 'video/webm'],
        DOCUMENT: ['application/pdf'],
    };
}
exports.FileConstants = FileConstants;
//# sourceMappingURL=file.constants.js.map