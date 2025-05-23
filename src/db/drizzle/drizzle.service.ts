import { Inject, Injectable } from '@nestjs/common';
import { DBClient } from './db.client';

@Injectable()
export class DrizzleService {
  constructor(@Inject('DRIZZLE_CLIENT') public db: DBClient) {}
}
