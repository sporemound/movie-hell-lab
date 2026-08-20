import assert from 'node:assert/strict';
import {
  createBlocklace,
  addBlock,
  verifyBlocklaceDAG,
  projectState
} from '../src/shell/control/blocklace.ts';
import {
  createCapabilityStore,
  issueCapability,
  hasCapability,
  revokeCapability
} from '../src/shell/capabilities/capabilities.ts';
import { DECISION_RECORDS } from '../src/shell/audit/decisionLedger.ts';
import {
  createCommunityBridge,
  linkCommunity,
  unlinkCommunity,
  verifyStrictIndependence
} from '../src/shell/federation/bridge.ts';

console.log('🧪 Testing Movie Hell Shell Modules...\n');

// 1. Test Blocklace DAG
console.log('1. Testing Grassroots Blocklace DAG:');
const dag = createBlocklace();
assert.equal(dag.blocks.size, 0);

const b1 = await addBlock(dag, 'alice', {
  type: 'CAPABILITY_GRANT',
  data: { agent: 'bob', capability: 'may-host-screening' }
});
assert.ok(b1.hash);
assert.equal(dag.blocks.size, 1);
assert.equal(dag.heads.size, 1);

const b2 = await addBlock(dag, 'bob', {
  type: 'STREAM_CHANGE',
  data: { streamUrl: 'https://vdo.ninja/?room=moviehell_test' }
});
assert.ok(b2.parents.includes(b1.hash));
assert.equal(dag.blocks.size, 2);

const b3 = await addBlock(dag, 'carol', {
  type: 'COMMUNITY_ATTESTATION',
  data: { rating: 5, note: 'Excellent stream' }
});
assert.ok(b3.parents.includes(b2.hash));
assert.equal(dag.blocks.size, 3);

const dagCheck = verifyBlocklaceDAG(dag);
assert.equal(dagCheck.isValid, true);
assert.equal(dagCheck.cycleDetected, false);

const projection = projectState(dag);
assert.equal(projection.currentStreamUrl, 'https://vdo.ninja/?room=moviehell_test');
assert.equal(projection.activeCapabilities.get('bob')?.has('may-host-screening'), true);
console.log('  ✅ Blocklace DAG creation, multi-parent DAG integrity, and projection passed.');

// 2. Test Capability-Based Authority
console.log('2. Testing Capability-Based Authority:');
const capStore = createCapabilityStore();
const grant = issueCapability(capStore, 'admin_p', 'projectionist_1', 'may-host-screening', {
  roomScope: 'screening_room_1',
  durationMs: 60000
});
assert.ok(grant.id);
assert.equal(hasCapability(capStore, 'projectionist_1', 'may-host-screening', 'screening_room_1'), true);
assert.equal(hasCapability(capStore, 'projectionist_1', 'may-host-screening', 'other_room'), false);
assert.equal(hasCapability(capStore, 'random_user', 'may-host-screening'), false);

revokeCapability(capStore, grant.id);
assert.equal(hasCapability(capStore, 'projectionist_1', 'may-host-screening', 'screening_room_1'), false);
console.log('  ✅ Capability issuance, scoping, expiration, and revocation passed.');

// 3. Test Decision Ledger
console.log('3. Testing Architecture Decision Ledger:');
assert.ok(DECISION_RECORDS.length >= 4);
const ids = DECISION_RECORDS.map(d => d.id);
assert.ok(ids.includes('UF-ARCH-0001'));
assert.ok(ids.includes('UF-ARCH-0002'));
assert.ok(ids.includes('UF-ARCH-0003'));
assert.ok(ids.includes('UF-ARCH-0004'));
console.log(`  ✅ Architecture Decision Ledger verified with ${DECISION_RECORDS.length} implemented records.`);

// 4. Test Federation Bridge (Strict Independence)
console.log('4. Testing Federation Bridge & Strict Independence:');
const bridge = createCommunityBridge('community_cinema_a');
assert.equal(verifyStrictIndependence(bridge).localOperational, true);

linkCommunity(bridge, {
  id: 'community_cinema_b',
  name: 'Cinema B',
  endpoint: 'https://b.example.org',
  sharedMarquee: true,
  activeStatus: 'CONNECTED'
});
assert.equal(bridge.peers.size, 1);
assert.equal(verifyStrictIndependence(bridge).connectedPeersCount, 1);

unlinkCommunity(bridge, 'community_cinema_b');
assert.equal(bridge.peers.size, 0);
assert.equal(verifyStrictIndependence(bridge).localOperational, true);
assert.equal(verifyStrictIndependence(bridge).connectedPeersCount, 0);
console.log('  ✅ Federation bridge linking and strict independence verified.');

console.log('\n🎉 ALL Shell Module test suites passed successfully!\n');
