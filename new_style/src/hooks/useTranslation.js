import { useCallback } from 'react';
import { TRANSLATIONS } from '../translations';

export function useTranslation(selectedLanguage = 'en') {
  const t = useCallback((key) => {
    const dict = TRANSLATIONS[selectedLanguage];
    if (dict && dict[key]) return dict[key];
    if (TRANSLATIONS.hi && (selectedLanguage === 'hi' || selectedLanguage === 'bundeli') && TRANSLATIONS.hi[key]) return TRANSLATIONS.hi[key];
    if (TRANSLATIONS.en && TRANSLATIONS.en[key]) return TRANSLATIONS.en[key];
    return key;
  }, [selectedLanguage]);

  return { t };
}

export default useTranslation;

