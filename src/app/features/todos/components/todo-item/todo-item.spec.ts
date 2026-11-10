import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodoItem } from './todo-item';

// PERFORMANCE LAB: the dumb row only renders its input and emits ids.
describe('TodoItem', () => {
  let fixture: ComponentFixture<TodoItem>;
  let el: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(TodoItem);
    fixture.componentRef.setInput('todo', { id: 7, description: 'Walk the dog', completed: false });
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  it('labels the checkbox with the task text', () => {
    const checkbox = el.querySelector<HTMLInputElement>('input[type=checkbox]')!;
    const label = el.querySelector(`label[for="${checkbox.id}"]`)!;
    expect(label.textContent).toContain('Walk the dog');
    expect(checkbox.checked).toBeFalse();
  });

  it('gives the delete button a name that makes sense on its own', () => {
    expect(el.querySelector('button')!.textContent!.trim()).toBe('Delete task: Walk the dog');
  });

  it('emits the id on toggle and on delete', () => {
    const toggled: number[] = [];
    const removed: number[] = [];
    fixture.componentInstance.toggle.subscribe((id) => toggled.push(id));
    fixture.componentInstance.remove.subscribe((id) => removed.push(id));

    el.querySelector<HTMLInputElement>('input[type=checkbox]')!.click();
    el.querySelector<HTMLButtonElement>('button')!.click();

    expect(toggled).toEqual([7]);
    expect(removed).toEqual([7]);
  });

  it('strikes through completed tasks', () => {
    fixture.componentRef.setInput('todo', { id: 7, description: 'Walk the dog', completed: true });
    fixture.detectChanges();
    expect(el.querySelector('label')!.classList).toContain('line-through');
  });
});
