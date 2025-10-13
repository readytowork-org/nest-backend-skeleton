import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto<T> {
  @ApiProperty()
  data: T;

  @ApiProperty()
  message: string;

  constructor(data: T, message: string) {
    this.data = data;
    this.message = message;
  }
}

export class ResponseWithMessageDto {
  @ApiProperty()
  message: string;
}
