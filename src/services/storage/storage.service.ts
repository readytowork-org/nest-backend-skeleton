import { envVars } from '@app/config/env/env.validation';
import { Storage } from '@google-cloud/storage';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { extname } from 'path';
import { randomBytes } from 'crypto';

@Injectable()
export class StorageService {
  logger = new Logger(StorageService.name);

  private storage = new Storage();

  private bucket = this.storage.bucket(envVars.STORAGE_BUCKET_NAME);

  async uploadFile(
    file: Express.Multer.File,
    subfolder: string,
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const filename = this.generateSafeFilename(file);

    const fullPath = subfolder ? `${subfolder}/${filename}` : filename;

    const blob = this.bucket.file(fullPath);

    const stream = blob.createWriteStream({
      resumable: false,
      contentType: file.mimetype,
    });

    return new Promise((resolve, reject) => {
      stream.on('error', reject);
      stream.on('finish', () => {
        resolve(fullPath);
      });
      stream.end(file.buffer);
    });
  }

  async deleteFile(filename: string): Promise<void> {
    try {
      const file = this.bucket.file(filename);
      const [exists] = await file.exists();

      if (!exists) return;

      await file.delete();
      this.logger.log(`File deleted : ${filename}`);
    } catch (error) {
      this.logger.error(`Failed to delete file ${filename}:`, error);
      throw new InternalServerErrorException('Could not delete old file');
    }
  }

  async getSignedUrl(filename: string): Promise<string> {
    const expiryTimeInMinute = envVars.GCS_SIGNED_URL_EXPIRY_MINUTES;
    const [url] = await this.bucket.file(filename).getSignedUrl({
      action: 'read',
      expires: Date.now() + expiryTimeInMinute * 60 * 1000,
    });
    return url;
  }

  generateSafeFilename(file: Express.Multer.File): string {
    const ext = extname(file.originalname);
    const timestamp = Date.now();
    const randomStr = randomBytes(8).toString('hex');
    return `${timestamp}-${randomStr}${ext}`;
  }
}
