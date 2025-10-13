import { ApiProperty } from '@nestjs/swagger';
import { PaginationMeta } from '@app/services/pagination/types';
import { ResponseWithMessage } from '@app/lib';
import { UserDetailDto } from './user-safe.dto';

export class FacilityPreloadDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}

export class UserListDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  middleName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  facilityId: number;

  @ApiProperty({ type: FacilityPreloadDto, required: false })
  facility?: FacilityPreloadDto; // <-- for preload

  @ApiProperty()
  status: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: Date | null;

  @ApiProperty()
  deletedAt: Date | null;
}

export class PaginatedUserResponseDto {
  @ApiProperty({ type: [UserListDto] })
  data: UserListDto[];

  @ApiProperty({ type: PaginationMeta })
  meta: PaginationMeta;
}

export class UserResponseWithDataDto {
  @ApiProperty({ example: 'Success' })
  message: string;

  @ApiProperty()
  data: UserDetailDto;
}

export class DeleteUserResponseDto implements ResponseWithMessage {
  @ApiProperty({
    example: 'User deleted successfully',
    description: 'Success response message',
  })
  message: string;
}

export class DeleteBulkUserResponseDto implements ResponseWithMessage {
  @ApiProperty({
    example: 'Users deleted successfully',
    description: 'Success response message',
  })
  message: string;
}
