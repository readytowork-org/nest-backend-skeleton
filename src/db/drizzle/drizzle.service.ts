import { Inject, Injectable } from '@nestjs/common';
import { DBClient } from './db.client';
import { DRIZZLE_CLIENT } from '@app/common';

@Injectable()
export class DrizzleService {
  constructor(@Inject(DRIZZLE_CLIENT) public db: DBClient) {}
}
