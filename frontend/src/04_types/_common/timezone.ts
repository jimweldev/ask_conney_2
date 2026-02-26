import type { timezones } from '@/data/timezones';

// Type from the array
export type Timezone = (typeof timezones)[number];
