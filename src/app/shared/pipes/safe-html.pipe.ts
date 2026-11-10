import { Pipe, PipeTransform, SecurityContext, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * PERFORMANCE LAB: Input Sanitization.
 * Rendering user input with [innerHTML] means the browser parses it as HTML, so a task
 * like `<img src=x onerror="steal()">` could run script (XSS). The legacy app made this
 * worse by calling bypassSecurityTrustHtml(), which switches Angular's protection off.
 *
 * This pipe runs DomSanitizer.sanitize() with the HTML context: safe tags such as <b> are
 * kept, while <script>, event handlers (onerror, onclick...) and javascript: URLs are
 * stripped. It never bypasses security. Being a pure pipe, it only re-runs when the input
 * string changes.
 */
@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(value: string | null | undefined): string {
    return this.sanitizer.sanitize(SecurityContext.HTML, value ?? '') ?? '';
  }
}
