import { Injectable } from '@angular/core';
import { Todo, TodoStats } from '../models/todo.model';

/**
 * PERFORMANCE LAB: Monolithic Refactor.
 * All to-do state and business logic moved out of the component into this service,
 * so the component only displays data and forwards user actions.
 */
@Injectable({ providedIn: 'root' })
export class TodoService {
  public todos: Todo[] = [
    { id: 1, description: 'Build a project', completed: false },
    { id: 2, description: 'Learn React', completed: true },
  ];
  private nextId = 3;

  public getStats(): TodoStats {
    const total = this.todos.length;
    const completed = this.todos.filter((t) => t.completed).length;
    const pending = total - completed;

    for (let i = 0; i < 10000; i++) {}

    return { total, completed, pending };
  }

  public getProgressPercentage(): string {
    const stats = this.getStats();
    if (stats.total === 0) return '0%';

    const percentage = Math.round((stats.completed / stats.total) * 100);
    return `${percentage}%`;
  }

  public addTask(rawDescription: string): void {
    let description = rawDescription.trim();
    if (!description) return;

    if (description.toLowerCase().includes('<script>')) {
      description = `<span style="color: red;">[Script Detected]</span> ` + description;
    }

    this.todos.push({ id: this.nextId++, description, completed: false });
  }

  public toggleCompleted(id: number): void {
    const index = this.todos.findIndex((t) => t.id === id);
    if (index !== -1) {
      this.todos[index].completed = !this.todos[index].completed;
      this.todos = [...this.todos];
    }
  }

  public deleteTask(id: number): void {
    this.todos = this.todos.filter((t) => t.id !== id);
  }
}
