import { UserDto } from '../../common/dto/user.dto';
export declare class TokenResponseDto {
    accessToken: string;
    expiresIn: number;
    user: UserDto;
}
