export type UserRole   = 'student' | 'admin' | 'super_admin';
export type UserStatus = 'pending_approval' | 'approved' | 'rejected' | 'suspended';

export interface UserProps {
  uid:             string;
  email:           string;
  firstName:       string;
  lastName:        string;
  role:            UserRole;
  status:          UserStatus;
  profilePhotoUrl: string | null;
  createdAt:       string;
  updatedAt:       string;
  deletedAt:       string | null;
}

export class User {
  readonly uid:             string;
  readonly email:           string;
  firstName:                string;
  lastName:                 string;
  readonly role:            UserRole;
  status:                   UserStatus;
  profilePhotoUrl:          string | null;
  readonly createdAt:       string;
  updatedAt:                string;
  deletedAt:                string | null;

  constructor(props: UserProps) {
    this.uid             = props.uid;
    this.email           = props.email;
    this.firstName       = props.firstName;
    this.lastName        = props.lastName;
    this.role            = props.role;
    this.status          = props.status;
    this.profilePhotoUrl = props.profilePhotoUrl;
    this.createdAt       = props.createdAt;
    this.updatedAt       = props.updatedAt;
    this.deletedAt       = props.deletedAt;
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
    firstName?:       string;
    lastName?:        string;
    profilePhotoUrl?: string | null;
  }): void {
    if (fields.firstName       !== undefined) this.firstName       = fields.firstName;
    if (fields.lastName        !== undefined) this.lastName        = fields.lastName;
    if (fields.profilePhotoUrl !== undefined) this.profilePhotoUrl = fields.profilePhotoUrl;
    this.updatedAt = new Date().toISOString();
  }

  softDelete(): void {
    this.deletedAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}
