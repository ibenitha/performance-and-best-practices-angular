import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { App } from './app';

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
    expect(el.querySelector('[role=status]')?.textContent).toContain('Loading welcome message');

    tick(600);
    fixture.detectChanges();

    const h1 = el.querySelector('h1')!;
    expect(el.querySelectorAll('h1').length).toBe(1);
    expect(h1.textContent).toContain('My Refactoring App');
    expect(h1.querySelector('script')).toBeNull(); // XSS payload stripped
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
