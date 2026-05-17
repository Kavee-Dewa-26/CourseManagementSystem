import { createHttpError } from '@shared/errors';

export type UserRole   = 'member' | 'student' | 'leader' | 'g12' | 'admin' | 'super_admin';
export type UserStatus = 'pending_approval' | 'approved' | 'rejected' | 'suspended';

export interface NotificationPreferences {
  email: boolean;
  push:  boolean;
}

export interface UserProps {
  uid:                      string;
  email:                    string;
  firstName:                string;
  lastName:                 string;
  role:                     UserRole;
  roles:                    UserRole[];
  status:                   UserStatus;
  profilePhotoUrl:          string | null;
  preferredLanguage?:       string;
  fcmTokens?:               string[];
  notificationPreferences?: NotificationPreferences;
  providers?:               string[];
  createdAt:                string;
  updatedAt:                string;
  deletedAt:                string | null;
}

export class User {
  readonly uid:                string;
  readonly email:              string;
  firstName:                   string;
  lastName:                    string;
  readonly role:               UserRole;
  roles:                       UserRole[];
  status:                      UserStatus;
  profilePhotoUrl:             string | null;
  preferredLanguage:           string;
  fcmTokens:                   string[];
  notificationPreferences:     NotificationPreferences;
  providers:                   string[];
  readonly createdAt:          string;
  updatedAt:                   string;
  deletedAt:                   string | null;

  constructor(props: UserProps) {
    this.uid                      = props.uid;
    this.email                    = props.email;
    this.firstName                = props.firstName;
    this.lastName                 = props.lastName;
    this.role                     = props.role;
    this.roles                    = props.roles;
    this.status                   = props.status;
    this.profilePhotoUrl          = props.profilePhotoUrl;
    this.preferredLanguage        = props.preferredLanguage ?? 'en';
    this.fcmTokens                = props.fcmTokens ?? [];
    this.notificationPreferences  = props.notificationPreferences ?? { email: true, push: true };
    this.providers                = props.providers ?? ['password'];
    this.createdAt                = props.createdAt;
    this.updatedAt                = props.updatedAt;
    this.deletedAt                = props.deletedAt;
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  isActive(): boolean {
    return this.status === 'approved' && this.deletedAt === null;
  }

  isSuspended(): boolean {
    return this.status === 'suspended';
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  suspend(): void {
    this.status    = 'suspended';
    this.updatedAt = new Date().toISOString();
  }

  reactivate(): void {
    this.status    = 'approved';
    this.updatedAt = new Date().toISOString();
  }

  approve(): void {
    this.status    = 'approved';
    this.updatedAt = new Date().toISOString();
  }

  updateProfile(fields: {
    firstName?:         string;
    lastName?:          string;
    profilePhotoUrl?:   string | null;
    preferredLanguage?: string;
  }): void {
    if (fields.firstName         !== undefined) this.firstName         = fields.firstName;
    if (fields.lastName          !== undefined) this.lastName          = fields.lastName;
    if (fields.profilePhotoUrl   !== undefined) this.profilePhotoUrl   = fields.profilePhotoUrl;
    if (fields.preferredLanguage !== undefined) this.preferredLanguage = fields.preferredLanguage;
    this.updatedAt = new Date().toISOString();
  }

  registerFcmToken(token: string): void {
    if (!this.fcmTokens.includes(token)) {
      this.fcmTokens = [...this.fcmTokens, token];
      this.updatedAt = new Date().toISOString();
    }
  }

  linkProvider(providerId: string): void {
    if (!this.providers.includes(providerId)) {
      this.providers = [...this.providers, providerId];
      this.updatedAt = new Date().toISOString();
    }
  }

  unlinkProvider(providerId: string): void {
    if (this.providers.length <= 1) {
      throw createHttpError(409, 'INVALID_STATE', 'Cannot remove the only sign-in provider.');
    }
    this.providers = this.providers.filter(p => p !== providerId);
    this.updatedAt = new Date().toISOString();
  }

  deregisterFcmToken(token: string): void {
    const before = this.fcmTokens.length;
    this.fcmTokens = this.fcmTokens.filter(t => t !== token);
    if (this.fcmTokens.length !== before) {
      this.updatedAt = new Date().toISOString();
    }
  }

  updateNotificationPreferences(prefs: Partial<NotificationPreferences>): void {
    this.notificationPreferences = {
      email: prefs.email ?? this.notificationPreferences.email,
      push:  prefs.push  ?? this.notificationPreferences.push,
    };
    this.updatedAt = new Date().toISOString();
  }

  addRole(role: UserRole): void {
    if (!this.roles.includes(role)) {
      this.roles     = [...this.roles, role];
      this.updatedAt = new Date().toISOString();
    }
  }

  removeRole(role: UserRole): void {
    if (role === 'member') return; // member can never be removed
    this.roles     = this.roles.filter(r => r !== role);
    this.updatedAt = new Date().toISOString();
  }

  softDelete(): void {
    this.deletedAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}
