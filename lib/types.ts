export type Lang = "en" | "kn";

export interface SourceLink {
  label: string;
  url: string;
}

export interface Category {
  id: string;
  label: string;
  kn: string;
  count?: number;
  image?: string;
  lead?: string;
  leadKn?: string;
}

export interface Destination {
  id: string;
  name: string;
  kannada: string;
  category: string;
  taluk: string;
  talukId?: string;
  lat?: number;
  lng?: number;
  image: string;
  blurb: string;
  summary: string;
  visit: string;
  seasons?: string[];
  tags?: string[];
  sources?: SourceLink[];
  elevation?: string;
  difficulty?: string;
  durationMin?: number | null;
  distanceKm?: number | null;
  bestTime?: string;
  bestRoute?: string;
}

export interface Season {
  id: string;
  months: string;
  kn: string;
  title: string;
  text: string;
  experiences: string[];
  watch: string;
}

export interface Story {
  id: string;
  kicker: string;
  title: string;
  image: string;
  paragraphs: string[];
}

export interface PopularPlace {
  id: string;
  featured?: boolean;
  group?: string;
  kicker?: string;
  hours?: string;
  hoursDetail?: string;
  why?: string;
  hoursSource?: SourceLink;
  listed?: string[];
}

export interface OriginChapter {
  id?: string;
  kicker?: string;
  title: string;
  text: string;
  image?: string;
  caption?: string;
}

export interface CoffeeOrigin {
  kicker: string;
  title: string;
  lede: string;
  image: string;
  caption: string;
  saint?: { image?: string; caption?: string };
  chapters: OriginChapter[];
  sources: SourceLink[];
}

export interface MalnadFood {
  id: string;
  name: string;
  kannada: string;
  kicker: string;
  image: string;
  story: string;
  source: SourceLink;
}

export interface TextItem {
  title: string;
  text: string;
}

export interface EssentialBlock {
  title: string;
  items: TextItem[];
}

export interface Taluk {
  id: string;
  name: string;
  kannada: string;
  count: number;
  blurb: string;
  listName?: string;
  mapLabel?: string;
}

export interface Circuit {
  id: string;
  title: string;
  kicker: string;
  image: string;
  places: string[];
  text: string;
}

export interface GalleryItem {
  image: string;
  caption: string;
  credit: string;
}

export interface Credit {
  local?: string;
  place: string;
  file?: string;
  artist: string;
  license: string;
  url?: string;
}

export interface ExploreItem {
  id: string;
  href: string;
  image: string;
  label: string;
  labelKn?: string;
  title: string;
  titleKn?: string;
  lede: string;
  ledeKn?: string;
}

export interface NearbyPlace {
  id: string;
  name: string;
  district: string;
  blurb: string;
  url: string;
}

export interface CkmData {
  site: {
    name: string;
    nameKn: string;
    title: string;
    description: string;
    town: { lat: number; lng: number; name: string };
  };
  official: Record<string, string>;
  categories: Category[];
  destinations: Destination[];
  seasons: Season[];
  stories: Story[];
  popularPlaces: PopularPlace[];
  coffeeOrigin: CoffeeOrigin;
  malnadFoods: MalnadFood[];
  essentials: Record<string, EssentialBlock>;
  guide: { title: string; intro: string; cards: TextItem[] };
  i18n: { en: Record<string, string>; kn: Record<string, string> };
  gallery: GalleryItem[];
  credits: Credit[];
  taluks: Taluk[];
  circuits: Circuit[];
  about: { title: string; kicker: string; image: string; paragraphs: string[] };
  faqs: { q: string; a: string }[];
  packing: string[];
  conduct: { do: string[]; dont: string[] };
  mapNote: string;
  nearbyPlaces: NearbyPlace[];
  explore: ExploreItem[];
}
