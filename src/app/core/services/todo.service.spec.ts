import { TestBed } from '@angular/core/testing';
import { TodoService } from './todo.service';

// PERFORMANCE LAB: tests for signal state, computed() derived state and immutable updates.
describe('TodoService', () => {
  let service: TodoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TodoService);
  });

  it('starts with the two seed tasks and derived stats', () => {
    expect(service.todos().length).toBe(2);
    expect(service.stats()).toEqual({ total: 2, completed: 1, pending: 1 });
    expect(service.progress()).toBe(50);
    expect(service.activeTodos().map((t) => t.description)).toEqual(['Build a project']);
    expect(service.completedTodos().map((t) => t.description)).toEqual(['Learn React']);
  });

  it('adds a trimmed task and ignores blank input', () => {
    service.addTask('   Write tests  ');
    service.addTask('    ');

    expect(service.todos().length).toBe(3);
    expect(service.todos()[2]).toEqual({ id: 3, description: 'Write tests', completed: false });
  });

  it('replaces the array instead of mutating it when adding', () => {
    const before = service.todos();
    service.addTask('New task');

    expect(service.todos()).not.toBe(before);
    expect(before.length).toBe(2);
  });

  it('toggles immutably: only the toggled todo gets a new object', () => {
    const [first, second] = service.todos();
    service.toggleCompleted(first.id);
    const [newFirst, newSecond] = service.todos();

    expect(newFirst.completed).toBeTrue();
    expect(first.completed).toBeFalse(); // the original object was not changed
    expect(newFirst).not.toBe(first);
    expect(newSecond).toBe(second); // untouched rows keep their reference
  });

  it('deletes a task by id and updates the computed values', () => {
    service.deleteTask(2);

    expect(service.todos().map((t) => t.id)).toEqual([1]);
    expect(service.stats()).toEqual({ total: 1, completed: 0, pending: 1 });
    expect(service.progress()).toBe(0);
  });

  it('memoises computed stats until the todos change', () => {
    const stats = service.stats();
    expect(service.stats()).toBe(stats); // same object: not recalculated

    service.addTask('Another');
    expect(service.stats()).not.toBe(stats);
  });

  it('reports 0% progress when there are no tasks', () => {
    service.deleteTask(1);
    service.deleteTask(2);

    expect(service.progress()).toBe(0);
  });
});
