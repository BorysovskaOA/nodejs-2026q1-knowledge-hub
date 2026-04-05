import { ApiHideProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'PaginatedResponse' })
export class PaginatedResponseDto<T> {
  total: number;
  limit: number;
  page: number;

  @ApiHideProperty()
  data: T[];

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.limit = limit;
  }
}
