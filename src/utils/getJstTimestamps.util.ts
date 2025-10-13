import * as dayjs from 'dayjs';
import * as relativeTime from 'dayjs/plugin/relativeTime';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

const userTimezone = 'Asia/Tokyo';

export const getJstBaseTimestamps = (options?: {
  includeDeletedAt?: boolean;
}) => {
  const jstDate = getCurrentJstTime();
  const result: {
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
  } = {
    createdAt: jstDate,
    updatedAt: jstDate,
  };

  if (options?.includeDeletedAt) {
    result.deletedAt = jstDate;
  }

  return result;
};

export const getCurrentJstTime = () => {
  const jstTime = dayjs().tz(userTimezone).format('YYYY-MM-DD HH:mm:ss');
  return jstTime;
};
