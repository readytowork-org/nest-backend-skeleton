import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

@Injectable()
export class StorageService {
  logger = new Logger(StorageService.name);
  private readonly baseUploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    // Ensure uploads directory exists
    if (!fs.existsSync(this.baseUploadDir)) {
      fs.mkdirSync(this.baseUploadDir, { recursive: true });
      this.logger.log(
        `Created base upload directory at: ${this.baseUploadDir}`,
      );
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
        `Error removing file at ${relativeFilePath}: ${error.message}`,
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
}
