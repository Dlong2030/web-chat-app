import { Schema, Document, Types } from 'mongoose';

// =============================================
// SUBDOCUMENT INTERFACES
// =============================================

export interface IAuthProvider {
    provider: 'google' | 'facebook' | 'github';
    providerId: string;
    providerEmail?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface IDevice {
    deviceToken: string;
    deviceType: 'ios' | 'android' | 'web';
    deviceName?: string;
    isActive: boolean;
    lastUsedAt: Date;
    createdAt: Date;
}

export interface INotificationSettings {
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    globalMute: boolean;
    muteUntil?: Date;
}

export interface IUserStickerPack {
    packId: Schema.Types.ObjectId;
    purchasedAt: Date;
}

export interface IUser extends Document {
    _id: Types.ObjectId;
    email: string;
    username?: string;
    displayName: string;
    password: string;
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

    // Methods
    toPublicJSON(): Partial<IUser>;
    updateLastSeen(): Promise<IUser>;
    addDevice(deviceData: Partial<IDevice>): Promise<IUser>;
}

// =============================================
// SUBDOCUMENT SCHEMAS
// =============================================

const authProviderSchema = new Schema<IAuthProvider>({
    provider: {
        type: String,
        enum: ['google', 'facebook', 'github'],
        required: true
    },
    providerId: {
        type: String,
        required: true
    },
    providerEmail: String,
    accessToken: String,
    refreshToken: String,
    expiresAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const deviceSchema = new Schema<IDevice>({
    deviceToken: {
        type: String,
        required: true
    },
    deviceType: {
        type: String,
        enum: ['ios', 'android', 'web'],
        required: true
    },
    deviceName: String,
    isActive: {
        type: Boolean,
        default: true
    },
    lastUsedAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const notificationSettingsSchema = new Schema<INotificationSettings>({
    soundEnabled: {
        type: Boolean,
        default: true
    },
    vibrationEnabled: {
        type: Boolean,
        default: true
    },
    globalMute: {
        type: Boolean,
        default: false
    },
    muteUntil: Date
}, { _id: false });

const userStickerPackSchema = new Schema<IUserStickerPack>({
    packId: {
        type: Schema.Types.ObjectId,
        ref: 'StickerPack',
        required: true
    },
    purchasedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

// =============================================
// MAIN USER SCHEMA
// =============================================

export const userSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format']
    },
    username: {
        type: String,
        unique: true,
        sparse: true,
        maxlength: 50
    },
    displayName: {
        type: String,
        required: true,
        maxlength: 100
    },
    password: { // ← Thêm field này
        type: String,
        required: true,
        minlength: 8,
        select: false // Không select password by default để bảo mật
    },
    avatarUrl: String,
    phoneNumber: {
        type: String,
        maxlength: 20
    },
    bio: String,
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    lastSeen: Date,
    status: {
        type: String,
        enum: ['online', 'offline', 'away', 'busy'],
        default: 'offline'
    },
    theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'light'
    },
    language: {
        type: String,
        default: 'vi',
        maxlength: 10
    },
    authProviders: [authProviderSchema],
    devices: [deviceSchema],
    notificationSettings: {
        type: notificationSettingsSchema,
        default: () => ({})
    },
    stickerPacks: [userStickerPackSchema]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// =============================================
// INDEXES
// =============================================

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ status: 1 });
userSchema.index({ lastSeen: -1 });
userSchema.index({ 'authProviders.provider': 1, 'authProviders.providerId': 1 });

// =============================================
// METHODS
// =============================================

userSchema.methods.toPublicJSON = function (this: IUser): Partial<IUser> {
    const user = this.toObject();
    delete user.authProviders;
    delete user.devices;
    delete user.password;
    return user;
};

userSchema.methods.updateLastSeen = function (this: IUser): Promise<IUser> {
    this.lastSeen = new Date();
    this.status = 'online';
    return this.save();
};

userSchema.methods.addDevice = function (this: IUser, deviceData: Partial<IDevice>): Promise<IUser> {
    // Remove existing device with same token
    this.devices = this.devices.filter(d => d.deviceToken !== deviceData.deviceToken);
    // Add new device
    this.devices.push(deviceData as IDevice);
    return this.save();
};