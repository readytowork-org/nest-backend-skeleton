import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { Storage } from '@google-cloud/storage';
import { BadRequestException, InternalServerErrorException } from '@app/common';
import { envVars } from '@app/config/env/env.validation';
import { extname } from 'path';
import { randomBytes } from 'crypto';

@Injectable()
export class StorageService {
  logger = new Logger(StorageService.name);
  private readonly baseUploadDir = path.join(process.cwd(), 'uploads');

  private storage = new Storage();

  private bucket = this.storage.bucket(envVars.STORAGE_BUCKET_NAME);

  constructor() {
    // Ensure uploads directory exists
    if (envVars.ENVIRONMENT === 'local') {
      if (!fs.existsSync(this.baseUploadDir)) {
        fs.mkdirSync(this.baseUploadDir, { recursive: true });
        this.logger.log(
          `Created base upload directory at: ${this.baseUploadDir}`,
        );
      }
    }
  }

  saveFiles(
    files: Array<Express.Multer.File>,
    subDir: string = '',
  ): Record<string, string> {
    const targetDir = path.join(this.baseUploadDir, subDir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      this.logger.log(`Created upload subdirectory: ${targetDir}`);
    }

    const savedPaths: Record<string, string> = {};

    for (const file of files) {
      const extension = path.extname(file.originalname);
      const fileName = `${uuidv4()}${extension}`;
      const filePath = path.join(targetDir, fileName);

      fs.writeFileSync(filePath, file.buffer);

      const relativePath = path.join('uploads', subDir, fileName);
      savedPaths[file.fieldname] = relativePath;
      this.logger.log(`Saved file "${file.originalname}" to "${relativePath}"`);
    }

    return savedPaths;
  }

  removeFile(relativeFilePath: string): boolean {
    try {
      const fullPath = path.join(process.cwd(), relativeFilePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        this.logger.log(`Removed file at path: ${fullPath}`);
        return true;
      } else {
        this.logger.warn(`File to remove not found at path: ${fullPath}`);
        return false;
      }
    } catch (error) {
      this.logger.error(
        `Error removing file at ${relativeFilePath}: ${(error as Error).message}`,
      );
      return false;
    }
  }

  replaceFiles(
    files: Array<Express.Multer.File>,
    oldFiles: string[] = [],
    subDir: string = '',
  ): Record<string, string> {
    // Remove old files
    oldFiles.forEach((oldFilePath) => this.removeFile(oldFilePath));

    // Save new files
    return this.saveFiles(files, subDir);
  }

  async uploadFile({
    file,
    customFileName,
    subfolder,
  }: {
    file: Express.Multer.File;
    customFileName?: string;
    subfolder?: string;
  }): Promise<string> {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const filename = this.generateSafeFilename(file);

    const fullPath = subfolder
      ? `${subfolder}/${customFileName ?? filename}`
      : (customFileName ?? filename);

    const blob = this.bucket.file(fullPath);

    const stream = blob.createWriteStream({
      resumable: false,
      contentType: file.mimetype,
    });

    return new Promise((resolve, reject) => {
      stream.on('error', (error: Error) => {
        this.logger.error(error.message, error.stack, StorageService.name);
        reject(error);
      });
      stream.on('finish', () => {
        resolve(fullPath);
      });
      stream.end(file.buffer);
    });
  }

  createReadStreamFromGcs(gcsUri: string) {
    if (!gcsUri) {
      throw new Error('GCS path is required');
    }

    this.logger.log(`Creating readable stream from ${gcsUri}`);

    return this.bucket.file(gcsUri).createReadStream();
  }

  async getWriteSignedUrl(
    gcsFileName: string,
    subfolder: string,
    contentType: string,
  ): Promise<{ uploadUrl: string; fileLocation: string }> {
    const fullPath = `${subfolder}/${gcsFileName}`;

    const file = this.bucket.file(fullPath);

    // Generate the Signed URL
    const [uploadUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType,
    });

    // const fileLocation = `https://storage.googleapis.com/${this.bucket.name}/${gcsFileName}`;
    const fileLocation = `${subfolder}/${gcsFileName}`;

    return {
      uploadUrl,
      fileLocation: fileLocation, // This is what you store in your DB
    };
  }

  async getReadSignedUrl(gcsFileName: string): Promise<string> {
    const file = this.bucket.file(gcsFileName);

    // Generate the Signed URL
    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    return signedUrl;
  }

  getReadPublicUrl(gcsFileName: string): string {
    const encodedFileName = encodeURIComponent(gcsFileName);
    return `https://storage.googleapis.com/${envVars.STORAGE_BUCKET_NAME}/${encodedFileName}`;
  }

  getGsUri(gcsFileName: string): string {
    return `gs://${this.bucket.name}/${gcsFileName}`;
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

  async downloadToTemp(gcsPath: string, localPath: string): Promise<void> {
    const cleanPath = gcsPath.replace(`gs://${this.bucket.name}/`, '');
    await this.bucket.file(cleanPath).download({
      destination: localPath,
    });
  }

  async uploadFromTemp(
    localPath: string,
    destinationPath: string,
    contentType: string,
  ): Promise<void> {
    await this.bucket.upload(localPath, {
      destination: destinationPath,
      metadata: { contentType: contentType || 'application/octet-stream' },
    });
  }

  generateSafeFilename(file: Express.Multer.File): string {
    const ext = extname(file.originalname);
    const timestamp = Date.now();
    const randomStr = randomBytes(8).toString('hex');
    return `${timestamp}-${randomStr}${ext}`;
  }
}
