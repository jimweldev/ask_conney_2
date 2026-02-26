import { create } from 'zustand';
import type { MailTemplate } from '@/04_types/mail/mail-template';

// Define the store
type MailTemplateStoreProps = {
  selectedMailTemplate: MailTemplate | null;
  setSelectedMailTemplate: (mailTemplate: MailTemplate | null) => void;
};

// Create the store
const useMailTemplateStore = create<MailTemplateStoreProps>(set => ({
  selectedMailTemplate: null,
  setSelectedMailTemplate: mailTemplate =>
    set({ selectedMailTemplate: mailTemplate }),
}));

export default useMailTemplateStore;
