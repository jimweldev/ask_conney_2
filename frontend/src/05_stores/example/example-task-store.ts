import { create } from 'zustand';
import type { ExampleTask } from '@/04_types/example/example-task';

// Define the store
type ExampleTaskStoreProps = {
  selectedExampleTask: ExampleTask | null;
  setSelectedExampleTask: (exampleTask: ExampleTask | null) => void;
};

// Create the store
const useExampleTaskStore = create<ExampleTaskStoreProps>(set => ({
  selectedExampleTask: null,
  setSelectedExampleTask: exampleTask =>
    set({ selectedExampleTask: exampleTask }),
}));

export default useExampleTaskStore;
