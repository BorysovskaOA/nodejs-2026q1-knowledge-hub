import { IntersectionType } from '@nestjs/swagger';
import { PaginationDto } from 'src/core/dtos/pagination.dto';
import { WithSortingDto } from 'src/core/dtos/sorting.dto';
import { UserEntity } from './user.entity';

export class UserListFiltersPaginatedDto extends IntersectionType(
  PaginationDto,
  WithSortingDto<UserEntity>(
    ['createdAt', 'updatedAt', 'role', 'login'],
    'login',
  ),
) {}
