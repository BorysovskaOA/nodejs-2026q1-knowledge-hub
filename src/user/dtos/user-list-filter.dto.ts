import { IntersectionType } from '@nestjs/mapped-types';
import { PaginationDto } from 'src/core/dtos/pagination.dto';
import { WithSortingDto } from 'src/core/dtos/sorting.dto';
import { User } from '../user.interface';

export class UserListFiltersPaginatedDto extends IntersectionType(
  PaginationDto,
  WithSortingDto<User>(['createdAt', 'updatedAt', 'role', 'login'], 'login'),
) {}
