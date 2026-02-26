import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TimezoneStoreProps {
  timezone: string | null;
  date_format: string | null;
  time_format: string | null;
  setTimezone: (timezone: string | null) => void;
  setDateFormat: (date_format: string | null) => void;
  setTimeFormat: (time_format: string | null) => void;
}

const useTimezoneStore = create<TimezoneStoreProps>()(
  persist(
    set => ({
      timezone: null,
      date_format: null,
      time_format: null,
      setTimezone: timezone => set({ timezone }),
      setDateFormat: date_format => set({ date_format }),
      setTimeFormat: time_format => set({ time_format }),
    }),
    {
      name: 'timezone',
    },
  ),
);

export default useTimezoneStore;
