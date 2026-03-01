import { create } from 'zustand';
import type { RagAction } from '@/04_types/rag/rag-action';

// Define the store
type RagActionStoreProps = {
  selectedRagAction: RagAction | null;
  setSelectedRagAction: (ragAction: RagAction | null) => void;
};

// Create the store
const useRagActionStore = create<RagActionStoreProps>(set => ({
  selectedRagAction: null,
  setSelectedRagAction: ragAction => set({ selectedRagAction: ragAction }),
}));

export default useRagActionStore;
