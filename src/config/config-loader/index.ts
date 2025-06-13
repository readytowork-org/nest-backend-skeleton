import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { resolve } from 'path';
const envPath = resolve(process.cwd(), 'env');
config({ path: envPath });
const configService = new ConfigService(process.env);
export default configService;
