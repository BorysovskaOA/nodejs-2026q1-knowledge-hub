import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  RawBody,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ValidationResponseDto } from 'src/core/dtos/validation-response.dto';
import { AuthService } from './auth.service';
import { SignupDto } from './models/signup.dto';
import { LoginDto } from './models/login.dto';
import { RefreshDto } from './models/refresh.dto';
import { AuthEntity, AuthUserEntity } from './models/auth.entity';
import { PublicRote } from '../core/decorators/public-route.decorator';
import { AuthenticatedRequest } from '../core/interfaces/authenticated_request.interface';
import { ExceptionResponse } from 'src/core/utils/exception-response.util';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
@ApiInternalServerErrorResponse(ExceptionResponse(500))
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @PublicRote()
  @UseGuards(ThrottlerGuard)
  @ApiCreatedResponse({ type: AuthUserEntity })
  @ApiBadRequestResponse({ type: ValidationResponseDto })
  async signup(@Body() signupDto: SignupDto): Promise<AuthUserEntity> {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  @PublicRote()
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @ApiOkResponse({ type: AuthEntity })
  @ApiBadRequestResponse({ type: ValidationResponseDto })
  @ApiForbiddenResponse(ExceptionResponse(403))
  async login(@Body() loginDto: LoginDto): Promise<AuthEntity> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @ApiBearerAuth('accessToken')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthEntity })
  @ApiUnauthorizedResponse(ExceptionResponse(401))
  @ApiForbiddenResponse(ExceptionResponse(403))
  async refresh(
    @RawBody() refreshDto: RefreshDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<AuthEntity> {
    if (!refreshDto.refreshToken) throw new UnauthorizedException();

    return this.authService.refresh(refreshDto, req.user);
  }

  @Post('logout')
  @ApiBearerAuth('accessToken')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiUnauthorizedResponse(ExceptionResponse(401))
  async logout(@Request() req: AuthenticatedRequest) {
    this.authService.logout(req.user);
  }
}
