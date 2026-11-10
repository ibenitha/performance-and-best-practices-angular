import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { SafeHtmlPipe } from './shared/pipes/safe-html.pipe';
import { TodoService } from './core/services/todo.service';
import { WelcomeService } from './core/services/welcome.service';
import { TodoForm } from './features/todos/components/todo-form/todo-form';
import { TodoSummary } from './features/todos/components/todo-summary/todo-summary';
import { TodoList } from './features/todos/components/todo-list/todo-list';

// PERFORMANCE LAB: the three states the header can be in while the message loads.
type WelcomeState =
  | { status: 'loading' }
  | { status: 'ready'; message: string }
  | { status: 'error' };

/**
 * PERFORMANCE LAB: smart (container) component.
 * The only component that talks to services. It reads signals from TodoService, passes
 * them down as inputs and turns child outputs into service calls. The children are dumb
 * components that only display data.
 */
@Component({
  selector: 'app-root',
  imports: [AsyncPipe, SafeHtmlPipe, TodoForm, TodoSummary, TodoList],
  // PERFORMANCE LAB: OnPush - Angular only re-checks this component when one of its inputs
  // changes, an event fires inside it, or a signal / async pipe it reads emits.
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
      <!-- PERFORMANCE LAB: RxJS Subscription Fix - the async pipe subscribes when the view is
           created, marks the OnPush view for check on each emission, and unsubscribes
           automatically when the view is destroyed. No manual subscribe/unsubscribe. -->
      <header class="mb-8 text-center">
        <!-- One stable h1; the welcome line below it comes from the simulated API. -->
        <h1 class="text-3xl font-extrabold tracking-tight text-indigo-700 sm:text-4xl">To-Do App</h1>

        @if (welcome$ | async; as welcome) {
          <!-- Loading, ready and error states for the simulated API call. -->
          @if (welcome.status === 'ready') {
            <!-- PERFORMANCE LAB: the API HTML (which contains a script tag) is sanitized, never bypassed. -->
            <p class="mt-2 text-slate-600" [innerHTML]="welcome.message | safeHtml"></p>
          } @else if (welcome.status === 'loading') {
            <p role="status" class="mt-2 inline-flex items-center gap-2 text-slate-600">
              <span aria-hidden="true" class="size-2 rounded-full bg-indigo-500 motion-safe:animate-pulse"></span>
              Loading your welcome message…
            </p>
          } @else {
            <p role="alert" class="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
              Couldn't load the welcome message. Your tasks are still available.
            </p>
          }
        }
      </header>

      <!-- PERFORMANCE LAB: dumb components; data goes down as inputs, events come up as outputs. -->
      <app-todo-form [(description)]="newTaskDescription" (add)="addTask($event)" />

      <app-todo-summary [stats]="stats()" [progress]="progress()" />

      <!-- The same TodoList component is reused for both lists. -->
      <app-todo-list
        title="Active"
        [todos]="activeTodos()"
        [emptyMessage]="activeEmptyMessage()"
        (toggle)="toggleCompleted($event)"
        (remove)="deleteTask($event)"
      />
      <app-todo-list
        title="Completed"
        [todos]="completedTodos()"
        emptyMessage="No completed tasks yet."
        (toggle)="toggleCompleted($event)"
        (remove)="deleteTask($event)"
      />
    </main>
  `,
})
export class App {
  // PERFORMANCE LAB: state and logic come from services (Monolithic Refactor).
  private readonly todoService = inject(TodoService);
  private readonly welcomeService = inject(WelcomeService);

  // PERFORMANCE LAB: State Conversion - the input text is a signal, two-way bound to the
  // form component with [(description)].
  public readonly newTaskDescription = signal('');

  // PERFORMANCE LAB: RxJS Subscription Fix - a declarative stream the template reads with
  // the async pipe. startWith gives the loading state; catchError turns a failure into the
  // error state instead of breaking the stream.
  public readonly welcome$: Observable<WelcomeState> = this.welcomeService.welcomeMessage$.pipe(
    map((message): WelcomeState => ({ status: 'ready', message })),
    catchError(() => of<WelcomeState>({ status: 'error' })),
    startWith<WelcomeState>({ status: 'loading' })
  );

  // PERFORMANCE LAB: read-only signals from the service. The template calls them like
  // stats(), and OnPush re-renders only when one of them actually changes.
  public readonly activeTodos = this.todoService.activeTodos;
  public readonly completedTodos = this.todoService.completedTodos;
  public readonly stats = this.todoService.stats;
  public readonly progress = this.todoService.progress;

  /** Empty-state text for the Active list: no tasks at all vs. everything done. */
  public readonly activeEmptyMessage = computed(() =>
    this.stats().total === 0 ? 'No tasks yet. Add your first one above.' : 'All caught up!'
  );

  public addTask(description: string): void {
    this.todoService.addTask(description);
    this.newTaskDescription.set('');
  }

  public toggleCompleted(id: number): void {
    this.todoService.toggleCompleted(id);
  }

  public deleteTask(id: number): void {
    this.todoService.deleteTask(id);
  }
}
