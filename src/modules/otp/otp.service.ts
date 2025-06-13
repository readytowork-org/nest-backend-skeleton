import { Injectable } from '@nestjs/common';
import { CreateOtpDto, Otp } from './dto/create-otp.dto';
import { OtpRepository } from './otp.repository';
import { UpdateOtpDto } from './dto/update-otp.dto';

@Injectable()
export class OtpService {
  constructor(private readonly otpRepository: OtpRepository) {}

  async create(createOtpDto: CreateOtpDto): Promise<Otp> {
    return await this.otpRepository.create(createOtpDto);
  }

  async update(id: number, otpData: UpdateOtpDto): Promise<Otp> {
    return await this.otpRepository.update(id, otpData);
  }

  async findOneByOtpSessionId(otpSessionId: string): Promise<Otp> {
    return await this.otpRepository.findOneByOtpSessionId(otpSessionId);
  }

  async findLatestOtpBySessionId(otpSessionId: string): Promise<Otp> {
    return await this.otpRepository.findLatestOtpBySessionId(otpSessionId);
  }
}
