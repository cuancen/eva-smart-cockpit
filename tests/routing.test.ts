import { describe, expect, it } from 'vitest';
import { routeFromHash } from '../src/routing';
import { languageFromPreferences } from '../src/shell/locale';

describe('Landing and cockpit routing', () => {
  it.each(['', '#/', '#/landing', '#/classic', '#/board', '#/lab', '#features'])('%s resolves to Landing', (hash) => {
    expect(routeFromHash(hash)).toBe('landing');
  });

  it.each(['#/cockpit', '#/cockpit/manual'])('%s resolves to the cockpit', (hash) => {
    expect(routeFromHash(hash)).toBe('cockpit');
  });
});

describe('Language preference', () => {
  it('uses a saved language before the browser language', () => {
    expect(languageFromPreferences('en', 'zh-CN')).toBe('en');
    expect(languageFromPreferences('zh', 'en-US')).toBe('zh');
  });

  it('defaults to Chinese only when the browser language starts with zh', () => {
    expect(languageFromPreferences(null, 'zh-TW')).toBe('zh');
    expect(languageFromPreferences(null, 'en-GB')).toBe('en');
    expect(languageFromPreferences('invalid', undefined)).toBe('en');
  });
});
