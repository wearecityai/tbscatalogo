// Category is now a dynamic string
export type Category = string;

export interface CategoryData {
  name: string;
  description: string;
}

export interface MaterialData {
  name: string;
  description: string;
}

export interface CollectionData {
  name: string;
  description: string;
}

// Collection is just the string identifier (name) used in Products
export type Collection = string;

export interface Product {
  id: string;
  name: string;
  category: string; // Dynamic category
  collection: string;
  price: string;
  description: string;
  material: string;
  imageUrl: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface SocialLink {
  platform: string;
  url: string; // url or simply the display text if it's not a link
}

export interface SiteConfig {
  siteName: string;
  logoUrl: string | null;
  footerText: string;
  socialLinks: SocialLink[];
}