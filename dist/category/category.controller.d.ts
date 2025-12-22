import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto, CategoryDto, MediaDto } from '../common/dto/category.dto';
export declare class CategoryController {
    private readonly categoryService;
    constructor(categoryService: CategoryService);
    create(createCategoryDto: CreateCategoryDto): Promise<CategoryDto>;
    findAll(): Promise<CategoryDto[]>;
    findOne(id: string): Promise<CategoryDto>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryDto>;
    delete(id: string): Promise<void>;
    uploadMedia(id: string, files: Express.Multer.File[]): Promise<MediaDto[]>;
    getMedia(id: string): Promise<MediaDto[]>;
    deleteMedia(categoryId: string, mediaId: string): Promise<void>;
}
