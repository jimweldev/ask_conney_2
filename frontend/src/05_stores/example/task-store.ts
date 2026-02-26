import { create } from 'zustand';
import type { Task } from '@/04_types/example/task';

type TaskStoreProps = {
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
};

const useTaskStore = create<TaskStoreProps>(set => ({
  selectedTask: null,
  setSelectedTask: task => set({ selectedTask: task }),
}));

export default useTaskStore;
