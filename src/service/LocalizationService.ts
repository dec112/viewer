import { translations } from '../i18n';
import { LanguageCode } from "../constant/LanguageCode";
import { IntlShape } from 'react-intl';

export class LocalizationService {
    static INSTANCE = new LocalizationService();
    static readonly FALLBACK_LANGUAGE = LanguageCode.ENGLISH;

    constructor(
        public intlProvider?: IntlShape,
        public language?: LanguageCode,
    ) { }

    static getInstance() {
        return LocalizationService.INSTANCE;
    }

    static simplifyLanguageCode(languageCode: LanguageCode) {
        switch (languageCode) {
            case LanguageCode.GERMAN:
            case LanguageCode.GERMAN_DE:
            case LanguageCode.GERMAN_AT:
                return LanguageCode.GERMAN;
            case LanguageCode.ENGLISH:
            case LanguageCode.ENGLISH_GB:
            case LanguageCode.ENGLISH_US:
                return LanguageCode.ENGLISH;
            default:
                return languageCode;
        }
    }

    setCurrentLanguage(language?: LanguageCode) {
        this.language = language;
    }

    getCurrentLanguage(): LanguageCode {
        let lang = this.language;

        if (!lang) {
            const navigatorLang = navigator.language || navigator.languages[0];

            if (navigatorLang !== 'null' && navigatorLang !== null) {
                // Hm, I don't know if there is a better way to get the typescript enum by its value
                const entries = Object.entries(LanguageCode);
                const found = entries.filter(([key, value]) => value === navigatorLang);

                if (found.length > 0) {
                    // Object.entries produces an array with [String, LanguageCode]
                    // Here, we take the first LanguageCode that was found
                    lang = found[0][1];
                }
            }
        }

        if (!lang)
            lang = LocalizationService.FALLBACK_LANGUAGE;

        return LocalizationService.simplifyLanguageCode(lang);
    }

    setIntlProvider(provider: any) {
        this.intlProvider = provider;
    }

    getMessages = () => (translations as any)[this.getCurrentLanguage()] || translations.en;

    formatMessage = (message: string, options?: any) => {
        if (this.intlProvider)
            // we don't use MessageDesciptor, we just use simple strings
            // @ts-ignore
            return this.intlProvider.formatMessage(message, options);
    }

    formatDate = (date: Date, options?: any) => {
        if (this.intlProvider)
            return this.intlProvider.formatDate(date, options);
    }

    getTextFromLanguageObject(languageObject: any): string | undefined {
        if (!languageObject)
            return undefined;

        const langShortcut = this.getCurrentLanguage();
        let text = '';

        if (typeof languageObject === 'string')
            text = languageObject;
        else if (languageObject.hasOwnProperty(langShortcut))
            text = languageObject[langShortcut];
        else if (languageObject.hasOwnProperty(LocalizationService.FALLBACK_LANGUAGE))
            text = languageObject[LocalizationService.FALLBACK_LANGUAGE];
        else {
            // if correct key could not be found, take the first available one
            const key = Object.keys(languageObject)[0];

            if (key)
                text = languageObject[key];
            else
                // no text available
                return undefined;
        }

        return text;
    }
}