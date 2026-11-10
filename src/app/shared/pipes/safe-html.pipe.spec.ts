import { TestBed } from '@angular/core/testing';
import { SafeHtmlPipe } from './safe-html.pipe';

// PERFORMANCE LAB: XSS payloads must be stripped while harmless markup is kept.
describe('SafeHtmlPipe', () => {
  let pipe: SafeHtmlPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    pipe = TestBed.runInInjectionContext(() => new SafeHtmlPipe());
  });

  it('removes <script> tags', () => {
    const result = pipe.transform('Hi<script>alert(1)</script>');
    expect(result).not.toContain('<script');
    expect(result).toContain('Hi');
  });

  it('removes inline event handlers such as onerror', () => {
    const result = pipe.transform('<img src="x" onerror="alert(1)">');
    expect(result).not.toContain('onerror');
  });

  it('neutralises javascript: URLs', () => {
    // Angular prefixes unsafe URLs with "unsafe:" so the browser can no longer run them.
    const result = pipe.transform('<a href="javascript:alert(1)">link</a>');
    expect(result).not.toContain('href="javascript:');
    expect(result).toContain('unsafe:');
  });

  it('keeps safe formatting tags', () => {
    expect(pipe.transform('<b>Bold</b> task')).toBe('<b>Bold</b> task');
  });

  it('returns an empty string for null or undefined', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});
