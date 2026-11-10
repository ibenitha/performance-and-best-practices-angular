import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';

/**
 * PERFORMANCE LAB: Monolithic Refactor.
 * The simulated API call for the header message now lives in its own service
 * instead of inside the component.
 */
@Injectable({ providedIn: 'root' })
export class WelcomeService {
  public fetchWelcomeMessage(): Observable<string> {
    console.log('API Call: Fetching welcome message (no caching)');
    // PERFORMANCE LAB: delay() simulates network latency so the loading state is visible.
    return of(
      '<span style="color: #4f46e5; font-weight: bold;">My Refactoring App (Sanitized)</span><script>console.warn("SECURITY WARNING: XSS vulnerability active in header!");</script>'
    ).pipe(delay(600));
  }
}
