export interface ProfileSettings {
  theme: 'light' | 'dark';
  layout: 'qwerty' | 'dvorak' | 'colemak';
  sound: boolean;
  strictMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  keyboardSize?: 'standard' | 'compact';
  keyboardColorCoded?: boolean;
  containerHeight?: 'compact' | 'standard' | 'large';
  accentColor?: 'terracotta' | 'forest' | 'oasis' | 'sand';
  appFontSize?: 'small' | 'medium' | 'large';
  appFontType?: 'sans' | 'serif' | 'mono';
  soundVolume?: number;
  soundProfile?: 'clicky' | 'soft' | 'vintage';
}

export interface Profile {
  id: number;
  name: string;
  settings: ProfileSettings;
  created_at: string;
}

export interface Session {
  id?: number;
  profile_id?: number;
  date?: string;
  wpm: number;
  accuracy: number;
  error_count: number;
  duration: number;
  session_type: 'placement' | 'lesson' | 'custom';
  source_name: string;
  problem_keys: Record<string, number>;
}

export interface CustomText {
  id: number;
  profile_id: number;
  title: string;
  content: string;
  created_at: string;
}

export interface Badge {
  badge_id: string;
  unlocked_at: string;
}

export interface StatsSummary {
  totalSessions: number;
  avgWpm: number;
  avgAccuracy: number;
  totalDuration: number;
  streak: number;
  heatmap: Record<string, number>;
  wpmTrend: Array<{
    date: string;
    wpm: number;
    accuracy: number;
    type: string;
  }>;
}

declare global {
  interface Window {
    api: {
      getProfiles: () => Promise<Profile[]>;
      createProfile: (name: string, settings?: Partial<ProfileSettings>) => Promise<Profile>;
      updateProfileSettings: (id: number, settings: ProfileSettings) => Promise<boolean>;
      saveSession: (profileId: number, session: Session) => Promise<number>;
      getSessions: (profileId: number) => Promise<Session[]>;
      getCustomTexts: (profileId: number) => Promise<CustomText[]>;
      saveCustomText: (profileId: number, title: string, content: string) => Promise<CustomText>;
      deleteCustomText: (profileId: number, textId: number) => Promise<boolean>;
      getBadges: (profileId: number) => Promise<Badge[]>;
      unlockBadge: (profileId: number, badgeId: string) => Promise<boolean>;
      resetProfileData: (profileId: number) => Promise<boolean>;
      getStatsSummary: (profileId: number) => Promise<StatsSummary>;
      uploadTextFile: () => Promise<{ title: string; content: string } | null>;
      extractUrlText: (url: string) => Promise<{ title: string; content: string }>;
    };
  }
}
