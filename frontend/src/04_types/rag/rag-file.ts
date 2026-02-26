export type RagFile = {
  id?: number;
  title?: string;
  file_path?: string;
  allowed_locations?: string[];
  allowed_positions?: string[];
  allowed_websites?: string[];
  created_at?: string;
  updated_at?: string;
};
