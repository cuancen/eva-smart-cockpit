export type UiLanguage = 'zh' | 'en';

export function languageFromPreferences(saved: string | null, browserLanguage: string | undefined): UiLanguage {
  if (saved === 'zh' || saved === 'en') return saved;
  return browserLanguage?.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

export function localize(language: UiLanguage, english: string, chinese: string): string {
  return language === 'zh' ? chinese : english;
}
