import { AutoReplyService } from './auto-reply.service';
import { CreateAutoReplyTemplateDto, UpdateAutoReplyTemplateDto } from './dto';
export declare class AutoReplyController {
    private readonly autoReplyService;
    constructor(autoReplyService: AutoReplyService);
    create(dto: CreateAutoReplyTemplateDto): Promise<import("../entities").AutoReplyTemplate>;
    findAll(categoryId?: string): Promise<import("../entities").AutoReplyTemplate[]>;
    findOne(id: string): Promise<import("../entities").AutoReplyTemplate>;
    update(id: string, dto: UpdateAutoReplyTemplateDto): Promise<import("../entities").AutoReplyTemplate>;
    remove(id: string): Promise<void>;
}
