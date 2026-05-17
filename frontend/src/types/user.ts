export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';

export type UserStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';

export interface UserProfile {
  phone: string | null;
  location: string | null;
  linkedinUrl: string | null;
  avatarUrl: string | null;
  careerStage: string | null;
  targetRole: string | null;
  targetIndustry: string | null;
  preferences: Record<string, unknown> | null;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  emailVerifiedAt: string | null;
  profile?: UserProfile | null;
}
