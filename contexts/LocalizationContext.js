import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { NativeModules, Platform } from 'react-native';

import { loadString, saveString } from '../utils/storage';
import esTranslations from '../locales/es';
import isTranslations from '../locales/is';
import zhTranslations from '../locales/zh';

const LANGUAGE_STORAGE_KEY = 'settings.language';
const fallbackLanguage = 'en';
export const supportedLanguages = ['en', 'es', 'is', 'zh'];

const resources = {
  en: {},
  es: esTranslations,
  is: isTranslations,
  zh: zhTranslations,
};

const defaultContextValue = {
  language: fallbackLanguage,
  setLanguage: () => {},
  supportedLanguages,
  t: (key, defaultValue, params) => formatTemplate(defaultValue || key, params),
};

const LocalizationContext = createContext(defaultContextValue);

function formatTemplate(template = '', params = {}) {
  if (!template || typeof template !== 'string') {
    return '';
  }
  return template.replace(/\{(\w+)\}/g, (_, token) => {
    if (Object.prototype.hasOwnProperty.call(params, token)) {
      const value = params[token];
      return value === null || value === undefined ? '' : String(value);
    }
    return '';
  });
}

function getNestedTranslation(source, key) {
  if (!source) {
    return undefined;
  }
  return key.split('.').reduce((acc, segment) => {
    if (acc && Object.prototype.hasOwnProperty.call(acc, segment)) {
      return acc[segment];
    }
    return undefined;
  }, source);
}

function detectDeviceLanguage() {
  let locale;
  if (Platform.OS === 'ios') {
    const settings = NativeModules.SettingsManager?.settings;
    locale =
      settings?.AppleLocale ||
      (Array.isArray(settings?.AppleLanguages) ? settings.AppleLanguages[0] : undefined);
  } else {
    locale = NativeModules.I18nManager?.localeIdentifier;
  }

  if (typeof locale !== 'string') {
    return fallbackLanguage;
  }

  const normalized = locale.replace('@', '').split(/[\-_]/)[0].toLowerCase();
  return supportedLanguages.includes(normalized) ? normalized : fallbackLanguage;
}

export function LocalizationProvider({ children }) {
  const [language, setLanguageState] = useState(fallbackLanguage);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const stored = await loadString(LANGUAGE_STORAGE_KEY);
        if (!isMounted) {
          return;
        }
        if (stored && supportedLanguages.includes(stored)) {
          setLanguageState(stored);
          return;
        }
        const deviceLanguage = detectDeviceLanguage();
        setLanguageState(deviceLanguage);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('Localization: failed to load language preference', err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const setLanguage = useCallback(next => {
    setLanguageState(previous => {
      const resolved = typeof next === 'function' ? next(previous) : next;
      const normalized = supportedLanguages.includes(resolved) ? resolved : fallbackLanguage;
      saveString(LANGUAGE_STORAGE_KEY, normalized);
      return normalized;
    });
  }, []);

  const translate = useCallback(
    (key, defaultValue, params) => {
      const dictionary = resources[language] || {};
      const template = getNestedTranslation(dictionary, key);
      const base = typeof template === 'string' ? template : defaultValue || key;
      return formatTemplate(base, params);
    },
    [language],
  );

  const value = useMemo(
    () => ({ language, setLanguage, supportedLanguages, t: translate }),
    [language, setLanguage, translate],
  );

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
}

export function useLocalization() {
  return useContext(LocalizationContext);
}

export function useTranslation() {
  const { t, language } = useLocalization();
  return { t, language };
}

export function getLanguageLabel(code) {
  switch (code) {
    case 'es':
      return 'Español';
    case 'is':
      return 'Íslenska';
    case 'zh':
      return '中文';
    case 'en':
    default:
      return 'English';
  }
}

export function getLanguageDisplayList() {
  return supportedLanguages.map(code => ({ code, label: getLanguageLabel(code) }));
}

export default LocalizationContext;
