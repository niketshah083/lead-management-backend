import { Expose, Type } from 'class-transformer';
import { UserDto } from '../../common/dto/user.dto';

export class TokenResponseDto {
  @Expose()
  accessToken: string;

  @Expose()
  expiresIn: number;

  @Expose()
  @Type(() => UserDto)
  user: UserDto;
}
