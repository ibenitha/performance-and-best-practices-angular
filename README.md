# To-Do App: Performance & Best Practices (Angular)

A small Angular to-do app, refactored from a legacy monolithic component into a fast,
maintainable and secure application using **OnPush change detection, signals, `computed()`,
the async pipe, `shareReplay` caching, `DomSanitizer` and reusable components**.

## Features

- Add, complete and delete tasks
- Live stats (total, completed, pending) and a progress bar
- Separate Active and Completed lists with empty states
- Welcome message loaded from a simulated API, with loading and error states
- Task text may contain simple HTML, which is sanitized to block XSS
- Responsive layout (phone, tablet, desktop) and keyboard / screen-reader friendly

## Tech stack

- Angular 20 (standalone components, signals, built-in control flow)
- RxJS 7
- Tailwind CSS 4
- Karma + Jasmine for unit tests
- Netlify for hosting

## Getting started

Requires Node.js 20.19+ (or 22.12+).

```bash
npm install
npm start          # http://localhost:4200
```

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the dev server |
| `npm run build` | Production build into `dist/` |
| `npm test` | Run unit tests (Karma, watch mode) |
| `npx ng test --watch=false` | Run unit tests once |

## Architecture

```
App (smart container: talks to services)
├── TodoForm     input + "Add task"        [(description)] → (add)
├── TodoSummary  stats tiles + progress     [stats] [progress]
├── TodoList     "Active"                   [todos] → (toggle) (remove)
│   └── TodoItem one row per task           [todo]  → (toggle) (remove)
└── TodoList     "Completed" (same component, different inputs)

TodoService     signal state, computed() derived state, immutable updates
WelcomeService  simulated API call, cached with shareReplay
SafeHtmlPipe    DomSanitizer.sanitize(SecurityContext.HTML, …)
```

- **Services hold all state and logic.** Components never change data themselves.
- **Dumb components** receive data through `input()` and report actions through `output()`.
  Every component uses `ChangeDetectionStrategy.OnPush`.
- **Signals:** `todos` is a private writable signal exposed read-only. Stats, progress and
  the two lists are `computed()` values, so they recalculate only when `todos` changes.
- **Immutable updates:** `update()` with `map` / `filter` / spread, never `push` or in-place edits.
- **Lists** use `@for (...; track todo.id)`, the built-in equivalent of `*ngFor` + `trackBy`.
- **Async pipe:** the header subscribes to `welcome$` in the template, so there is no manual
  subscribe/unsubscribe.
- **Caching:** `defer()` + `shareReplay({ bufferSize: 1, refCount: false })` makes the simulated
  request run once for any number of subscribers.
- **Security:** no `bypassSecurityTrustHtml()`. All HTML goes through `SafeHtmlPipe`, which strips
  `<script>`, event handlers and `javascript:` URLs.

## Project structure

```
src/app/
├── app.ts                         smart container component
├── core/
│   ├── models/todo.model.ts       Todo and TodoStats types
│   └── services/
│       ├── todo.service.ts        state + business logic
│       └── welcome.service.ts     simulated API with caching
├── features/todos/components/
│   ├── todo-form/                 add-task form
│   ├── todo-summary/              stats and progress bar
│   ├── todo-list/                 reusable titled list
│   └── todo-item/                 single task row
└── shared/pipes/safe-html.pipe.ts sanitizer pipe
docs/profiler/                     before / after measurements and screenshots
```

## Performance: before vs after

Measured with Angular's profiler hook and Angular DevTools in development mode.
Full details: [baseline](docs/profiler/baseline.md) and [after refactor](docs/profiler/after-refactor.md).

| Action | Before | After |
| --- | --- | --- |
| Move the mouse over the app | 0 change detection runs | 0 change detection runs |
| Type one character | Whole app checked, `getStats()` called 18 times (180,000 loop iterations) | Only `App` and `TodoForm` checked, no stats recalculated |
| Tick a checkbox | Whole app checked, 18 `getStats()` calls | Summary, both lists and the moved row checked once; stats computed once |
| Welcome API call | Once per subscriber | Once in total |

Mouse movement never triggered change detection (no `mousemove` listeners). The big win is the
work done in each run: OnPush skips unchanged components and `computed()` returns cached values.

| Before | After |
| --- | --- |
| ![Angular DevTools profiler before](docs/profiler/before-angular-devtools.png) | ![Angular DevTools profiler after](docs/profiler/after-angular-devtools.png) |
| ![Chrome Performance before](docs/profiler/before-chrome-performance.png) | ![Chrome Performance after](docs/profiler/after-chrome-performance.png) |

## Accessibility

- Semantic structure: one `h1`, `main`, labelled `section`s and real `ul`/`li` lists
- Visible label on the task input; validation error announced with `role="alert"`
- Loading message uses `role="status"`; API error uses `role="alert"`
- Icon buttons have full names, e.g. "Delete task: Build a project"
- Checkboxes are labelled by their task text
- Progress bar exposed with `role="progressbar"` and `aria-valuenow`
- Visible `:focus-visible` outline on all interactive elements
- Colour contrast meets WCAG AA; animations respect `prefers-reduced-motion`

## Responsiveness

Mobile-first Tailwind layout, tested at 375px, 768px and desktop widths with no horizontal
scrolling. The input and button stack on small screens, and long task names wrap.

## Testing

30 unit tests cover:

- `TodoService`: signals, `computed()` memoisation, immutable add / toggle / delete
- `WelcomeService`: the API runs once for multiple and late subscribers
- `SafeHtmlPipe`: strips `<script>`, `onerror` and `javascript:` URLs, keeps safe tags
- Components: inputs, outputs, empty states, validation and accessible names
- `App`: loading state, sanitized header and adding a task

```bash
npx ng test --watch=false
```

## Deployment

Deployed on Netlify using [`netlify.toml`](netlify.toml):

- Build command: `npm run build`
- Publish directory: `dist/performance-and-best-practices-angular/browser`
