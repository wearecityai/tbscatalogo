export type Category = 'Collares' | 'Aretes' | 'Pulseras' | 'Anillos';

export interface CollectionData {
  name: string;
  description: string;
}

// Collection is just the string identifier (name) used in Products
export type Collection = string;

export interface Product {
  id: string;
  name: string;
  category: Category;
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