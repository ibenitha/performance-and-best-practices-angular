import { ChangeDetectionStrategy, Component, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 * PERFORMANCE LAB: dumb component - the "add task" form.
 * It knows nothing about TodoService. The text is a two-way model() bound to the parent's
 * signal, and a valid submit is emitted through the `add` output.
 */
@Component({
  selector: 'app-todo-form',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="mb-8" novalidate (ngSubmit)="submit()">
      <label for="new-task" class="mb-1 block text-sm font-medium text-slate-700">New task</label>
      <div class="flex flex-col gap-2 sm:flex-row">
        <input
          id="new-task"
          name="description"
          type="text"
          autocomplete="off"
          placeholder="What needs to be done?"
          [ngModel]="description()"
          (ngModelChange)="onType($event)"
          [attr.aria-invalid]="showError()"
          [attr.aria-describedby]="showError() ? 'new-task-error' : 'new-task-hint'"
          class="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 shadow-sm placeholder:text-slate-500"
        />
        <button
          type="submit"
          class="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
        >
          Add task
        </button>
      </div>

      <!-- Validation error is announced; otherwise show a short hint. -->
      @if (showError()) {
        <p id="new-task-error" role="alert" class="mt-2 text-sm text-red-700">
          Please type a task before adding it.
        </p>
      } @else {
        <p id="new-task-hint" class="mt-2 text-xs text-slate-600">
          HTML is allowed but sanitized. Try &lt;b&gt;bold&lt;/b&gt; or a &lt;script&gt; tag.
        </p>
      }
    </form>
  `,
})
export class TodoForm {
  /** Two-way bound text of the input: `[(description)]` in the parent. */
  readonly description = model('');
  /** Emits the trimmed description when the form is submitted with text. */
  readonly add = output<string>();

  protected readonly showError = signal(false);

  protected onType(value: string): void {
    this.description.set(value);
    if (this.showError()) this.showError.set(false);
  }

  protected submit(): void {
    const text = this.description().trim();
    if (!text) {
      this.showError.set(true);
      return;
    }
    this.add.emit(text);
  }
}
