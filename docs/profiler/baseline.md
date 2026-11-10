# Performance baseline (legacy app, before refactor)

<!-- PERFORMANCE LAB: baseline measurements taken before any code change -->

Measured on the unmodified legacy app (`ng serve`, development mode, Chrome).

## Change detection per user action

| Action | Change detection ticks | `getStats()` calls | Busy-loop iterations |
| --- | --- | --- | --- |
| Moving the mouse over the component | 0 | 0 | 0 |
| Typing "hello world" (11 keys) | 3 | 54 | 540,000 |
| Pressing Enter to add the task | 2 | 36 | 360,000 |
| Ticking a checkbox | 1 | 18 | 180,000 |

## Findings

- **Mouse movement alone triggers no change detection.** The component has no `mousemove`
  listener, and `hover:` effects are pure CSS, so zone.js has nothing to react to.
- **Every keystroke, click and Enter does.** Each one runs a full check of the whole component
  with the Default strategy. `eventCoalescing: true` merges events that fall in the same
  animation frame, which is why 11 fast key presses produced 3 ticks instead of 11.
- **Each check is expensive.** The template calls `getStats()` 7 times and
  `getProgressPercentage()` twice, and the latter calls `getStats()` again. That's 9 calls per
  pass, each with a 10,000-iteration loop. In development mode Angular checks twice per tick
  (`checkNoChanges`), so one tick = 18 calls = 180,000 wasted iterations.
- **Security:** the header uses `bypassSecurityTrustHtml()`, which disables Angular's
  sanitizer for that HTML. Task descriptions go through `[innerHTML]`, which relies on
  Angular's implicit sanitizer.

## How it was measured

`getStats()` and `getProgressPercentage()` were wrapped with counters from the browser console
(`ng.getComponent(...)`), with no source change. One empty "Add" click (exactly one event) was used
to calibrate: 1 tick = 2 `getProgressPercentage()` calls per pass × 2 passes.

## Screenshots

- `before-angular-devtools.png` – Angular DevTools Profiler
- `before-chrome-performance.png` – Chrome Performance tab
