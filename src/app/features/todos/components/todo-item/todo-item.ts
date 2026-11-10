import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Todo } from '../../../../core/models/todo.model';
import { SafeHtmlPipe } from '../../../../shared/pipes/safe-html.pipe';

/**
 * PERFORMANCE LAB: dumb component - one task row.
 * Used as an attribute on <li> (`<li app-todo-item>`) so the list stays valid HTML.
 * It receives a todo and emits the id when the user toggles or deletes it.
 */
@Component({
  selector: 'li[app-todo-item]',
  imports: [SafeHtmlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md sm:p-4',
  },
  template: `
    <input
      type="checkbox"
      [id]="checkboxId()"
      [checked]="todo().completed"
      (change)="toggle.emit(todo().id)"
      class="size-5 shrink-0 cursor-pointer accent-indigo-600"
    />
    <!-- The label names the checkbox; the text is sanitized before it becomes HTML. -->
    <label
      [for]="checkboxId()"
      class="min-w-0 flex-1 cursor-pointer [overflow-wrap:anywhere]"
      [class.text-slate-800]="!todo().completed"
      [class.text-slate-500]="todo().completed"
      [class.line-through]="todo().completed"
      [innerHTML]="todo().description | safeHtml"
    ></label>
    <!-- Icon button: the hidden text gives it a full name, e.g. "Delete task: Build a project". -->
    <button
      type="button"
      (click)="remove.emit(todo().id)"
      class="shrink-0 rounded-lg p-2 text-red-700 transition-colors hover:bg-red-50"
    >
      <svg aria-hidden="true" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
      </svg>
      <span class="sr-only">Delete task: <span [innerHTML]="todo().description | safeHtml"></span></span>
    </button>
  `,
})
export class TodoItem {
  readonly todo = input.required<Todo>();
  /** Emits the todo id when the checkbox is toggled. */
  readonly toggle = output<number>();
  /** Emits the todo id when the delete button is pressed. */
  readonly remove = output<number>();

  protected readonly checkboxId = computed(() => `todo-${this.todo().id}`);
}
