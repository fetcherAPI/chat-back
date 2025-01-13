import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  login: string;

  @IsNotEmpty()
  fullName: string;

  @IsString()
  @MinLength(6, {
    message: 'must be 6 symbols',
  })
  password: string;
}
