import { IsString, MinLength, IsNotEmpty, IsBoolean } from 'class-validator';

export class AuthDto {
  @IsNotEmpty()
  login: string;
  @IsString()
  @MinLength(6, {
    message: 'must be 6 symbols',
  })
  password: string;
}

export class RefreshTokenDto {
  @IsNotEmpty()
  refreshToken: string;
}
