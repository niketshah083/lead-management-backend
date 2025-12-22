import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
// Multer types are provided by @types/multer
import { FilesInterceptor } from '@nestjs/platform-express';
import { CategoryService } from './category.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryDto,
  MediaDto,
} from '../common/dto/category.dto';
import { Roles } from '../auth/decorators';
import { RolesGuard } from '../auth/guards';
import { UserRole } from '../common/enums';

@Controller('categories')
@UseGuards(RolesGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * Create a new category
   * Requirements: 1.1 - Admin creates category with name, description, keywords
   */
  @Post()
  @Roles(UserRole.ADMIN)
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryDto> {
    return this.categoryService.create(createCategoryDto);
  }

  /**
   * Get all active categories
   * Requirements: 1.3 - Soft-deleted categories excluded from results
   */
  @Get()
  async findAll(): Promise<CategoryDto[]> {
    return this.categoryService.findAll();
  }

  /**
   * Get a single category by ID
   * Requirements: 1.4 - Return all associated media assets with proper URLs
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CategoryDto> {
    return this.categoryService.findOne(id);
  }

  /**
   * Update a category
   * Requirements: 1.2 - Admin updates category fields including media assets
   */
  @Put(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryDto> {
    return this.categoryService.update(id, updateCategoryDto);
  }

  /**
   * Soft-delete a category
   * Requirements: 1.3 - Soft-delete prevents new lead assignments
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.categoryService.softDelete(id);
  }

  /**
   * Upload media files to a category
   * Requirements: 1.5 - Validate file types and enforce size limits
   */
  @Post(':id/media')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB max (for videos)
      },
    }),
  )
  async uploadMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<MediaDto[]> {
    return this.categoryService.uploadMedia(id, files);
  }

  /**
   * Get all media for a category
   */
  @Get(':id/media')
  async getMedia(@Param('id', ParseUUIDPipe) id: string): Promise<MediaDto[]> {
    return this.categoryService.getMedia(id);
  }

  /**
   * Delete a media file from a category
   */
  @Delete(':categoryId/media/:mediaId')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMedia(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
  ): Promise<void> {
    return this.categoryService.deleteMedia(categoryId, mediaId);
  }
}
