"""
movie_hell_math.py
==================

Executable reference mathematics for the Movie Hell / Uniflora rebuild.

Primary formal inspiration:
Ehud Shapiro, "Grassroots Systems: Concept, Examples, Implementation and Applications"
arXiv:2301.04391

This module deliberately separates:

1. GRASSROOTS CONTROL-PLANE MATHEMATICS
   - finite agent communities P subset Pi
   - local state
   - projection
   - non-interference
   - strict interactivity
   - friendship/follows dissemination
   - blocklace DAG structure

2. REAL-TIME MEDIA ENGINEERING EXTENSIONS
   - relay-tree fanout/depth
   - bandwidth estimates
   - redundancy estimates

The paper's liveness claims are asynchronous/eventual. They do NOT prove
bounded-latency livestream QoS.

Run:
    python movie_hell_math.py
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, Set, Tuple, List, FrozenSet, Optional, Iterable
import hashlib
import hmac
import json
import math
import secrets


Agent = str
Edge = FrozenSet[Agent]


# ---------------------------------------------------------------------------
# 1. COMMUNITY / LOCAL-STATE MODEL
# ---------------------------------------------------------------------------

@dataclass
class LocalState:
    """
    Local state S(p) for one agent p.

    blocks:
        Persistent monotonic control-plane knowledge.

    follows:
        Creators whose state/content this agent follows.

    capabilities:
        Narrow authority grants, e.g. "host", "publish", "moderate_chat".

    room:
        Optional local room membership.

    ephemeral:
        Non-monotonic transient state. This is intentionally not included in
        control-plane monotonicity checks.
    """
    blocks: Set[str] = field(default_factory=set)
    follows: Set[Agent] = field(default_factory=set)
    capabilities: Set[str] = field(default_factory=set)
    room: Optional[str] = None
    ephemeral: Dict[str, object] = field(default_factory=dict)

    def projected(self) -> "LocalState":
        """Return the persistent portion used for grassroots/control analysis."""
        return LocalState(
            blocks=set(self.blocks),
            follows=set(self.follows),
            capabilities=set(self.capabilities),
            room=self.room,
            ephemeral={}
        )


@dataclass
class Community:
    """
    Finite community P with local states and explicit mutual-friend edges.

    friendships are represented as undirected 2-agent frozensets.
    """
    agents: Set[Agent]
    state: Dict[Agent, LocalState]
    friendships: Set[Edge] = field(default_factory=set)

    def __post_init__(self):
        missing = self.agents - set(self.state)
        for a in missing:
            self.state[a] = LocalState()

    def add_friendship(self, a: Agent, b: Agent):
        if a == b:
            raise ValueError("friendship requires two distinct agents")
        if a not in self.agents or b not in self.agents:
            raise ValueError("both agents must belong to the community")
        self.friendships.add(frozenset((a, b)))

    def are_friends(self, a: Agent, b: Agent) -> bool:
        return frozenset((a, b)) in self.friendships

    def project(self, subset: Set[Agent]) -> "Community":
        """
        Projection C(P') / P:
        forget outside agents and all edges touching them.
        """
        if not subset <= self.agents:
            raise ValueError("projection subset must be contained in community")
        return Community(
            agents=set(subset),
            state={a: self.state[a].projected() for a in subset},
            friendships={
                e for e in self.friendships
                if set(e) <= subset
            },
        )


# ---------------------------------------------------------------------------
# 2. ACTION SEMANTICS AND GRASSROOTS TESTS
# ---------------------------------------------------------------------------

def enabled_actions(c: Community) -> Set[Tuple]:
    """
    A deliberately small transition vocabulary.

    Local actions:
      ("create", p)
      ("grant-local", p, capability)

    Dissemination action:
      ("send", holder, receiver, creator, block_id)

    A send is enabled when:
      - holder and receiver are friends,
      - receiver follows creator,
      - holder knows a creator block,
      - receiver does not yet know it.

    This captures the key Grassroots Dissemination intuition:
    a needed block can be acquired from a friend that has it.
    """
    actions: Set[Tuple] = set()

    for p in c.agents:
        actions.add(("create", p))

    # Treat block IDs as "creator:blockname".
    for edge in c.friendships:
        a, b = tuple(edge)
        for holder, receiver in ((a, b), (b, a)):
            hs = c.state[holder]
            rs = c.state[receiver]
            for block_id in hs.blocks:
                creator = block_id.split(":", 1)[0]
                if creator in rs.follows and block_id not in rs.blocks:
                    actions.add(("send", holder, receiver, creator, block_id))
    return actions


def non_interference_holds(
    small: Community,
    large: Community,
    subset: Set[Agent],
) -> bool:
    """
    Checks the practical non-interference side of:
        TS(P) subseteq TS(P') / P

    Every action enabled in the small community must still be enabled when
    the larger community is projected back onto P.
    """
    projected = large.project(subset)
    return enabled_actions(small) <= enabled_actions(projected)


def strict_interactivity_exists(
    small: Community,
    large: Community,
    subset: Set[Agent],
) -> bool:
    """
    Checks that the larger community permits at least one additional
    interaction involving an outside agent while preserving all old actions.

    This is an executable finite-state sanity check for the *strict* part of:
        TS(P) subset TS(P') / P

    It is not a proof of the entire protocol family.
    """
    if not non_interference_holds(small, large, subset):
        return False

    base = enabled_actions(small)
    all_large = enabled_actions(large)

    outside = large.agents - subset
    for action in all_large:
        involved = {x for x in action[1:] if isinstance(x, str)}
        if involved & outside and action not in base:
            return True
    return False


# ---------------------------------------------------------------------------
# 3. BLOCKLACE
# ---------------------------------------------------------------------------

def canonical_json(obj: object) -> str:
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


@dataclass(frozen=True)
class Block:
    creator: Agent
    seq: int
    pointers: Tuple[str, ...]
    payload: Dict[str, object]
    signature: str
    hash: str


class Blocklace:
    """
    Minimal authenticated DAG.

    The paper's abstract block form is:
        b = (h_p, H, x)

    We represent:
        creator / signature  -> h_p
        pointers             -> H
        payload              -> x

    HMAC is used here only to make the reference model executable with the
    Python standard library. Production should use asymmetric signatures
    (e.g. Ed25519) so verification does not require sharing a secret.
    """

    def __init__(self):
        self.blocks: Dict[str, Block] = {}
        self.heads: Set[str] = set()
        self.seq_by_creator: Dict[Agent, int] = {}
        self.keys: Dict[Agent, bytes] = {}

    def register(self, creator: Agent, key: Optional[bytes] = None):
        self.keys[creator] = key or secrets.token_bytes(32)

    def _unsigned(self, creator: Agent, seq: int, pointers: Iterable[str], payload: Dict[str, object]):
        return {
            "creator": creator,
            "seq": seq,
            "pointers": sorted(pointers),
            "payload": payload,
        }

    def _sign(self, creator: Agent, unsigned: Dict[str, object]) -> str:
        key = self.keys[creator]
        return hmac.new(
            key,
            canonical_json(unsigned).encode("utf-8"),
            hashlib.sha256
        ).hexdigest()

    def _hash(self, body: Dict[str, object]) -> str:
        return hashlib.sha256(canonical_json(body).encode("utf-8")).hexdigest()

    def create(self, creator: Agent, payload: Dict[str, object]) -> Block:
        if creator not in self.keys:
            raise KeyError(f"creator {creator!r} is not registered")

        seq = self.seq_by_creator.get(creator, 0) + 1
        unsigned = self._unsigned(creator, seq, self.heads, payload)
        signature = self._sign(creator, unsigned)
        body = {**unsigned, "signature": signature}
        block_hash = self._hash(body)

        block = Block(
            creator=creator,
            seq=seq,
            pointers=tuple(unsigned["pointers"]),
            payload=dict(payload),
            signature=signature,
            hash=block_hash,
        )
        self.accept(block)
        self.seq_by_creator[creator] = seq
        return block

    def verify(self, block: Block) -> bool:
        if block.creator not in self.keys:
            return False

        unsigned = self._unsigned(
            block.creator,
            block.seq,
            block.pointers,
            block.payload
        )
        expected_sig = self._sign(block.creator, unsigned)
        if not hmac.compare_digest(expected_sig, block.signature):
            return False

        expected_hash = self._hash({
            **unsigned,
            "signature": block.signature
        })
        return hmac.compare_digest(expected_hash, block.hash)

    def accept(self, block: Block):
        if not self.verify(block):
            raise ValueError("invalid block signature or hash")

        if block.hash in self.blocks:
            return

        self.blocks[block.hash] = block

        # New block references prior heads: those cease to be maximal.
        for ptr in block.pointers:
            self.heads.discard(ptr)
        self.heads.add(block.hash)

    def ancestors_missing(self, block: Block) -> Set[str]:
        """Unknown hash pointers that cordial dissemination should seek."""
        return {h for h in block.pointers if h not in self.blocks}

    def is_acyclic(self) -> bool:
        """DFS DAG validation."""
        WHITE, GRAY, BLACK = 0, 1, 2
        color = {h: WHITE for h in self.blocks}

        def visit(h: str) -> bool:
            color[h] = GRAY
            b = self.blocks[h]
            for ptr in b.pointers:
                if ptr not in self.blocks:
                    continue
                if color[ptr] == GRAY:
                    return False
                if color[ptr] == WHITE and not visit(ptr):
                    return False
            color[h] = BLACK
            return True

        return all(color[h] != WHITE or visit(h) for h in list(self.blocks))


# ---------------------------------------------------------------------------
# 4. CORDIAL DISSEMINATION
# ---------------------------------------------------------------------------

def cordial_send_candidates(
    c: Community,
    holder: Agent,
    receiver: Agent,
) -> Set[str]:
    """
    Blocks holder may cordially send receiver.

    Simplified production-independent rule:
      - holder/receiver are friends;
      - receiver follows block creator;
      - holder has the block;
      - receiver does not.
    """
    if not c.are_friends(holder, receiver):
        return set()

    hs, rs = c.state[holder], c.state[receiver]
    out = set()

    for block_id in hs.blocks:
        creator = block_id.split(":", 1)[0]
        if creator in rs.follows and block_id not in rs.blocks:
            out.add(block_id)

    return out


def disseminate_to_fixpoint(c: Community) -> int:
    """
    Repeatedly apply cordial sends until no more knowledge changes occur.

    Returns the number of block transfers performed.

    This simulates eventual asynchronous dissemination under ideal correctness.
    """
    transfers = 0
    changed = True

    while changed:
        changed = False
        for edge in list(c.friendships):
            a, b = tuple(edge)
            for holder, receiver in ((a, b), (b, a)):
                for block_id in sorted(cordial_send_candidates(c, holder, receiver)):
                    c.state[receiver].blocks.add(block_id)
                    transfers += 1
                    changed = True

    return transfers


# ---------------------------------------------------------------------------
# 5. MEDIA RELAY TREE MATHEMATICS
# ---------------------------------------------------------------------------

def relay_capacity(fanout: int, depth: int) -> int:
    """
    Maximum nodes in a complete fanout-ary tree through depth d,
    including the root publisher.

        N_max = sum_{i=0}^{d} f^i

    For f=1:
        N_max = d + 1
    """
    if fanout < 1:
        return 1
    if depth < 0:
        raise ValueError("depth must be >= 0")
    if fanout == 1:
        return depth + 1
    return (fanout ** (depth + 1) - 1) // (fanout - 1)


def minimum_relay_depth(total_nodes: int, fanout: int) -> int:
    """
    Smallest d for which relay_capacity(f, d) >= total_nodes.

    total_nodes includes the publisher/root.
    """
    if total_nodes <= 1:
        return 0
    if fanout < 1:
        raise ValueError("fanout must be >= 1")
    d = 0
    while relay_capacity(fanout, d) < total_nodes:
        d += 1
    return d


def relay_uplink_mbps(bitrate_mbps: float, children: int, overhead: float = 0.08) -> float:
    """
    Approximate uplink:
        U ~= f R (1 + overhead)

    Default 8% overhead is illustrative.
    """
    if bitrate_mbps < 0 or children < 0:
        raise ValueError("bitrate and children must be non-negative")
    return bitrate_mbps * children * (1.0 + overhead)


def idealized_redundant_miss_probability(single_path_miss: float, parents: int) -> float:
    """
    Idealized independent-path reliability extension:

        P(all r parents miss) ~= p_m^r

    Engineering approximation only.
    """
    if not (0 <= single_path_miss <= 1):
        raise ValueError("single_path_miss must be in [0,1]")
    if parents < 1:
        raise ValueError("parents must be >= 1")
    return single_path_miss ** parents


# ---------------------------------------------------------------------------
# 6. DEVELOPMENT PRIORITY / SURVEY MATH
# ---------------------------------------------------------------------------

def architecture_priority(
    user_value: float,
    viability: float,
    trust: float,
    accessibility: float,
    effort: float,
    maintenance: float,
    risk: float,
) -> float:
    """
    Example transparent scoring function for prototype prioritization.

    IMPORTANT:
    This is NOT a governance vote and should never override accessibility,
    safety, or human review.

    Positive dimensions are [0,1].
    Negative dimensions are [0,1].

    P =
        0.25 user_value
      + 0.20 viability
      + 0.15 trust
      + 0.15 accessibility
      - 0.10 effort
      - 0.10 maintenance
      - 0.05 risk

    Weights are intentionally explicit and replaceable.
    """
    values = [user_value, viability, trust, accessibility, effort, maintenance, risk]
    if not all(0 <= x <= 1 for x in values):
        raise ValueError("all score inputs must be in [0,1]")

    return (
        0.25 * user_value
        + 0.20 * viability
        + 0.15 * trust
        + 0.15 * accessibility
        - 0.10 * effort
        - 0.10 * maintenance
        - 0.05 * risk
    )


# ---------------------------------------------------------------------------
# 7. DEMONSTRATION / SELF-TEST
# ---------------------------------------------------------------------------

def demo_grassroots_property():
    # Small autonomous community P
    P = {"alice", "bob"}
    small = Community(
        agents=set(P),
        state={
            "alice": LocalState(blocks={"alice:room-open"}, follows={"alice"}),
            "bob": LocalState(blocks=set(), follows={"alice"}),
        }
    )
    small.add_friendship("alice", "bob")

    # Larger P' adds Carol but preserves P's old relationships/state.
    large = Community(
        agents={"alice", "bob", "carol"},
        state={
            "alice": LocalState(blocks={"alice:room-open"}, follows={"alice"}),
            "bob": LocalState(blocks=set(), follows={"alice"}),
            "carol": LocalState(blocks=set(), follows={"alice"}),
        }
    )
    large.add_friendship("alice", "bob")

    assert non_interference_holds(small, large, P)

    # Voluntary bridge Bob <-> Carol creates new behavior.
    large.add_friendship("bob", "carol")
    assert strict_interactivity_exists(small, large, P)

    transfers = disseminate_to_fixpoint(large)
    assert "alice:room-open" in large.state["carol"].blocks

    return {
        "non_interference": True,
        "strict_interactivity": True,
        "block_transfers": transfers,
    }


def demo_blocklace():
    bl = Blocklace()
    bl.register("alice")
    bl.register("bob")

    b1 = bl.create("alice", {"type": "room-open", "room": "midnight"})
    b2 = bl.create("alice", {"type": "stream-start", "epoch": 1})
    b3 = bl.create("bob", {"type": "capability", "grant": "moderate_chat"})

    assert bl.verify(b1)
    assert bl.verify(b2)
    assert bl.verify(b3)
    assert bl.is_acyclic()

    return {
        "blocks": len(bl.blocks),
        "heads": len(bl.heads),
        "acyclic": bl.is_acyclic(),
    }


def demo_media_math():
    viewers = 200
    # +1 for the publisher root.
    total = viewers + 1
    rows = []
    for fanout in (2, 3, 4):
        depth = minimum_relay_depth(total, fanout)
        rows.append({
            "fanout": fanout,
            "viewer_count": viewers,
            "tree_depth": depth,
            "capacity_at_depth": relay_capacity(fanout, depth),
            "relay_uplink_at_3Mbps": round(relay_uplink_mbps(3.0, fanout), 2),
        })
    return rows


def main():
    print("=== Movie Hell / Uniflora mathematics reference ===\n")

    g = demo_grassroots_property()
    print("Grassroots finite-model sanity check:")
    print(json.dumps(g, indent=2))

    b = demo_blocklace()
    print("\nBlocklace:")
    print(json.dumps(b, indent=2))

    print("\nRelay-tree estimates for 200 viewers:")
    print(json.dumps(demo_media_math(), indent=2))

    print("\nRedundancy illustration:")
    for r in (1,2,3):
        print(
            f"  path miss p=0.10, parents={r}: "
            f"{idealized_redundant_miss_probability(0.10, r):.5f}"
        )

    print("\nExample architecture-priority score:")
    score = architecture_priority(
        user_value=0.90,
        viability=0.85,
        trust=0.95,
        accessibility=0.90,
        effort=0.45,
        maintenance=0.40,
        risk=0.25,
    )
    print(f"  score={score:.4f}")

    print("\nAll self-tests passed.")


if __name__ == "__main__":
    main()
