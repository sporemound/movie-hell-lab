/**
 * Blocklace DAG implementation for Movie Hell / Uniflora Rebuild.
 * Formal Reference: Ehud Shapiro, "Grassroots Systems", arXiv:2301.04391.
 * 
 * In this model, control plane events form a directed acyclic graph (DAG)
 * b = (h_p, H, x)
 * where:
 *   - author (h_p): Agent who created the block
 *   - parents (H): Set of hash-pointers to prior causal blocks
 *   - payload (x): Concrete action/state update (e.g. stream switch, capability grant)
 *   - hash: Cryptographic digest over (author, parents, payload, timestamp)
 */

export interface BlockPayload<T = unknown> {
  type: 'STREAM_CHANGE' | 'CAPABILITY_GRANT' | 'CAPABILITY_REVOKE' | 'ROOM_SETTINGS' | 'COMMUNITY_ATTESTATION';
  data: T;
  nonce?: string;
}

export interface Block<T = unknown> {
  hash: string;
  author: string;
  parents: string[];
  payload: BlockPayload<T>;
  timestamp: number;
  signature?: string;
}

export interface BlocklaceState {
  blocks: Map<string, Block>;
  heads: Set<string>;
  authorLastBlock: Map<string, string>;
}

/**
 * Computes deterministic SHA-256 hash of a block structure.
 */
export async function computeBlockHash(
  author: string,
  parents: string[],
  payload: BlockPayload,
  timestamp: number
): Promise<string> {
  const sortedParents = [...parents].sort();
  const raw = JSON.stringify({ author, parents: sortedParents, payload, timestamp });
  const msgBuffer = new TextEncoder().encode(raw);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Creates an empty blocklace.
 */
export function createBlocklace(): BlocklaceState {
  return {
    blocks: new Map(),
    heads: new Set(),
    authorLastBlock: new Map()
  };
}

/**
 * Inserts and validates a new block into the blocklace DAG.
 */
export async function addBlock(
  state: BlocklaceState,
  author: string,
  payload: BlockPayload,
  explicitParents?: string[]
): Promise<Block> {
  const timestamp = Date.now();
  
  // Parents default to current DAG heads if not explicitly provided
  let parents: string[] = [];
  if (explicitParents && explicitParents.length > 0) {
    parents = explicitParents.filter(p => state.blocks.has(p));
  } else if (state.heads.size > 0) {
    parents = Array.from(state.heads);
  }

  // Include author's own previous block if not already in parents
  const authorLast = state.authorLastBlock.get(author);
  if (authorLast && !parents.includes(authorLast) && state.blocks.has(authorLast)) {
    parents.push(authorLast);
  }

  parents.sort();

  const hash = await computeBlockHash(author, parents, payload, timestamp);

  const block: Block = {
    hash,
    author,
    parents,
    payload,
    timestamp
  };

  // Add block to DAG
  state.blocks.set(hash, block);
  state.authorLastBlock.set(author, hash);

  // Update heads: new block becomes a head; any parents it references are no longer heads
  for (const parent of parents) {
    state.heads.delete(parent);
  }
  state.heads.add(hash);

  return block;
}

/**
 * Verifies DAG acyclicity and structural integrity.
 */
export function verifyBlocklaceDAG(state: BlocklaceState): { isValid: boolean; cycleDetected: boolean } {
  const visited = new Set<string>();
  const inStack = new Set<string>();

  function dfs(hash: string): boolean {
    visited.add(hash);
    inStack.add(hash);

    const block = state.blocks.get(hash);
    if (block) {
      for (const parent of block.parents) {
        if (!visited.has(parent)) {
          if (dfs(parent)) return true;
        } else if (inStack.has(parent)) {
          return true; // Cycle detected
        }
      }
    }

    inStack.delete(hash);
    return false;
  }

  for (const hash of state.blocks.keys()) {
    if (!visited.has(hash)) {
      if (dfs(hash)) {
        return { isValid: false, cycleDetected: true };
      }
    }
  }

  return { isValid: true, cycleDetected: false };
}

/**
 * Projects the current agreed control-plane state (e.g. current stream, capabilities).
 */
export function projectState(state: BlocklaceState): {
  currentStreamUrl?: string;
  activeCapabilities: Map<string, Set<string>>;
  totalEvents: number;
} {
  let currentStreamUrl: string | undefined;
  const activeCapabilities = new Map<string, Set<string>>();

  // Order blocks topologically (or by timestamp for simple projection)
  const sortedBlocks = Array.from(state.blocks.values()).sort((a, b) => a.timestamp - b.timestamp);

  for (const block of sortedBlocks) {
    const { type, data } = block.payload;
    if (type === 'STREAM_CHANGE' && typeof data === 'object' && data !== null && 'streamUrl' in data) {
      currentStreamUrl = (data as { streamUrl: string }).streamUrl;
    } else if (type === 'CAPABILITY_GRANT' && typeof data === 'object' && data !== null) {
      const grant = data as { agent: string; capability: string };
      if (!activeCapabilities.has(grant.agent)) {
        activeCapabilities.set(grant.agent, new Set());
      }
      activeCapabilities.get(grant.agent)!.add(grant.capability);
    } else if (type === 'CAPABILITY_REVOKE' && typeof data === 'object' && data !== null) {
      const revoke = data as { agent: string; capability: string };
      if (activeCapabilities.has(revoke.agent)) {
        activeCapabilities.get(revoke.agent)!.delete(revoke.capability);
      }
    }
  }

  return {
    currentStreamUrl,
    activeCapabilities,
    totalEvents: state.blocks.size
  };
}
