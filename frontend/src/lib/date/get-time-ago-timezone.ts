import moment from 'moment-timezone';
import type { Timezone } from '@/04_types/_common/timezone';
import useTimezoneStore from '@/05_stores/_common/timezone-store';

export const getTimeAgoTimezone = (
  date?: Date | string,
  timezone?: Timezone,
): string => {
  if (!date) return '';

  const { timezone: userTz } = useTimezoneStore.getState();
  const resolvedTimezone = timezone || userTz || moment.tz.guess();

  return moment(date).tz(resolvedTimezone).fromNow();
};
