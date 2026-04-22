import { IsOptional, IsEnum, IsString, IsIn } from 'class-validator';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export function WithSortingDto<T>(
  allowedFields: (keyof T)[],
  defaultSortKey?: keyof T,
  defaultSortOrder: SortOrder = SortOrder.ASC,
) {
  class SortingDto {
    @IsOptional()
    @IsString()
    @IsIn(allowedFields as string[])
    sortKey?: keyof T = defaultSortKey;

    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder: SortOrder = defaultSortOrder;
  }
  return SortingDto;
}
