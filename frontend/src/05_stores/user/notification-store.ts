import { create } from 'zustand';
import type { Notification } from '@/04_types/user/notification';
import { mainInstance } from '@/07_instances/main-instance';

export type UnreadNotificationsCount = { unreadNotificationsCount: number };

type NotificationStoreProps = {
  // VARIABLES
  // notifications
  selectedNotification: Notification | null;
  unreadNotificationsCount: UnreadNotificationsCount | null;
  notifications: Notification[];
  notificationPage: number;
  notificationHasNextPage: boolean;
  notificationsViewed: number[];

  // FUNCTIONS

  // notifications
  setNotifications: (notifications: Notification[]) => void;
  setUnreadNotificationsCount: (
    unreadNotificationsCount: UnreadNotificationsCount,
  ) => void;
  viewNotification: (notification: Notification) => void;
  notificationSetPage: (page: number) => void;
  notificationSetHasNextPage: (hasNextPage: boolean) => void;
};

const useNotificationStore = create<NotificationStoreProps>((set, get) => ({
  // VARIABLES
  selectedNotification: null,

  // notifications
  notifications: [],
  unreadNotificationsCount: null,
  notificationPage: 1,
  notificationHasNextPage: true,
  notificationsViewed: [],

  // FUNCTIONS
  // notifications
  setNotifications: notifications => {
    const { notificationsViewed } = get();

    const updated = dedupeNotifications(notifications).map(n =>
      notificationsViewed.includes(n.id!) ? { ...n, is_read: true } : n,
    );

    set({ notifications: updated });
  },
  setUnreadNotificationsCount: (
    unreadNotificationsCount: UnreadNotificationsCount,
  ) => {
    set({ unreadNotificationsCount });
  },
  viewNotification: notification => {
    if (notification.is_read) return;

    mainInstance.patch(`/notifications/${notification.id}`);

    set(state => ({
      notifications: state.notifications.map(n =>
        n.id === notification.id ? { ...n, is_read: true } : n,
      ),
      selectedNotification: notification,
      notificationsViewed: state.notificationsViewed.includes(notification.id!)
        ? state.notificationsViewed
        : [...state.notificationsViewed, notification.id!],
    }));
  },
  notificationSetPage: notificationPage => {
    set({ notificationPage });
  },
  notificationSetHasNextPage: notificationHasNextPage => {
    set({ notificationHasNextPage });
  },
}));

// Helper to remove duplicates by `id`
const dedupeNotifications = (notifications: Notification[]) => {
  const seen = new Set<number>();
  return notifications.filter(notification => {
    if (seen.has(notification.id!)) return false;
    seen.add(notification.id!);
    return true;
  });
};

export default useNotificationStore;
