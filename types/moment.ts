export type MediaPlatform = 'youtube' | 'vimeo' | 'soundcloud' | 'image' | 'audio';

export interface MomentMedia {
  type: MediaPlatform;
  platform?: 'youtube' | 'vimeo' | 'soundcloud';
  id?: string;
  url?: string;
  src?: string;
  caption?: string;
}

export interface MomentData {
  id: string;
  title: string;
  subtitle?: string;
  category: MomentCategory;
  date?: string;
  description: string;
  media?: MomentMedia;
  tags?: string[];
  color: string;
  position: [number, number, number];
}

export type MomentCategory = 'music' | 'live' | 'party' | 'business' | 'growth' | 'identity';

export interface CategoryInfo {
  label: string;
  color: string;
  icon: string;
}

export const CATEGORIES: Record<MomentCategory, CategoryInfo> = {
  music: { label: 'MUSIC', color: '#60a5fa', icon: '🎵' },
  live: { label: 'LIVE', color: '#a78bfa', icon: '🎸' },
  party: { label: 'PARTY', color: '#fbbf24', icon: '🎉' },
  business: { label: 'BUSINESS', color: '#34d399', icon: '💼' },
  growth: { label: 'LEARNING', color: '#f472b6', icon: '📈' },
  identity: { label: 'IDENTITY', color: '#34d399', icon: '✦' },
};
