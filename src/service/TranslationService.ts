import { LanguageCode } from "../constant";
import ConfigService from "./ConfigService";
import DebugService from "./DebugService";
import { StorageService } from "./StorageService";

// TODO: Could be helpful https://eena.org/wp-content/uploads/2021_06_25_Multilingual_Communications.pdf
interface Translatable {
  text: string;
  translations: {
    [language: string]: Promise<Translation | undefined>,
  };
}

interface Translation {
  from: LanguageCode;
  to: LanguageCode;
  text: string;
}

type CachedTranslatable = Omit<Translatable, 'translations'> & {
  translations: {
    [language: string]: Translation,
  };
}

interface Language {
  code: LanguageCode | string;
  name: string;
}

const STORAGE_KEY = 'translation-cache';

const getTranslatableId = (targetLanguage: string, sourceLanguage?: string): string => {
  let val = targetLanguage;

  if (sourceLanguage)
    val += `-${sourceLanguage}`;

  return val;
}

export class TranslationService {
  private static INSTANCE: TranslationService;
  private cache: Translatable[] = [];

  public static getInstance = () => {
    return TranslationService.INSTANCE;
  }

  static initialize = () => {
    TranslationService.INSTANCE = new TranslationService();
  }

  private maxCacheCount: number;
  private translationEndpoint: string;
  private languagesEndpoint: string;
  private region: string;

  constructor() {
    this.restoreCache();

    const config = this.getConfig();

    this.maxCacheCount = config.maxCacheCount;
    this.translationEndpoint = config.translationEndpoint;
    this.languagesEndpoint = config.languagesEndpoint;
    this.region = config.region;
  }

  private getConfig = () => {
    return ConfigService.get('translation');
  }

  private getApiKey = () => {
    return this.getConfig().apiKey;
  }

  private restoreCache = () => {
    const c: CachedTranslatable[] = StorageService.getInstance().getJson(STORAGE_KEY) || [];

    this.cache = c.map<Translatable>((x) => {
      const ret: Translatable = {
        text: x.text,
        translations: {},
      };

      for (const prop in x.translations) {
        ret.translations[prop] = Promise.resolve(x.translations[prop]);
      }

      return ret;
    });
  }

  private saveCache = async () => {
    const c: CachedTranslatable[] = await Promise.all(this.cache
      .slice(-this.maxCacheCount)
      .map<Promise<CachedTranslatable>>(async (x) => {
        const ret: CachedTranslatable = {
          text: x.text,
          translations: {},
        };

        for (const prop in x.translations) {
          const t = await x.translations[prop]
          if (t)
            ret.translations[prop] = t;
        }

        return ret;
      }));

    StorageService.getInstance().setJson(STORAGE_KEY, c);
  }

  isAvailable = () => {
    // TranslationService is not available if there is no api key
    // apiKey needs to be fetched every time isAvailable is checked, as 
    return !!this.getApiKey();
  }

  getAvailableLanguages = async (): Promise<Language[]> => {
    try {
      const { translation } = await fetch(this.languagesEndpoint)
        .then(x => x.json());

      return Object.keys(translation).map<Language>(x => ({
        code: x,
        name: translation[x].name,
      }));
    } catch (e) {
      const dbg = DebugService.getInstance();
      dbg.error('Could not fetch available languages');
      dbg.error(e);
    }

    return [];
  }

  getTranslation = (text: string, targetLanguage: LanguageCode, sourceLanguage?: LanguageCode): Promise<Translation | undefined> => {
    if (!this.isAvailable())
      return Promise.resolve(undefined);

    const translatableId = getTranslatableId(targetLanguage, sourceLanguage);

    text = text.trim();
    let translatable = this.cache.find(x => x.text === text);

    if (translatable) {
      const translation = translatable.translations[translatableId];

      if (translation)
        return translation;
    }

    let url = `${this.translationEndpoint}&to=${targetLanguage}`;
    if (sourceLanguage)
      url += `&from=${sourceLanguage}`;

    const translationPromise = fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': this.getApiKey(),
        'Ocp-Apim-Subscription-Region': this.region,
      },
      body: JSON.stringify([{
        Text: text,
      }])
    })
      .then(x => x.json())
      .then<Translation | undefined>(x => {
        const firstObject = x[0];

        if (firstObject && Array.isArray(firstObject.translations)) {
          const firstTranslation = firstObject.translations[0];

          return {
            from: sourceLanguage ?? firstObject.detectedLanguage?.language ?? 'unknown',
            to: targetLanguage,
            text: firstTranslation.text,
          };
        }

        return undefined;
      })
      .catch(_ => {
        return undefined;
      });

    if (!translatable) {
      translatable = {
        text,
        translations: {},
      };

      this.cache.push(translatable);
    }

    translatable.translations[translatableId] = translationPromise;

    // save cache
    this.saveCache();

    return translationPromise;
  }
}