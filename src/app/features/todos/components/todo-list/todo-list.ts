import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Todo } from '../../../../core/models/todo.model';
import { TodoItem } from '../todo-item/todo-item';

/**
 * PERFORMANCE LAB: reusable dumb component - a titled list of tasks.
 * The same component renders both "Active" and "Completed"; only the inputs differ.
 * Toggle and delete events are passed up to the parent untouched.
 */
@Component({
  selector: 'app-todo-list',
  imports: [TodoItem],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section [attr.aria-labelledby]="headingId()" class="mb-8">
      <h2 [id]="headingId()" class="mb-3 text-lg font-semibold text-slate-800">
        {{ title() }} <span class="font-normal text-slate-600">({{ todos().length }})</span>
      </h2>

      @if (todos().length > 0) {
        <ul class="space-y-2">
          <!-- PERFORMANCE LAB: @for + track is the built-in replacement for *ngFor + trackBy.
               Rows are keyed by todo.id, so after an immutable update Angular keeps the
               existing DOM rows and only adds, removes or updates the ones that changed. -->
          @for (todo of todos(); track todo.id) {
            <li
              app-todo-item
              [todo]="todo"
              (toggle)="toggle.emit($event)"
              (remove)="remove.emit($event)"
            ></li>
          }
        </ul>
      } @else {
        <!-- Empty state -->
        <p class="rounded-xl border border-dashed border-slate-300 p-4 text-center text-slate-600">
          {{ emptyMessage() }}
        </p>
      }
    </section>
  `,
})
export class TodoList {
  readonly title = input.required<string>();
  readonly todos = input.required<readonly Todo[]>();
  readonly emptyMessage = input('Nothing here yet.');

  readonly toggle = output<number>();
  readonly remove = output<number>();

  /** Unique heading id per list, used to label the section. */
  protected readonly headingId = computed(
    () => `${this.title().toLowerCase().replace(/\s+/g, '-')}-heading`
  );
}
