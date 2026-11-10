import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TodoStats } from '../../../../core/models/todo.model';

/**
 * PERFORMANCE LAB: dumb component - the stats tiles and progress bar.
 * It only displays the numbers it is given. With OnPush it re-renders only when the
 * `stats` or `progress` inputs change.
 */
@Component({
  selector: 'app-todo-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      aria-labelledby="summary-heading"
      class="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <h2 id="summary-heading" class="sr-only">Task summary</h2>

      <!-- Stat tiles: a description list pairs each label with its number for screen readers. -->
      <dl class="grid grid-cols-3 gap-2 text-center sm:gap-4">
        <div class="flex flex-col-reverse rounded-xl bg-slate-50 p-3">
          <dt class="text-xs text-slate-600 sm:text-sm">Total</dt>
          <dd class="text-2xl font-bold text-slate-900 sm:text-3xl">{{ stats().total }}</dd>
        </div>
        <div class="flex flex-col-reverse rounded-xl bg-green-50 p-3">
          <dt class="text-xs text-slate-600 sm:text-sm">Completed</dt>
          <dd class="text-2xl font-bold text-green-700 sm:text-3xl">{{ stats().completed }}</dd>
        </div>
        <div class="flex flex-col-reverse rounded-xl bg-amber-50 p-3">
          <dt class="text-xs text-slate-600 sm:text-sm">Pending</dt>
          <dd class="text-2xl font-bold text-amber-700 sm:text-3xl">{{ stats().pending }}</dd>
        </div>
      </dl>

      <!-- Progress bar exposed to assistive technology with role="progressbar". -->
      <div class="mt-5">
        <div class="mb-1 flex items-center justify-between text-sm">
          <span id="progress-label" class="font-medium text-slate-700">Progress</span>
          <span class="font-semibold text-slate-800">{{ progress() }}%</span>
        </div>
        <div
          role="progressbar"
          aria-labelledby="progress-label"
          aria-valuemin="0"
          aria-valuemax="100"
          [attr.aria-valuenow]="progress()"
          class="h-2.5 w-full overflow-hidden rounded-full bg-slate-200"
        >
          <div
            class="h-full rounded-full bg-indigo-600 motion-safe:transition-[width] motion-safe:duration-300"
            [style.width.%]="progress()"
          ></div>
        </div>
      </div>
    </section>
  `,
})
export class TodoSummary {
  readonly stats = input.required<TodoStats>();
  /** Whole-number percentage, 0-100. */
  readonly progress = input.required<number>();
}
