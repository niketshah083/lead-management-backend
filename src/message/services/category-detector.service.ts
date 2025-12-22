import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Category } from '../../entities';

export interface CategoryMatch {
  category: Category;
  score: number;
  matchedKeywords: string[];
}

@Injectable()
export class CategoryDetectorService {
  private readonly logger = new Logger(CategoryDetectorService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /**
   * Detect category from message content based on keyword matching
   * Returns the best matching category or null if no match found
   */
  async detectCategory(messageContent: string): Promise<Category | null> {
    const matches = await this.findMatchingCategories(messageContent);

    if (matches.length === 0) {
      this.logger.debug('No category match found for message');
      return null;
    }

    // Return the category with highest score
    const bestMatch = matches[0];
    this.logger.debug(
      `Best category match: ${bestMatch.category.name} with score ${bestMatch.score}`,
    );
    return bestMatch.category;
  }

  /**
   * Find all matching categories with their scores
   * Sorted by score descending
   */
  async findMatchingCategories(
    messageContent: string,
  ): Promise<CategoryMatch[]> {
    const categories = await this.categoryRepository.find({
      where: {
        isActive: true,
        deletedAt: IsNull(),
      },
    });

    const matches: CategoryMatch[] = [];
    const normalizedContent = this.normalizeText(messageContent);

    for (const category of categories) {
      const result = this.matchKeywords(normalizedContent, category.keywords);

      if (result.score > 0) {
        matches.push({
          category,
          score: result.score,
          matchedKeywords: result.matchedKeywords,
        });
      }
    }

    // Sort by score descending
    matches.sort((a, b) => b.score - a.score);

    return matches;
  }

  /**
   * Match keywords against content and return score
   * Score is calculated based on:
   * - Number of matched keywords
   * - Exact match vs partial match
   */
  matchKeywords(
    content: string,
    keywords: string[],
  ): { score: number; matchedKeywords: string[] } {
    if (!keywords || keywords.length === 0) {
      return { score: 0, matchedKeywords: [] };
    }

    const matchedKeywords: string[] = [];
    let score = 0;

    for (const keyword of keywords) {
      const normalizedKeyword = this.normalizeText(keyword);

      if (!normalizedKeyword) continue;

      // Check for exact word match (higher score)
      const wordBoundaryRegex = new RegExp(
        `\\b${this.escapeRegex(normalizedKeyword)}\\b`,
        'i',
      );
      if (wordBoundaryRegex.test(content)) {
        score += 2; // Exact word match gets higher score
        matchedKeywords.push(keyword);
        continue;
      }

      // Check for partial match (lower score)
      if (content.includes(normalizedKeyword)) {
        score += 1;
        matchedKeywords.push(keyword);
      }
    }

    return { score, matchedKeywords };
  }

  /**
   * Normalize text for comparison
   * - Convert to lowercase
   * - Remove extra whitespace
   */
  private normalizeText(text: string): string {
    if (!text) return '';
    return text.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Get default category (first active category or null)
   */
  async getDefaultCategory(): Promise<Category | null> {
    const defaultCategory = await this.categoryRepository.findOne({
      where: {
        isActive: true,
        deletedAt: IsNull(),
      },
      order: {
        createdAt: 'ASC',
      },
    });

    return defaultCategory;
  }
}
