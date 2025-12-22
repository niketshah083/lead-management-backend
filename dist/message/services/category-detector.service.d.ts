import { Repository } from 'typeorm';
import { Category } from '../../entities';
export interface CategoryMatch {
    category: Category;
    score: number;
    matchedKeywords: string[];
}
export declare class CategoryDetectorService {
    private readonly categoryRepository;
    private readonly logger;
    constructor(categoryRepository: Repository<Category>);
    detectCategory(messageContent: string): Promise<Category | null>;
    findMatchingCategories(messageContent: string): Promise<CategoryMatch[]>;
    matchKeywords(content: string, keywords: string[]): {
        score: number;
        matchedKeywords: string[];
    };
    private normalizeText;
    private escapeRegex;
    getDefaultCategory(): Promise<Category | null>;
}
