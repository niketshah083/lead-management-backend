import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CategoryMedia } from '../entities/category-media.entity';
import { CreateCategoryDto, UpdateCategoryDto, CategoryDto, MediaDto } from '../common/dto/category.dto';
import { MediaType } from '../common/enums';
import { S3Service } from '../common/services';
export declare class CategoryService {
    private categoryRepository;
    private categoryMediaRepository;
    private s3Service;
    private readonly logger;
    constructor(categoryRepository: Repository<Category>, categoryMediaRepository: Repository<CategoryMedia>, s3Service: S3Service);
    create(createCategoryDto: CreateCategoryDto): Promise<CategoryDto>;
    findAll(): Promise<CategoryDto[]>;
    findOne(id: string): Promise<CategoryDto>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryDto>;
    softDelete(id: string): Promise<void>;
    validateFileType(mimetype: string, filename: string, size: number): {
        isValid: boolean;
        mediaType: MediaType | null;
        error?: string;
    };
    uploadMedia(categoryId: string, files: Express.Multer.File[]): Promise<MediaDto[]>;
    deleteMedia(categoryId: string, mediaId: string): Promise<void>;
    getMedia(categoryId: string): Promise<MediaDto[]>;
    exists(id: string): Promise<boolean>;
    findOneWithDeleted(id: string): Promise<Category | null>;
    private toCategoryDto;
    private toMediaDto;
}
