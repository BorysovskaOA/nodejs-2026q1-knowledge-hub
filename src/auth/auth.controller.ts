import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto } from './models/signup.dto';
import { LoginDto } from './models/login.dto';
import { RefreshDto } from './models/refresh.dto';
import { AuthEntity, AuthUserEntity } from './models/auth.entity';
import { PublicRote } from '../core/decorators/public-route.decorator';
import { AuthenticatedRequest } from '../core/interfaces/authenticated-request.interface';
import {
  ExtendedExceptionResponse,
  GeneralExceptionResponse,
} from 'src/core/utils/exception-responses.util';
import { GlobalValidationPipe } from 'src/core/pipes/global-validation.pipe';
import { UnauthorizedError } from 'src/core/exceptions/app-errors';
import { CustomThrottlerGuard } from 'src/core/guards/custom-throttler.guard';

@Controller('auth')
@ApiInternalServerErrorResponse(GeneralExceptionResponse(500))
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @PublicRote()
  @UseGuards(CustomThrottlerGuard)
  @ApiCreatedResponse({ type: AuthUserEntity })
  @ApiBadRequestResponse(ExtendedExceptionResponse(400))
  @ApiConflictResponse(ExtendedExceptionResponse(409))
  @ApiTooManyRequestsResponse(GeneralExceptionResponse(429))
  async signup(@Body() signupDto: SignupDto): Promise<AuthUserEntity> {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  @PublicRote()
  @HttpCode(HttpStatus.OK)
  @UseGuards(CustomThrottlerGuard)
  @ApiOkResponse({ type: AuthEntity })
  @ApiBadRequestResponse(ExtendedExceptionResponse(400))
  @ApiForbiddenResponse(GeneralExceptionResponse(403))
  @ApiTooManyRequestsResponse(GeneralExceptionResponse(429))
  async login(@Body() loginDto: LoginDto): Promise<AuthEntity> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @PublicRote()
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: RefreshDto })
  @ApiOkResponse({ type: AuthEntity })
  @ApiUnauthorizedResponse(GeneralExceptionResponse(401))
  @ApiForbiddenResponse(GeneralExceptionResponse(403))
  async refresh(
    @Body(
      new GlobalValidationPipe({
        exceptionFactory: () =>
          new UnauthorizedError(
            AuthController.name,
            'Credentials are not valid',
          ),
        expectedType: RefreshDto,
      }),
    )
    refreshDto,
  ): Promise<AuthEntity> {
    return this.authService.refresh(refreshDto);
  }

  @Post('logout')
  @ApiBearerAuth('accessToken')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiUnauthorizedResponse(GeneralExceptionResponse(401))
  async logout(@Request() req: AuthenticatedRequest) {
    this.authService.logout(req.user);
  }
}
