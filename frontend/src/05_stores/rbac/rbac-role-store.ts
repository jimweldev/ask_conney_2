import { create } from 'zustand';
import type { RbacRole } from '@/04_types/rbac/rbac-role';

// Define the store
type RoleStoreProps = {
  selectedRole: RbacRole | null;
  setSelectedRole: (role: RbacRole | null) => void;
};

// Create the store
const useRoleStore = create<RoleStoreProps>(set => ({
  selectedRole: null,
  setSelectedRole: role => set({ selectedRole: role }),
}));

export default useRoleStore;
