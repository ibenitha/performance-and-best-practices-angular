// PERFORMANCE LAB: typed model replaces the `any` used by the legacy component.
export interface Todo {
  id: number;
  description: string;
  completed: boolean;
}

// PERFORMANCE LAB: shape of the derived numbers shown in the stats card.
export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
}
