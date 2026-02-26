import { create } from 'zustand';
import type { SystemSetting } from '@/04_types/system/system-setting';

// Define the store
type SystemSettingStoreProps = {
  selectedSystemSetting: SystemSetting | null;
  setSelectedSystemSetting: (systemSetting: SystemSetting | null) => void;
};

// Create the store
const useSystemSettingStore = create<SystemSettingStoreProps>(set => ({
  selectedSystemSetting: null,
  setSelectedSystemSetting: systemSetting =>
    set({ selectedSystemSetting: systemSetting }),
}));

export default useSystemSettingStore;
