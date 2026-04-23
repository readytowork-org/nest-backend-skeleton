import { ApiProperty } from '@nestjs/swagger';
import { SafeUserDto } from './auth.dto';

export class LoginResponseDto extends SafeUserDto {
  @ApiProperty({ example: 'Success' })
  access_token: string;

  @ApiProperty()
  refresh_token: string;
}

export class LoginResponseWithDataDto {
  @ApiProperty({ example: 'Success' })
  message: string;

  @ApiProperty()
  data: LoginResponseDto;
}
