import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { WelcomeService } from './welcome.service';

// PERFORMANCE LAB: proves the shareReplay cache - the simulated API runs only once.
describe('WelcomeService', () => {
  let service: WelcomeService;
  let callApiSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WelcomeService);
    callApiSpy = spyOn<any>(service, 'callApi').and.callThrough();
  });

  it('does not call the API until someone subscribes', () => {
    expect(callApiSpy).not.toHaveBeenCalled();
  });

  it('calls the API once for many subscribers, including late ones', fakeAsync(() => {
    const received: string[] = [];

    service.welcomeMessage$.subscribe((m) => received.push(m));
    service.welcomeMessage$.subscribe((m) => received.push(m));
    tick(600);

    // Late subscriber gets the cached value straight away.
    service.welcomeMessage$.subscribe((m) => received.push(m));

    expect(callApiSpy).toHaveBeenCalledTimes(1);
    expect(received.length).toBe(3);
    expect(received[0]).toContain('My Refactoring App');
  }));
});
