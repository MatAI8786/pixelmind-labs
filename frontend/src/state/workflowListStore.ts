import { create } from 'zustand';

export interface WorkflowMeta {
  id: number;
  name: string;
}

interface WorkflowListState {
  list: WorkflowMeta[];
  setList: (items: WorkflowMeta[]) => void;
  add: (item: WorkflowMeta) => void;
}

export const useWorkflowListStore = create<WorkflowListState>((set) => ({
  list: [],
  setList: (items) => set({ list: items }),
  add: (item) => set((state) => ({ list: [...state.list, item] })),
}));
