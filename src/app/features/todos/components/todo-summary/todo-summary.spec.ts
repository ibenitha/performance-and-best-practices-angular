import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodoSummary } from './todo-summary';

// PERFORMANCE LAB: the summary only displays the numbers it receives.
describe('TodoSummary', () => {
  let fixture: ComponentFixture<TodoSummary>;
  let el: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(TodoSummary);
    fixture.componentRef.setInput('stats', { total: 4, completed: 3, pending: 1 });
    fixture.componentRef.setInput('progress', 75);
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  it('shows total, completed and pending counts', () => {
    const values = Array.from(el.querySelectorAll('dd')).map((dd) => dd.textContent!.trim());
    expect(values).toEqual(['4', '3', '1']);
  });

  it('exposes progress as an accessible progressbar', () => {
    const bar = el.querySelector('[role=progressbar]')!;
    expect(bar.getAttribute('aria-valuenow')).toBe('75');
    expect(el.textContent).toContain('75%');
  });
});
