import { create } from 'zustand'
import { Subscription } from '@/types/Subscription'

export type LanguagesSupported =
  | 'en'
  | 'de'
  | 'fr'
  | 'es'
  | 'hi'
  | 'ja'
  | 'la'
  | 'ru'
  | 'ur'
  | 'ar'

export const LanguagesSupportedMap: Record<LanguagesSupported, string> = {
  en: 'English',
  de: 'German',
  fr: 'French',
  es: 'Spanish',
  hi: 'Hindi',
  ja: 'Japanese',
  la: 'Latin',
  ru: 'Russian',
  ur: 'Urdu',
  ar: 'Arabic',
}

const FREE_LANGUAGE_SUPPORT = 2

interface LanguageState {
  language: LanguagesSupported
  setLanguage: (language: LanguagesSupported) => void
  getLanguages: (isPro: boolean) => LanguagesSupported[]
  getNotSupportedLanguages: (isPro: boolean) => LanguagesSupported[]
}

export const useLanguageStore = create<LanguageState>()((set, get) => ({
  language: 'en',
  setLanguage: (language: LanguagesSupported) => set({ language }),
  getLanguages: (isPro: boolean) => {
    // If the user is pro, return all the supported languages
    if (isPro) {
      return Object.keys(LanguagesSupportedMap) as LanguagesSupported[]
    }
    // If no pro, return only the first two languages
    return Object.keys(LanguagesSupportedMap).slice(
      0,
      FREE_LANGUAGE_SUPPORT
    ) as LanguagesSupported[]
  },
  getNotSupportedLanguages: (isPro: boolean) => {
    if (isPro) return []
    return Object.keys(LanguagesSupportedMap).slice(
      FREE_LANGUAGE_SUPPORT
    ) as LanguagesSupported[]
  },
}))

interface SubscriptionState {
  subscription: Subscription | null | undefined
  setSubscription: (subscription: Subscription | null) => void
}

export const useSubscriptionStore = create<SubscriptionState>(set => ({
  subscription: undefined,
  setSubscription: (subscription: Subscription | null) => set({ subscription }),
}))
