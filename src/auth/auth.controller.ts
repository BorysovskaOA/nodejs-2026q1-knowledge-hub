import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  RawBody,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ValidationResponseDto } from 'src/core/dtos/validation-response.dto';
import { AuthService } from './auth.service';
import { SignupDto } from './models/signup.dto';
import { LoginDto } from './models/login.dto';
import { RefreshDto } from './models/refresh.dto';
import { AuthEntity, AuthUserEntity } from './models/atuh.entity';
import { PublicRote } from '../core/decorators/public-route.decorator';
import { AuthenticatedRequest } from './models/authenticated_request.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @PublicRote()
  @Post('signup')
  @ApiCreatedResponse({ type: AuthUserEntity })
  @ApiBadRequestResponse({ type: ValidationResponseDto })
  async signup(@Body() signupDto: SignupDto): Promise<AuthUserEntity> {
    return this.authService.signup(signupDto);
  }

  @PublicRote()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthEntity })
  @ApiBadRequestResponse({ type: ValidationResponseDto })
  @ApiForbiddenResponse()
  async login(@Body() loginDto: LoginDto): Promise<AuthEntity> {
    return this.authService.login(loginDto);
  }

  @ApiBearerAuth('accessToken')
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthEntity })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  async refresh(
    @RawBody() refreshDto: RefreshDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<AuthEntity> {
    if (!refreshDto.refreshToken) throw new UnauthorizedException();

    return this.authService.refresh(refreshDto, req.user);
  }
}
