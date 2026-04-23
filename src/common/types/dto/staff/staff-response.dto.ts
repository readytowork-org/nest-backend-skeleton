import { ApiProperty } from '@nestjs/swagger';
import { PaginationMeta } from '@app/services/pagination/types';
import { StaffDetailDto } from './staff-safe.dto';

export class PaginatedStaffDto {
  @ApiProperty({ type: [StaffDetailDto] })
  data: StaffDetailDto[];

  @ApiProperty({ type: PaginationMeta })
  meta: PaginationMeta;
}

export class StaffDetailResponseDto {
  @ApiProperty({ example: 'success' })
  message: string;

  @ApiProperty({ type: StaffDetailDto })
  data: StaffDetailDto;
}
