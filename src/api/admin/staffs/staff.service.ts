import { Injectable, Logger } from '@nestjs/common';
import {
  CreateStaffDto,
  GetAllStaffQueryDto,
  PaginatedStaffDto,
  ReturningId,
  UpdatedStaffDto,
  USER_ROLE,
} from '@common/types';
import { hashPlainText } from '@app/utils/bcrypt';
import { Staff } from '@app/common/types/type/staff.type';
import { StaffRepository } from '@app/api/admin/staffs/staff.repository';
import {
  BadRequestException,
  EmailAlreadyExistsException,
  ErrorMessages,
} from '@app/common';

@Injectable()
export class StaffService {
  logger = new Logger(StaffService.name);

  constructor(private readonly staffRepository: StaffRepository) {}

  async findByEmail(email: string): Promise<Staff | null> {
    return this.staffRepository.findByEmail(email);
  }

  async findById(id: number): Promise<Staff> {
    const staff = await this.staffRepository.findById(id);
    if (!staff) {
      throw new BadRequestException(ErrorMessages.INVALID_STAFF_ID);
    }
    return staff;
  }

  async create(
    role: USER_ROLE.STAFF | USER_ROLE.ADMIN,
    data: CreateStaffDto,
  ): Promise<ReturningId | null> {
    const existingStaff = await this.staffRepository.findByEmail(data.email);
    if (existingStaff) {
      throw new EmailAlreadyExistsException();
    }
    const hash = await hashPlainText(data.password);
    data.password = hash;
    return this.staffRepository.create(role, data);
  }

  async getAllStaff(query: GetAllStaffQueryDto): Promise<PaginatedStaffDto> {
    return await this.staffRepository.getAllStaff(query);
  }

  async updateStaff(staffId: number, payload: UpdatedStaffDto): Promise<void> {
    const staff = await this.staffRepository.findById(staffId);
    if (!staff) {
      throw new BadRequestException(ErrorMessages.INVALID_STAFF_ID);
    }
    if (payload.email && payload.email !== staff.email) {
      const existingStaff = await this.staffRepository.findByEmail(
        payload.email,
      );
      if (existingStaff) {
        throw new EmailAlreadyExistsException();
      }
    }
    if (payload.password) {
      const hash = await hashPlainText(payload.password);
      payload.password = hash;
    } else {
      delete payload.password;
    }
    const createdID = await this.staffRepository.updateStaff(staffId, payload);
    if (!createdID) {
      throw new BadRequestException(ErrorMessages.FAILED_TO_UPDATE_STAFF);
    }
  }
}
