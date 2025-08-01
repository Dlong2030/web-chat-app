// Auth Provider Interface
export interface IAuthProvider {
  provider: 'google' | 'facebook' | 'apple';
  providerId: string;
  isLinked: boolean;
}

// Device Interface  
export interface IDevice {
  deviceToken: string;
  deviceType: 'web' | 'mobile' | 'desktop';
  deviceName?: string;
  isActive: boolean;
  lastUsedAt: Date;
  createdAt: Date;
}

// Notification Settings Interface
export interface INotificationSettings {
  messages: boolean;
  mentions: boolean;
  reactions: boolean;
  calls: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

// User Sticker Pack Interface
export interface IUserStickerPack {
  packId: string;
  name: string;
  addedAt: Date;
}

// User Interface
export interface User {
  _id: string;
  email: string;
  username?: string;
  displayName: string;
  avatarUrl?: string;
  phoneNumber?: string;
  bio?: string;
  isActive: boolean;
  isVerified: boolean;
  lastSeen?: Date;
  status: 'online' | 'offline' | 'away' | 'busy';
  theme: 'light' | 'dark' | 'auto';
  language: string;
  authProviders: IAuthProvider[];
  devices: IDevice[];
  notificationSettings: INotificationSettings;
  stickerPacks: IUserStickerPack[];
  createdAt: Date;
  updatedAt: Date;
}

// Login Request Interface
export interface LoginRequest {
  email: string;
  password: string;
  deviceToken?: string;
  deviceType?: 'web' | 'mobile' | 'desktop';
  deviceName?: string;
}

// Login Response Interface
export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  error?: string;
}

// API Error Interface
export interface ApiError {
  success: false;
  message: string;
  error: string;
}