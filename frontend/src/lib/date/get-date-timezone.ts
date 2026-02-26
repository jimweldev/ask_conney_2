import moment from 'moment-timezone';
import type { Timezone } from '@/04_types/_common/timezone';
import useTimezoneStore from '@/05_stores/_common/timezone-store';

export const getDateTimezone = (
  date?: Date | string,
  type: 'date' | 'date_time' = 'date_time',
  timezone?: Timezone,
): string => {
  if (!date) return '';

  const {
    timezone: userTz,
    date_format,
    time_format,
  } = useTimezoneStore.getState();

  const defaultFormats = {
    date: 'MMM D, YYYY',
    time: 'hh:mm:ss A',
  };

  const dateFormat = date_format || defaultFormats.date;
  const timeFormat = time_format || defaultFormats.time;
  const format =
    type === 'date_time' ? `${dateFormat} ${timeFormat}` : dateFormat;

  const resolvedTimezone = timezone || userTz || moment.tz.guess();

  let m;

  // 🧠 Detection rules
  // 1. If Date object or numeric timestamp → interpret as local
  // 2. If string with 'Z' or timezone offset → parse as-is (ISO string)
  // 3. Otherwise, assume the string is UTC (e.g., "2025-10-22 13:40:37")
  if (date instanceof Date || /^\d+$/.test(String(date))) {
    m = moment(date);
  } else if (
    typeof date === 'string' &&
    /([Zz]|[+-]\d{2}:?\d{2})$/.test(date)
  ) {
    m = moment(date); // ISO string already has timezone info
  } else {
    m = moment.utc(date); // assume UTC
  }

  return m.tz(resolvedTimezone).format(format);
};
