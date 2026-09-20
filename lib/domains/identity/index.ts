/**
 * NXTQR — 01 Identity Bounded Context
 * Responsibilities: Users, authentication identities, sessions, provider identity mapping, account lifecycle.
 * Invariant: Never identify a Google user from browser email alone. Map verified provider subject ID -> NXTQR User ID.
 * MFA-Ready: Provides the MFA contract boundary without prematurely implementing factors in Phase 3.
 */

import { DomainError, UnauthorizedError, ValidationError } from "../shared/errors";
import { createDomainEvent, DomainEvent } from "../shared/events";

export interface UserEntity {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  timezone: string;
  createdAt: number;
  updatedAt: number;
}

export type AuthProviderType = "google" | "saml" | "oidc";

export interface AuthAccountEntity {
  id: string;
  userId: string;
  provider: AuthProviderType;
  providerAccountId: string; // e.g. Google sub claim
  createdAt: number;
}

export interface MfaSecurityProfile {
  isMfaRequired: boolean;
  enabledMethods: Array<"totp" | "webauthn" | "sms">;
  enrolledAt?: number;
}

export interface UserIdentitySession {
  userId: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  authProvider: AuthProviderType;
  providerSubject: string;
  mfaProfile?: MfaSecurityProfile;
  authenticatedAt: number;
}

// Domain Events
export interface UserRegisteredPayload {
  userId: string;
  email: string;
  provider: AuthProviderType;
}

export interface UserLoggedInPayload {
  userId: string;
  provider: AuthProviderType;
}

/**
 * Identity Service Interface
 */
export interface IdentityService {
  resolveOrCreateFromGoogle(profile: {
    sub: string;
    email: string;
    name: string;
    avatarUrl?: string;
  }): Promise<{
    user: UserEntity;
    isNewUser: boolean;
    event?: DomainEvent<UserRegisteredPayload | UserLoggedInPayload>;
  }>;

  verifySession(userId: string): Promise<UserIdentitySession>;
}
