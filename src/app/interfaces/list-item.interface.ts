export interface ListItem {
  id: number;
  action: string;
  checked: boolean;
  subtasks: Subtask[];
}

interface Subtask {
  id: number;
  action: string;
  checked: boolean;
}
