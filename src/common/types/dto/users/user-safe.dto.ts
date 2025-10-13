import { ApiProperty } from '@nestjs/swagger';
import { AccountStatusEnum, UserRole } from '../../enum';

export class UserDetailDto {
  @ApiProperty()
  firstName: string;

  @ApiProperty()
  middleName: string | null;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  authProvider: string;

  @ApiProperty()
  phoneNumber: string | null;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  facilityId: number | null;

  @ApiProperty()
  address: string | null;

  @ApiProperty()
  city: string | null;

  @ApiProperty()
  province: string | null;

  @ApiProperty()
  country: string | null;

  @ApiProperty({ enum: AccountStatusEnum })
  status: AccountStatusEnum;

  @ApiProperty()
  profilePicture: string | null;

  @ApiProperty()
  nationalId: string | null;

  @ApiProperty()
  licenceDocument: string | null;

  @ApiProperty()
  certificationDocument1: string | null;

  @ApiProperty()
  certificationDocument2: string | null;

  @ApiProperty()
  certificationDocument3: string | null;

  @ApiProperty()
  certificationDocument4: string | null;

  @ApiProperty()
  certificationDocument5: string | null;

  @ApiProperty()
  resetPasswordToken: string | null;

  @ApiProperty()
  resetPasswordTokenExpiresAt: string | null; // ISO string

  @ApiProperty()
  lastLoginAt?: string | null; // ISO string

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date | null;

  @ApiProperty()
  deletedAt: Date | null;
}
