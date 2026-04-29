import { IsOptional, IsEnum, IsString, IsIn } from 'class-validator';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

// Need to duplicated for Base repository
export type SortType<T> = {
  sortKey?: keyof T;
  sortOrder: SortOrder;
};

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
