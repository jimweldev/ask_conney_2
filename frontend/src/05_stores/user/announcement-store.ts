import { create } from 'zustand';
import type { Notification } from '@/04_types/user/notification';

type AnnouncementStoreProps = {
  announcements: Notification[];
  page: number;
  hasNextPage: boolean;
  setAnnouncements: (announcements: Notification[]) => void;
  appendAnnouncements: (announcements: Notification[]) => void;
  setPage: (page: number) => void;
  setHasNextPage: (hasNextPage: boolean) => void;
};

const useAnnouncementStore = create<AnnouncementStoreProps>(set => ({
  announcements: [],
  page: 1,
  hasNextPage: true,

  setAnnouncements: announcements =>
    set({
      announcements: dedupeAnnouncements(announcements),
    }),

  appendAnnouncements: announcements =>
    set(state => ({
      announcements: dedupeAnnouncements([
        ...state.announcements,
        ...announcements,
      ]),
    })),

  setPage: page => set({ page }),
  setHasNextPage: hasNextPage => set({ hasNextPage }),
}));

// Helper to remove duplicates by `id`
const dedupeAnnouncements = (announcements: Notification[]) => {
  const seen = new Set<number>();
  return announcements.filter(announcement => {
    if (seen.has(announcement.id!)) return false;
    seen.add(announcement.id!);
    return true;
  });
};

export default useAnnouncementStore;
