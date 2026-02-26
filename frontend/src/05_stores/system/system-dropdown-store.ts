import { create } from 'zustand';
import type { SystemDropdown } from '@/04_types/system/system-dropdown';

// Define the store
type SystemDropdownStoreProps = {
  selectedSystemDropdown: SystemDropdown | null;
  setSelectedSystemDropdown: (systemDropdown: SystemDropdown | null) => void;
};

// Create the store
const useSystemDropdownStore = create<SystemDropdownStoreProps>(set => ({
  selectedSystemDropdown: null,
  setSelectedSystemDropdown: systemDropdown =>
    set({ selectedSystemDropdown: systemDropdown }),
}));

export default useSystemDropdownStore;
