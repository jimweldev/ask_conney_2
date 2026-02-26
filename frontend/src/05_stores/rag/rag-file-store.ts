import { create } from 'zustand';
import type { RagFile } from '@/04_types/rag/rag-file';

// Define the store
type RagFileStoreProps = {
  selectedRagFile: RagFile | null;
  setSelectedRagFile: (ragFile: RagFile | null) => void;
};

// Create the store
const useRagFileStore = create<RagFileStoreProps>(set => ({
  selectedRagFile: null,
  setSelectedRagFile: ragFile => set({ selectedRagFile: ragFile }),
}));

export default useRagFileStore;
