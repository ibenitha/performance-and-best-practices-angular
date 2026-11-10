import { Injectable, isDevMode } from '@angular/core';
import { Observable, defer, delay, of, shareReplay } from 'rxjs';

/**
 * PERFORMANCE LAB: Monolithic Refactor.
 * The simulated API call for the header message now lives in its own service
 * instead of inside the component.
 */
@Injectable({ providedIn: 'root' })
export class WelcomeService {
  /**
   * PERFORMANCE LAB: API Caching.
   * defer() waits for the first subscriber before calling the API.
   * shareReplay({ bufferSize: 1, refCount: false }) shares that one call with every
   * subscriber and replays the last value to late subscribers, so the "network"
   * request runs only once however many times this observable is subscribed to.
   * refCount: false keeps the cached value even when all subscribers have left.
   */
  public readonly welcomeMessage$: Observable<string> = defer(() => this.callApi()).pipe(
    shareReplay({ bufferSize: 1, refCount: false })
  );

  /** The simulated HTTP request. Protected so the unit test can count calls. */
  protected callApi(): Observable<string> {
    if (isDevMode()) {
      console.log('API Call: Fetching welcome message (runs once, cached with shareReplay)');
    }
    // PERFORMANCE LAB: the response deliberately contains a <script> to show the sanitizer
    // at work: <strong> is kept, the script is stripped. delay() simulates network latency
    // so the loading state is visible.
    return of(
      `<strong>Welcome back!</strong> Here's what's on your list today.<script>console.warn("XSS: this script should never run");</script>`
    ).pipe(delay(600));
  }
}
