import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { LoginDto, TokenResponseDto } from './dto';
import { JwtPayload } from './interfaces';
import { ConfigService } from '@nestjs/config';
export declare class AuthService {
    private userRepository;
    private jwtService;
    private configService;
    constructor(userRepository: Repository<User>, jwtService: JwtService, configService: ConfigService);
    login(loginDto: LoginDto): Promise<TokenResponseDto>;
    validateUser(userId: string): Promise<User | null>;
    generateToken(user: User): string;
    verifyToken(token: string): JwtPayload;
    private getExpiresInSeconds;
}
