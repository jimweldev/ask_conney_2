import type { RagActionField } from './rag-action-field';

export type RagAction = {
  id?: number;
  name?: string;
  description?: string;
  endpoint?: string;
  notes?: string;
  default_values?: string;
  fields?: RagActionField[];
  deleted_at?: string;
  created_at?: string;
  updated_at?: string;
};
