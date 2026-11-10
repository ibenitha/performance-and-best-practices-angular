import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { App } from './app';
import { WelcomeService } from './core/services/welcome.service';

// PERFORMANCE LAB: error state when the simulated API fails.
describe('App (API error)', () => {
  it('announces an error with role="alert" and still shows the tasks', () => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: WelcomeService, useValue: { welcomeMessage$: throwError(() => new Error('offline')) } }],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('[role=alert]')?.textContent).toContain("Couldn't load the welcome message");
    expect(el.textContent).toContain('Build a project');
  });
});

// PERFORMANCE LAB: integration tests for the container component.
describe('App', () => {
  let fixture: ComponentFixture<App>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
    fixture = TestBed.createComponent(App);
    el = fixture.nativeElement;
  });

  it('shows a loading status, then the sanitized welcome message', fakeAsync(() => {
    fixture.detectChanges();
    expect(el.querySelectorAll('h1').length).toBe(1);
    expect(el.querySelector('h1')!.textContent).toContain('To-Do App');
    expect(el.querySelector('[role=status]')?.textContent).toContain('Loading your welcome message');

    tick(600);
    fixture.detectChanges();

    const header = el.querySelector('header')!;
    expect(header.textContent).toContain('Welcome back!');
    expect(header.querySelector('strong')).not.toBeNull(); // safe markup kept
    expect(header.querySelector('script')).toBeNull(); // XSS payload stripped
    expect(el.querySelector('[role=status]')).toBeNull();
  }));

  it('renders the Active and Completed lists from the service', fakeAsync(() => {
    fixture.detectChanges();
    tick(600);
    fixture.detectChanges();

    const headings = Array.from(el.querySelectorAll('h2')).map((h) => h.textContent!.trim());
    expect(headings).toContain('Active (1)');
    expect(headings).toContain('Completed (1)');
  }));

  it('adds a task through the form and clears the input', fakeAsync(() => {
    fixture.detectChanges();
    tick(600);
    const input = el.querySelector<HTMLInputElement>('#new-task')!;
    input.value = 'Ship the lab';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges(); // in the browser every keystroke triggers this tick
    tick();

    el.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(el.textContent).toContain('Ship the lab');
    expect(input.value).toBe('');
  }));
});
