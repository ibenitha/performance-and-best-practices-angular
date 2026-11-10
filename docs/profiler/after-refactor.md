# Performance after the refactor

<!-- PERFORMANCE LAB: after measurements, same actions as baseline.md -->

Measured on the refactored app (`ng serve`, development mode, Chrome) with Angular's own
profiler hook (`ng.ɵsetProfiler`, the same hook Angular DevTools uses). It counts every change
detection run and every component template that is actually checked.

## Change detection per user action

| Action | Change detection runs | Templates checked | Stats recalculated |
| --- | --- | --- | --- |
| Moving the mouse over the component | 0 | none | 0 |
| Typing "hello world" (11 keys) | 6 | App + TodoForm only (6 each) | 0 |
| Pressing Enter to add the task | 2 | App, TodoForm, TodoSummary ×1, lists, new row | 1 |
| Ticking a checkbox | 1 | App, TodoSummary ×1, both lists, moved row | 1 |

## Before vs after

| | Before | After |
| --- | --- | --- |
| Work per change detection run | Whole monolithic template, `getStats()` ×9 per pass (90,000 loop iterations) | Only components whose inputs or signals changed |
| While typing | Every keystroke recalculated all stats | Stats, summary and lists are skipped completely |
| Derived state | Recomputed on every check | `computed()`: recalculated once per real change |
| List rendering | `*ngFor` without tracking | `@for` with `track todo.id`: existing rows are reused |
| API call | Re-runs for every subscriber | Runs once (`shareReplay`) |

## Reading the numbers honestly

- **Mouse movement never triggered change detection**, before or after. There are no
  `mousemove` listeners and hover effects are CSS only.
- **The number of runs per action stays similar.** zone.js still starts one run per DOM event
  (the run count while typing depends on how many keys fall into one animation frame). What
  changed is **how much work each run does**: OnPush skips every component whose inputs and
  signals didn't change, and `computed()` returns cached values instead of recalculating.
- Going zoneless (`provideZonelessChangeDetection()`) would also cut the number of runs. The
  app is ready for it, since all state is signals or the async pipe.

## Screenshots

- `after-angular-devtools.png` – Angular DevTools Profiler
- `after-chrome-performance.png` – Chrome Performance tab
