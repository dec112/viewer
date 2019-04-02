import Language from "../constant/Language";
import LanguageShortcut from "../constant/LanguageShortcut";


class LanguageService {
    static INSTANCE = new LanguageService();

    static getInstance() {
        return LanguageService.INSTANCE;
    }

    getSupportedLanguages() {
        return [LanguageShortcut.GERMAN, LanguageShortcut.ENGLISH];
    }

    getLanguageShortcut(language) {
        const currentLanguage = language.toLowerCase();
        switch (currentLanguage) {
            case Language.GERMAN:
                return LanguageShortcut.GERMAN;
            default:
                return LanguageShortcut.ENGLISH;
        }
    }

    getLanguage(languageShortcut) {
        switch (languageShortcut) {
            case LanguageShortcut.ENGlISH:
            case LanguageShortcut.ENGLISH_GB:
            case LanguageShortcut.ENGLISH_US:
                return Language.ENGLISH;
            case LanguageShortcut.GERMAN:
            case LanguageShortcut.GERMAN_DE:
                return Language.GERMAN;
            default:
                return Language.ENGLISH;
        }
    }

    setCurrentLanguage(language) {
        this.language = language;
    }

    getCurrentLanguage() {
        let lang = this.language;

        if (!lang) {
            lang = navigator.language;

            if (navigator.languages)
                lang = navigator.languages[0];

            if (lang === "null" || lang === null) {
                return LanguageShortcut.ENGLISH;
            }
        }

        return lang;
    }
}

export default LanguageService;
