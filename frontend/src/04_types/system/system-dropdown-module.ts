import type { SystemDropdownModuleType } from './system-dropdown-module-type';

export type SystemDropdownModule = {
  id?: number;
  label?: string;
  system_dropdown_module_types?: SystemDropdownModuleType[];
  created_at?: string;
  updated_at?: string;
};
