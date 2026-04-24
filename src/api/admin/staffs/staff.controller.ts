import { Roles } from '@app/services/auth/decorators/roles.decorator';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/services/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@app/services/auth/guards/roles.guard';
import { StaffService } from './staff.service';
import { ResponseWithMessageDto, USER_ROLE } from '@app/common/types';
import {
  CreateStaffDto,
  GetAllStaffQueryDto,
  PaginatedStaffDto,
  StaffDetailDto,
  StaffDetailResponseDto,
  UpdatedStaffDto,
} from '@app/common/types/dto';
import {
  iResponseWithMessage,
  SuccessResponseMessage,
  SuccessResponseWithData,
} from '@app/common/api_response/success_response';

@ApiTags('Admin - staffs')
@ApiBearerAuth('BearerAuth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(USER_ROLE.ADMIN, USER_ROLE.STAFF)
@Controller('')
export class StaffController {
  logger = new Logger(StaffController.name);
  constructor(private readonly service: StaffService) {}

  // Get all staff
  @Get('')
  @ApiOperation({ summary: 'Get all staff' })
  @ApiResponse({
    type: PaginatedStaffDto,
    status: HttpStatus.OK,
  })
  async getAllStaff(
    @Query() queryDto: GetAllStaffQueryDto,
  ): Promise<PaginatedStaffDto> {
    return this.service.getAllStaff(queryDto);
  }

  // Get one staff by id
  @Get(':id')
  @ApiOperation({ summary: 'Get one staff by id' })
  @ApiResponse({
    type: StaffDetailResponseDto,
    status: HttpStatus.OK,
  })
  async getOneStaffById(
    @Param('id') staffId: number,
  ): Promise<StaffDetailResponseDto> {
    const data = await this.service.findById(staffId);
    return SuccessResponseWithData<StaffDetailDto>({
      status: true,
      message: 'success',
      data: data as any,
    });
  }

  // update staff by id
  @Put(':id')
  @ApiOperation({ summary: 'Update staff by id' })
  @ApiResponse({
    type: ResponseWithMessageDto,
    status: HttpStatus.OK,
  })
  async updateStaffInformation(
    @Param('id') staffId: number,
    @Body() payload: UpdatedStaffDto,
  ): Promise<iResponseWithMessage> {
    await this.service.updateStaff(staffId, payload);
    return SuccessResponseMessage({
      status: true,
      message: 'Staff updated successfully',
    });
  }

  // create staff
  @Post('')
  @ApiOperation({ summary: 'Create staff' })
  @ApiResponse({
    type: ResponseWithMessageDto,
    status: HttpStatus.OK,
  })
  async createStaffInformation(
    @Body() payload: CreateStaffDto,
  ): Promise<iResponseWithMessage> {
    await this.service.create(USER_ROLE.STAFF, payload);
    return SuccessResponseMessage({
      status: true,
      message: 'Staff updated successfully',
    });
  }
}
