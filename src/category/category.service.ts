import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Category } from '../entities/category.entity';
import { CategoryMedia } from '../entities/category-media.entity';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryDto,
  MediaDto,
} from '../common/dto/category.dto';
import { MediaType } from '../common/enums';
import { S3Service } from '../common/services';
import { FileConstants } from '../common/constants';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(CategoryMedia)
    private categoryMediaRepository: Repository<CategoryMedia>,
    private s3Service: S3Service,
  ) {}

  /**
   * Create a new category
   * Requirements: 1.1 - Store category name, description, images, videos, and PDF documents
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryDto> {
    // Check for duplicate name
    const existingCategory = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name },
      withDeleted: true,
    });

    if (existingCategory && !existingCategory.deletedAt) {
      throw new ConflictException('Category with this name already exists');
    }

    const category = this.categoryRepository.create({
      name: createCategoryDto.name,
      description: createCategoryDto.description,
      keywords: createCategoryDto.keywords,
      isActive: true,
    });

    const savedCategory = await this.categoryRepository.save(category);
    return this.toCategoryDto(savedCategory);
  }

  /**
   * Get all active categories (excludes soft-deleted)
   * Requirements: 1.3 - Soft-deleted categories should not appear in queries
   */
  async findAll(): Promise<CategoryDto[]> {
    const categories = await this.categoryRepository.find({
      where: { deletedAt: IsNull() },
      relations: ['media', 'autoReplyTemplates'],
      order: { createdAt: 'DESC' },
    });

    // Add signed URLs for media
    const categoriesWithSignedUrls = await Promise.all(
      categories.map(async (category) => {
        const dto = this.toCategoryDto(category);
        if (dto.media) {
          dto.media = await Promise.all(
            dto.media.map(async (m) => {
              const signedUrl = await this.s3Service.getSignedUrl(m.url);
              return {
                ...m,
                url: signedUrl, // Replace S3 key with signed URL
                signedUrl: signedUrl,
              };
            }),
          );
        }
        return dto;
      }),
    );

    return categoriesWithSignedUrls;
  }

  /**
   * Get a single category by ID
   * Requirements: 1.4 - Return all associated media assets with proper URLs
   */
  async findOne(id: string): Promise<CategoryDto> {
    const category = await this.categoryRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['media', 'autoReplyTemplates'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const dto = this.toCategoryDto(category);

    // Add signed URLs for media
    if (dto.media) {
      dto.media = await Promise.all(
        dto.media.map(async (m) => {
          const signedUrl = await this.s3Service.getSignedUrl(m.url);
          return {
            ...m,
            url: signedUrl, // Replace S3 key with signed URL
            signedUrl: signedUrl,
          };
        }),
      );
    }

    return dto;
  }

  /**
   * Update a category
   * Requirements: 1.2 - Persist all modified fields including media assets
   */
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryDto> {
    const category = await this.categoryRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['media', 'autoReplyTemplates'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Check for duplicate name if name is being updated
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { name: updateCategoryDto.name },
      });

      if (existingCategory) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    Object.assign(category, updateCategoryDto);
    const savedCategory = await this.categoryRepository.save(category);
    return this.toCategoryDto(savedCategory);
  }

  /**
   * Soft-delete a category
   * Requirements: 1.3 - Soft-delete the category and prevent new lead assignments
   */
  async softDelete(id: string): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Soft delete using TypeORM's softRemove
    await this.categoryRepository.softRemove(category);
  }

  /**
   * Validate file type for media upload
   * Requirements: 1.5 - Validate file types (images: jpg/png/webp, videos: mp4/webm, documents: pdf)
   */
  validateFileType(
    mimetype: string,
    filename: string,
    size: number,
  ): { isValid: boolean; mediaType: MediaType | null; error?: string } {
    const extension = filename
      .toLowerCase()
      .substring(filename.lastIndexOf('.'));

    // Check image types
    if (
      FileConstants.MIME_TYPES.IMAGE.includes(mimetype) &&
      FileConstants.FILE_TYPE.IMAGE.includes(extension)
    ) {
      if (size > FileConstants.FILE_SIZE.TEN_MB) {
        return {
          isValid: false,
          mediaType: null,
          error: 'Image file size exceeds 10MB limit',
        };
      }
      return { isValid: true, mediaType: MediaType.IMAGE };
    }

    // Check video types
    if (
      FileConstants.MIME_TYPES.VIDEO.includes(mimetype) &&
      FileConstants.FILE_TYPE.VIDEO.includes(extension)
    ) {
      if (size > FileConstants.FILE_SIZE.HUNDRED_MB) {
        return {
          isValid: false,
          mediaType: null,
          error: 'Video file size exceeds 100MB limit',
        };
      }
      return { isValid: true, mediaType: MediaType.VIDEO };
    }

    // Check document types
    if (
      FileConstants.MIME_TYPES.DOCUMENT.includes(mimetype) &&
      FileConstants.FILE_TYPE.DOCUMENT.includes(extension)
    ) {
      if (size > FileConstants.FILE_SIZE.TWENTY_MB) {
        return {
          isValid: false,
          mediaType: null,
          error: 'Document file size exceeds 20MB limit',
        };
      }
      return { isValid: true, mediaType: MediaType.DOCUMENT };
    }

    return {
      isValid: false,
      mediaType: null,
      error:
        'Invalid file type. Allowed: jpg/png/webp for images, mp4/webm for videos, pdf for documents',
    };
  }

  /**
   * Upload media files to S3 and create media records
   * Requirements: 1.5 - Validate file types and enforce size limits
   */
  async uploadMedia(
    categoryId: string,
    files: Express.Multer.File[],
  ): Promise<MediaDto[]> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId, deletedAt: IsNull() },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    const uploadedMedia: MediaDto[] = [];

    for (const file of files) {
      // Validate file type
      const validation = this.validateFileType(
        file.mimetype,
        file.originalname,
        file.size,
      );

      if (!validation.isValid) {
        throw new BadRequestException(validation.error);
      }

      // Upload to S3 using S3Service
      const folder = `categories/${categoryId}`;
      const uploadResult = await this.s3Service.uploadFile(file, folder);

      // Create media record with S3 key for later signed URL generation
      const media = this.categoryMediaRepository.create({
        categoryId,
        url: uploadResult.key, // Store the S3 key instead of full URL
        type: validation.mediaType!,
        filename: file.originalname,
        size: file.size,
      });

      const savedMedia = await this.categoryMediaRepository.save(media);

      // Return with signed URL
      const mediaDto = this.toMediaDto(savedMedia);
      (mediaDto as any).signedUrl = uploadResult.signedUrl;
      uploadedMedia.push(mediaDto);
    }

    return uploadedMedia;
  }

  /**
   * Delete a media file from S3 and database
   */
  async deleteMedia(categoryId: string, mediaId: string): Promise<void> {
    const media = await this.categoryMediaRepository.findOne({
      where: { id: mediaId, categoryId },
    });

    if (!media) {
      throw new NotFoundException(
        `Media with ID ${mediaId} not found in category ${categoryId}`,
      );
    }

    // Delete from S3 using S3Service
    try {
      // The url field now stores the S3 key
      await this.s3Service.deleteFile(media.url);
    } catch (error) {
      this.logger.error(`Failed to delete S3 object: ${media.url}`, error);
      // Continue with database deletion even if S3 deletion fails
    }

    // Delete from database
    await this.categoryMediaRepository.remove(media);
  }

  /**
   * Get media for a category with signed URLs
   */
  async getMedia(categoryId: string): Promise<MediaDto[]> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId, deletedAt: IsNull() },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    const media = await this.categoryMediaRepository.find({
      where: { categoryId },
      order: { createdAt: 'DESC' },
    });

    // Add signed URLs for each media item
    return Promise.all(
      media.map(async (m) => {
        const dto = this.toMediaDto(m);
        const signedUrl = await this.s3Service.getSignedUrl(m.url);
        return {
          ...dto,
          url: signedUrl, // Replace S3 key with signed URL
          signedUrl: signedUrl,
        };
      }),
    );
  }

  /**
   * Check if a category exists and is active (not soft-deleted)
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.categoryRepository.count({
      where: { id, deletedAt: IsNull() },
    });
    return count > 0;
  }

  /**
   * Find category by ID including soft-deleted (for internal use)
   */
  async findOneWithDeleted(id: string): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: ['media', 'autoReplyTemplates'],
    });
  }

  private toCategoryDto(category: Category): CategoryDto {
    const dto = plainToInstance(CategoryDto, category, {
      excludeExtraneousValues: true,
    });

    // Map media if present
    if (category.media) {
      dto.media = category.media.map((m) => this.toMediaDto(m));
    }

    return dto;
  }

  private toMediaDto(media: CategoryMedia): MediaDto {
    return plainToInstance(MediaDto, media, {
      excludeExtraneousValues: true,
    });
  }
}
