import { CreateUserDto } from './../user/dto/create-user.dto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { AuthDto } from './dto/auth.dto';
import { verify } from 'argon2';
import { Response } from 'express';
import { ERROR_MESSAGES } from 'src/constants/errors-message';

@Injectable()
export class AuthService {
  EXPIRE_DAY_REFRESH_TOKEN = 1;
  REFRESH_TOKEN_NAME = 'refreshToken';

  constructor(
    private jwt: JwtService,
    private userService: UserService,
  ) {}

  async login(dto: AuthDto) {
    const userForCheck = await this.validateUser(dto);

    const { password, ...user } = await this.userService.getById(
      userForCheck.id,
    );

    const tokens = this.issueTokens(user.id);

    return {
      user,
      role: 'merchant',
      ...tokens,
    };
  }

  async register(dto: CreateUserDto) {
    const isUserExist = await this.userService.getByLogin(dto.login);

    if (isUserExist)
      throw new BadRequestException(ERROR_MESSAGES.ru.ALREADY_EXISTS_USER);

    const { password, ...user } = await this.userService.create(dto);

    const tokens = this.issueTokens(user.id);

    return {
      user,
      ...tokens,
    };
  }

  private issueTokens(userId: string) {
    const data = { id: userId };

    const accessToken = this.jwt.sign(data, {
      expiresIn: '1h',
    });

    const refreshToken = this.jwt.sign(data, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  private async validateUser(dto: AuthDto) {
    const user = await this.userService.getByLogin(dto.login);

    if (!user) throw new NotFoundException(ERROR_MESSAGES.ru.WRONG_AUTH_DATA);

    const isValid = await verify(user.password, dto.password);

    if (!isValid)
      throw new UnauthorizedException(ERROR_MESSAGES.ru.WRONG_AUTH_DATA);

    return { ...user };
  }

  addRefreshTokenToResponse(res: Response, refreshToken: string) {
    const expiresIn = new Date();

    expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN);

    res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: true,
      domain: '*',
      expires: expiresIn,
      secure: true,
      sameSite: 'none',
    });
  }

  removeRefreshTokenToResponse(res: Response) {
    const expiresIn = new Date();

    expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN);

    res.cookie(this.REFRESH_TOKEN_NAME, '', {
      httpOnly: true,
      domain: '*',
      expires: new Date(0),
      secure: true,
      sameSite: 'none',
    });
  }

  async refreshTokens(refreshToken: string) {
    try {
      const result = await this.jwt.verifyAsync(refreshToken);

      if (!result)
        throw new UnauthorizedException(ERROR_MESSAGES.ru.UNAUTHORIZED);

      const { password, ...userResponse } = await this.userService.getById(
        result.id,
      );

      const tokens = this.issueTokens(userResponse.id);
      const { ...user } = userResponse;
      return {
        user: {
          ...user,
        },
        ...tokens,
      };
    } catch (err) {
      throw new UnauthorizedException(ERROR_MESSAGES.ru.UNAUTHORIZED);
    }
  }
}
