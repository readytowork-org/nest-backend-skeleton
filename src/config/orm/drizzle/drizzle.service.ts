import { Inject, Injectable } from '@nestjs/common';
import { DBClientObj } from './db.client';
import { DRIZZLE_CLIENT } from './drizzle-client.constant';
import { OrmService } from '@config/orm/orm.interface';

@Injectable()
export class DrizzleService implements OrmService {
  constructor(@Inject(DRIZZLE_CLIENT) public db: DBClientObj) {}
}
