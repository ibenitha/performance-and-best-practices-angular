import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodoList } from './todo-list';

// PERFORMANCE LAB: the reusable list renders rows, an empty state and forwards events.
describe('TodoList', () => {
  let fixture: ComponentFixture<TodoList>;
  let el: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(TodoList);
    fixture.componentRef.setInput('title', 'Active');
    fixture.componentRef.setInput('emptyMessage', 'All caught up!');
    el = fixture.nativeElement;
  });

  it('shows the title with a count and one row per todo', () => {
    fixture.componentRef.setInput('todos', [
      { id: 1, description: 'One', completed: false },
      { id: 2, description: 'Two', completed: false },
    ]);
    fixture.detectChanges();

    expect(el.querySelector('h2')!.textContent).toContain('Active');
    expect(el.querySelector('h2')!.textContent).toContain('(2)');
    expect(el.querySelectorAll('li').length).toBe(2);
  });

  it('shows the empty message when there are no todos', () => {
    fixture.componentRef.setInput('todos', []);
    fixture.detectChanges();

    expect(el.querySelector('ul')).toBeNull();
    expect(el.textContent).toContain('All caught up!');
  });

  it('keeps existing row elements when the array is replaced (track by id)', () => {
    const first = { id: 1, description: 'One', completed: false };
    fixture.componentRef.setInput('todos', [first]);
    fixture.detectChanges();
    const rowBefore = el.querySelector('li');

    // New array, same todo plus a new one - like an immutable add.
    fixture.componentRef.setInput('todos', [first, { id: 2, description: 'Two', completed: false }]);
    fixture.detectChanges();

    expect(el.querySelector('li')).toBe(rowBefore);
  });

  it('passes toggle and remove events up', () => {
    fixture.componentRef.setInput('todos', [{ id: 5, description: 'Five', completed: false }]);
    fixture.detectChanges();
    const toggled: number[] = [];
    const removed: number[] = [];
    fixture.componentInstance.toggle.subscribe((id) => toggled.push(id));
    fixture.componentInstance.remove.subscribe((id) => removed.push(id));

    el.querySelector<HTMLInputElement>('input[type=checkbox]')!.click();
    el.querySelector<HTMLButtonElement>('li button')!.click();

    expect(toggled).toEqual([5]);
    expect(removed).toEqual([5]);
  });
});
