import { PaginationDto } from '@app/services/pagination/types';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { AccountStatusEnum } from '../../enum';

export class GetAllStaffQueryDto extends PaginationDto {
  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  name: string | null;

  @ApiProperty({ enum: AccountStatusEnum, required: false })
  @IsOptional()
  @IsString()
  accountStatus: AccountStatusEnum | null;
}
