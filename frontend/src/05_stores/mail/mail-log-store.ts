import { create } from 'zustand';
import type { MailLog } from '@/04_types/mail/mail-log';

// Define the store
type MailLogStoreProps = {
  selectedMailLog: MailLog | null;
  setSelectedMailLog: (mailLog: MailLog | null) => void;
};

// Create the store
const useMailLogStore = create<MailLogStoreProps>(set => ({
  selectedMailLog: null,
  setSelectedMailLog: mailLog => set({ selectedMailLog: mailLog }),
}));

export default useMailLogStore;
