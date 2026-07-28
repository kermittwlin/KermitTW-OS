import { MomentData, MomentCategory } from '@/types/moment';

export const moments: MomentData[] = [
  {
    id: 'ABOUT_ME',
    title: 'ABOUT ME',
    subtitle: 'Kermit',
    category: 'identity',
    description: 'Hi, I\'m Kermit — a curiosity-driven explorer at the intersection of AI, Web3, and knowledge systems. I believe in building tools that augment human thinking and create lasting value.',
    color: '#34d399',
    position: [0, 5.8, -1],
    tags: ['AI', 'Web3', 'PKM', 'Agents'],
  },
  {
    id: 'hot-mv',
    title: 'HOT(辣) MV',
    subtitle: '李竺芯 HeartShouting ft. DJ K.M',
    category: 'music',
    date: '2024',
    description: '為李竺芯 HeartShouting 擔任編曲的《HOT(辣)》MV。融合電子音色與流行元素，打造充滿能量的舞曲風格。',
    media: {
      type: 'youtube',
      platform: 'youtube',
      id: 'Z_qfNV3nzcE',
    },
    color: '#60a5fa',
    position: [5, 3, -2],
    tags: ['編曲', 'MV', '電子音樂', 'Pop'],
  },
  {
    id: 'animation-score',
    title: '動畫配樂',
    subtitle: 'Original Animation Soundtrack',
    category: 'music',
    date: '2024',
    description: '為獨立動畫創作的原聲配樂。以電子音色描繪角色的情感轉折，從寂靜到爆發，從迷茫到觉醒。',
    media: {
      type: 'vimeo',
      platform: 'vimeo',
      id: '25065555',
    },
    color: '#60a5fa',
    position: [-5, 3, -2],
    tags: ['配樂', '動畫', '原聲', 'Electronic'],
  },
  {
    id: 'soundcloud-works',
    title: 'SOUNDCLOUD',
    subtitle: 'Electronic Music Collection',
    category: 'music',
    description: '我的電子音樂創作收藏。從實驗性的聲音探索到節奏驅動的舞曲，記錄著我在音樂上的嘗試與成長。',
    media: {
      type: 'soundcloud',
      platform: 'soundcloud',
      url: 'https://soundcloud.com/kermittw',
    },
    color: '#60a5fa',
    position: [0, 4, -3],
    tags: ['電子音樂', 'SoundCloud', 'Producer'],
  },
  {
    id: 'party-curation',
    title: 'PARTY 策展',
    subtitle: 'Event Curation',
    category: 'party',
    description: '超過 10 場派對活動策展。從場地規劃、DJ 安排到視覺設計，每場活動都是一次完整的體驗設計。',
    color: '#fbbf24',
    position: [-4, -2, -2],
    tags: ['策展', '派對', '活動設計', 'Event'],
  },
  {
    id: 'beauty-metaverse',
    title: '美業元宇宙',
    subtitle: 'Beauty Metaverse Content Director',
    category: 'business',
    description: '擔任美業元宇宙內容長，帶領團隊探索虛實整合的美業新體驗。從 XR 技術應用到虛擬試妝，重新定義美業的數位邊界。',
    color: '#34d399',
    position: [4, -3, -2],
    tags: ['元宇宙', '美業', 'XR', '內容策略'],
  },
  {
    id: 'beauty-marketing',
    title: '美業行銷企劃',
    subtitle: 'Beauty Industry Marketing',
    category: 'business',
    description: '為美業品牌打造整合行銷企劃。從品牌定位、社群經營到活動執行，協助品牌在數位時代中找到獨特的聲音。',
    color: '#34d399',
    position: [5, -1, -2],
    tags: ['行銷', '美業', '品牌策略', 'Marketing'],
  },
  {
    id: 'esports-curation',
    title: '電玩實況大型策展',
    subtitle: 'Esports Live Event Director',
    category: 'business',
    description: '統籌電玩實況業的大型策展活動。從舞台設計、即時互動系統到觀眾體驗，打造沉浸式的電玩盛會。',
    color: '#34d399',
    position: [-5, -4, -2],
    tags: ['電玩', '策展', '實況', 'Esports'],
  },
  {
    id: 'self-media',
    title: '自媒體策展統籌',
    subtitle: 'Self-Media Curation',
    category: 'business',
    description: '統籌自媒體內容策劃與執行。從內容定位、視覺風格到發布節奏，建立一致且有辨識度的自媒體品牌。',
    color: '#34d399',
    position: [-3, -5, -2],
    tags: ['自媒體', '內容策劃', '品牌', 'Social Media'],
  },
];

export function getMomentById(id: string): MomentData | undefined {
  return moments.find(m => m.id === id);
}

export function getMomentsByCategory(category: MomentCategory): MomentData[] {
  return moments.filter(m => m.category === category);
}

export function getInteractiveMoments(): MomentData[] {
  return moments.filter(m => m.media || m.id === 'ABOUT_ME');
}
