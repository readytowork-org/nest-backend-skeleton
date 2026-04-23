import { UploadFolderEnum } from '@app/common/types';
import { envVars } from '@app/config/env/env.validation';
import { randomUUID } from 'crypto';

export const generateCustomFileName = (
  originalName: string,
  prefix: string,
) => {
  const extension = originalName.split('.').pop();
  const uuid = randomUUID(); // v4 UUID
  const time = Date.now();
  return `${prefix}-${uuid}-${time}.${extension}`;
};

export const buildSubFolderFolderPath = (
  subfolder: UploadFolderEnum,
): string => {
  if (envVars.ENVIRONMENT === 'production') {
    return subfolder;
  } else {
    return `${subfolder}-${envVars.ENVIRONMENT}`;
  }
};

export const buildGoogleDriveFilename = (mimeType) => {
  const now = new Date();
  const jstDate = new Date(
    now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }),
  );
  const yyyy = jstDate.getFullYear();
  const MM = String(jstDate.getMonth() + 1).padStart(2, '0');
  const dd = String(jstDate.getDate()).padStart(2, '0');
  const HH = String(jstDate.getHours()).padStart(2, '0');
  const mm = String(jstDate.getMinutes()).padStart(2, '0');

  const fileName = `${yyyy}年${MM}月${dd}日 ${HH}:${mm}.${mimeType}`;

  return fileName;
};

// Helper to guess mime type from filename
export const getMimeType = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'mp4':
      return 'video/mp4';
    case 'mov':
      return 'video/quicktime'; // iOS Format
    case 'webm':
      return 'video/webm';
    case 'm4a':
      return 'audio/mp4';
    default:
      return 'application/octet-stream'; // Fallback
  }
};
