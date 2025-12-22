import { AuthService } from './auth.service';
import { LoginDto, TokenResponseDto } from './dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<TokenResponseDto>;
}
