/**
 * Capability-Based Authority Model for Movie Hell / Uniflora Rebuild.
 * 
 * Instead of rigid hierarchical roles (User -> Mod -> Admin -> Superadmin),
 * authority is decomposed into narrow, reviewable, grantable, and revocable capabilities.
 */

export type Capability =
  | 'may-host-screening'
  | 'may-publish-stream'
  | 'may-curate'
  | 'may-edit-schedule'
  | 'may-moderate-chat'
  | 'may-change-screen'
  | 'may-review-moderation'
  | 'may-read-audit-history';

export interface CapabilityGrant {
  id: string;
  issuer: string;
  grantee: string;
  capability: Capability;
  roomScope?: string; // If undefined, applies across the local lounge
  grantedAt: number;
  expiresAt?: number;
  revokedAt?: number;
  attestationNote?: string;
}

export interface CapabilityStore {
  grants: Map<string, CapabilityGrant>;
}

/**
 * Creates a fresh capability store.
 */
export function createCapabilityStore(): CapabilityStore {
  return {
    grants: new Map()
  };
}

/**
 * Issues a new capability grant.
 */
export function issueCapability(
  store: CapabilityStore,
  issuer: string,
  grantee: string,
  capability: Capability,
  options?: {
    roomScope?: string;
    durationMs?: number;
    attestationNote?: string;
  }
): CapabilityGrant {
  const grantedAt = Date.now();
  const expiresAt = options?.durationMs ? grantedAt + options.durationMs : undefined;
  const id = `cap_${grantee}_${capability}_${grantedAt}`;

  const grant: CapabilityGrant = {
    id,
    issuer,
    grantee,
    capability,
    roomScope: options?.roomScope,
    grantedAt,
    expiresAt,
    attestationNote: options?.attestationNote
  };

  store.grants.set(id, grant);
  return grant;
}

/**
 * Revokes an existing capability grant.
 */
export function revokeCapability(store: CapabilityStore, grantId: string): boolean {
  const grant = store.grants.get(grantId);
  if (grant && !grant.revokedAt) {
    grant.revokedAt = Date.now();
    return true;
  }
  return false;
}

/**
 * Checks whether an agent possesses a valid, non-expired, non-revoked capability.
 */
export function hasCapability(
  store: CapabilityStore,
  agent: string,
  capability: Capability,
  roomScope?: string
): boolean {
  const now = Date.now();

  for (const grant of store.grants.values()) {
    if (grant.grantee !== agent) continue;
    if (grant.capability !== capability) continue;
    if (grant.revokedAt) continue;
    if (grant.expiresAt && grant.expiresAt <= now) continue;

    // Check scope: if grant has roomScope, it must match or be unscoped
    if (grant.roomScope && roomScope && grant.roomScope !== roomScope) {
      continue;
    }

    return true;
  }

  return false;
}
