import { create } from 'zustand';
import type { User } from '@/04_types/user/user';

// Define the store
type UserStoreProps = {
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
};

// Create the store
const useUserStore = create<UserStoreProps>(set => ({
  selectedUser: null,
  setSelectedUser: (user: User | null) => set({ selectedUser: user }),
}));

export default useUserStore;
