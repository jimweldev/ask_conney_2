import { create } from 'zustand';
import type { SystemDropdownModule } from '@/04_types/system/system-dropdown-module';

// Define the store
type SystemDropdownModuleStoreProps = {
  selectedSystemDropdownModule: SystemDropdownModule | null;
  setSelectedSystemDropdownModule: (
    systemDropdownModule: SystemDropdownModule | null,
  ) => void;
};

// Create the store
const useSystemDropdownModuleStore = create<SystemDropdownModuleStoreProps>(
  set => ({
    selectedSystemDropdownModule: null,
    setSelectedSystemDropdownModule: systemDropdownModule =>
      set({ selectedSystemDropdownModule: systemDropdownModule }),
  }),
);

export default useSystemDropdownModuleStore;
