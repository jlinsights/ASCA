export type Language = "ko" | "en" | "ja" | "zh"

export type TranslationKey = 
  // Navigation
  | "exhibition" | "artworks" | "artists" | "events" | "catalog" | "about" 
  | "organization" | "support" | "brand" | "language" | "news" | "search"
  | "signIn" | "signUp" | "menu"
  
  // Exhibition
  | "currentExhibitions" | "upcomingExhibitions" | "pastExhibitions" | "onlineExhibitions"
  
  // Artworks
  | "hangeulCalligraphy" | "hanjaCalligraphy" | "literatiPainting" | "inkPainting"
  | "orientalPainting" | "folkPainting" | "modernCalligraphy" | "calligraphyArt"
  | "sealEngraving" | "woodEngraving" | "photography" | "video"
  
  // Artists
  | "openCallArtists" | "youngArtists" | "recommendedArtists" | "invitedArtists"
  
  // Common
  | "all" | "category" | "style" | "sort" | "search" | "featured"
  | "traditional" | "contemporary" | "modern" | "available" | "sold"
  | "views" | "likes" | "signOut"

export type TranslationData = Record<Language, Record<string, string>>

export type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
} 