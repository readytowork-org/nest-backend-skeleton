import { DrizzleService, otpSchema } from '@app/db';
import { Injectable } from '@nestjs/common';
import { CreateOtpDto, Otp } from './dto/create-otp.dto';
import { desc, eq } from 'drizzle-orm';
import { UpdateOtpDto } from './dto/update-otp.dto';

@Injectable()
export class OtpRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async create(dto: CreateOtpDto) {
    const result = await this.drizzle.db.insert(otpSchema).values(dto);

    // Get the created user
    const opt = await this.drizzle.db
      .select()
      .from(otpSchema)
      .where(eq(otpSchema.id, result[0].insertId))
      .limit(1);

    if (!opt.length) {
      throw new Error('Failed to create user');
    }

    return opt[0];
  }

  async findOneByOtpSessionId(otpSessionId: string): Promise<Otp> {
    const [otpRecord] = await this.drizzle.db
      .select()
      .from(otpSchema)
      .where(eq(otpSchema.otpSessionId, otpSessionId))
      .limit(1);

    return otpRecord;
  }

  async findLatestOtpBySessionId(otpSessionId: string): Promise<Otp> {
    const [otpRecord] = await this.drizzle.db
      .select()
      .from(otpSchema)
      .where(eq(otpSchema.otpSessionId, otpSessionId))
      .orderBy(desc(otpSchema.createdAt)) // Most recent first
      .limit(1);

    return otpRecord;
  }

  async update(id: number, otpData: UpdateOtpDto): Promise<Otp> {
    await this.drizzle.db
      .update(otpSchema)
      .set({
        ...otpData,
        updatedAt: new Date(),
      })
      .where(eq(otpSchema.id, id));

    const [otp] = await this.drizzle.db
      .select()
      .from(otpSchema)
      .where(eq(otpSchema.id, id))
      .limit(1);

    if (!otp) {
      throw new Error('Failed to update user');
    }

    return otp;
  }
}
