import { Injectable, computed, signal } from '@angular/core';
import { Todo, TodoStats } from '../models/todo.model';

/**
 * PERFORMANCE LAB: Monolithic Refactor.
 * All to-do state and business logic lives here, so components only display data
 * and forward user actions.
 */
@Injectable({ providedIn: 'root' })
export class TodoService {
  // PERFORMANCE LAB: State Conversion - the list is a signal. Only this service can write it;
  // components get a read-only view, so every change goes through the methods below.
  private readonly todosState = signal<Todo[]>([
    { id: 1, description: 'Build a project', completed: false },
    { id: 2, description: 'Learn React', completed: true },
  ]);
  public readonly todos = this.todosState.asReadonly();

  private nextId = 3;

  // PERFORMANCE LAB: Optimize Template Update - derived state uses computed().
  // Each value is memoised: it is recalculated only when `todos` changes, not on every
  // change detection pass like the old getStats() method (called 9 times per check).
  public readonly activeTodos = computed(() => this.todos().filter((t) => !t.completed));
  public readonly completedTodos = computed(() => this.todos().filter((t) => t.completed));

  public readonly stats = computed<TodoStats>(() => {
    const total = this.todos().length;
    const completed = this.completedTodos().length;
    return { total, completed, pending: total - completed };
  });

  /** Whole-number percentage of completed tasks (0-100). */
  public readonly progress = computed(() => {
    const { total, completed } = this.stats();
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  });

  // PERFORMANCE LAB: Improve the Methods Reactivity - every update is immutable.
  // update() receives the current array and returns a NEW array (and new objects for
  // changed items) instead of push() or editing an object in place. A new reference is
  // what lets signals, OnPush and @for's tracking detect the change cheaply.

  // PERFORMANCE LAB: the naive includes('<script>') check was removed - it missed payloads
  // like <img onerror> and changed the user's text. Descriptions are stored as typed and
  // sanitized at render time by SafeHtmlPipe.
  public addTask(rawDescription: string): void {
    const description = rawDescription.trim();
    if (!description) return;

    const newTodo: Todo = { id: this.nextId++, description, completed: false };
    this.todosState.update((todos) => [...todos, newTodo]);
  }

  public toggleCompleted(id: number): void {
    this.todosState.update((todos) =>
      todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }

  public deleteTask(id: number): void {
    this.todosState.update((todos) => todos.filter((t) => t.id !== id));
  }
}
