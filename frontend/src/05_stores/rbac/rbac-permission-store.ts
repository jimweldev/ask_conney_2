import { create } from 'zustand';
import type { RbacPermission } from '@/04_types/rbac/rbac-permission';

// Define the store
type PermissionStoreProps = {
  selectedPermission: RbacPermission | null;
  setSelectedPermission: (permission: RbacPermission | null) => void;
};

// Create the store
const usePermissionStore = create<PermissionStoreProps>(set => ({
  selectedPermission: null,
  setSelectedPermission: permission => set({ selectedPermission: permission }),
}));

export default usePermissionStore;
