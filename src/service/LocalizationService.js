import de from '../i18n/de';
import en from '../i18n/en';
import Messages from "../i18n/Messages";
import LanguageService from "./LanguageService";
import LanguageShortcut from "../constant/LanguageShortcut";

class LocalizationService {
    static INSTANCE = new LocalizationService();

    static getInstance() {
        return LocalizationService.INSTANCE;
    }

    getMessages(currentLanguage) {
        const languageService = LanguageService.getInstance();
        const language = (currentLanguage) ? currentLanguage : languageService.getCurrentLanguage();
        switch (language) {
            case LanguageShortcut.ENGlISH:
            case LanguageShortcut.ENGLISH_GB:
            case LanguageShortcut.ENGLISH_US:
                return en;
            case LanguageShortcut.GERMAN:
            case LanguageShortcut.GERMAN_DE:
                return de;
            default:
                return en;
        }
    }

    getLocalizedStrings(keys, languageProvider) {
        let localizedStrings = [];
        for (let i = 0; i < keys.length; i++) {
            if (Messages[keys[i]]) {
                localizedStrings.push(this.getLocalizedString(keys[i], languageProvider));
            }
        }
        return localizedStrings;
    }

    getLocalizedString(string, languageProvider) {
        return languageProvider.formatMessage(Messages[string]);
    }
}

export default LocalizationService;
