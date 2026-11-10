import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodoForm } from './todo-form';

// PERFORMANCE LAB: the form validates input and only emits real text.
describe('TodoForm', () => {
  let fixture: ComponentFixture<TodoForm>;
  let el: HTMLElement;
  let added: string[];

  beforeEach(async () => {
    fixture = TestBed.createComponent(TodoForm);
    el = fixture.nativeElement;
    added = [];
    fixture.componentInstance.add.subscribe((text) => added.push(text));
    fixture.detectChanges();
    // ngModel inside a <form> registers its control asynchronously.
    await fixture.whenStable();
  });

  function submit(): void {
    el.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    fixture.detectChanges();
  }

  it('has a visible label for the input', () => {
    const label = el.querySelector('label[for="new-task"]');
    expect(label?.textContent).toContain('New task');
    expect(el.querySelector('#new-task')).not.toBeNull();
  });

  it('shows an alert and emits nothing when submitted empty', () => {
    submit();

    expect(added).toEqual([]);
    expect(el.querySelector('[role=alert]')?.textContent).toContain('Please type a task');
    expect(el.querySelector('#new-task')!.getAttribute('aria-invalid')).toBe('true');
  });

  it('emits the trimmed text when submitted with a value', () => {
    const input = el.querySelector<HTMLInputElement>('#new-task')!;
    input.value = '  Buy milk ';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    submit();

    expect(added).toEqual(['Buy milk']);
    expect(el.querySelector('[role=alert]')).toBeNull();
  });
});
