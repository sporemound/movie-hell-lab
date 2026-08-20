import assert from 'node:assert/strict';
import { parseChannelAddress, formatDisplayName } from '../src/utils/channelParser.ts';

console.log('🧪 Testing Channel Address Parser & Auto-Fill Generator...\n');

// 1. Display Name Formatting Tests
console.log('1. Testing display name formatter:');
assert.equal(formatDisplayName('example_cinema_club'), 'Example Cinema Club');
assert.equal(formatDisplayName('indie-screening-room'), 'Indie Screening Room');
assert.equal(formatDisplayName('FilmClubVault'), 'Film Club Vault');
assert.equal(formatDisplayName('stream.example.org'), 'Stream Example');
assert.equal(formatDisplayName('arcade'), 'Arcade');
console.log('  ✅ Display name formatter passed.');

// 2. Kick Variations
console.log('2. Testing Kick address variations:');
const kickInputs = [
  'https://kick.com/example_gamer',
  'https://www.kick.com/example_gamer',
  'http://kick.com/example_gamer?ref=feed',
  'https://player.kick.com/example_gamer',
  'kick.com/example_gamer',
  'kick:example_gamer',
  '@example_gamer'
];

for (const input of kickInputs) {
  const res = parseChannelAddress(input, 'kick');
  assert.ok(res, `Failed for input: ${input}`);
  assert.equal(res.platform, 'kick');
  assert.equal(res.channel, 'example_gamer');
  assert.equal(res.sourceId, 'kick:example_gamer');
  assert.equal(res.name, 'Example Gamer');
  assert.equal(res.originDomain, 'kick.com');
  assert.equal(res.watchUrl, 'https://kick.com/example_gamer');
  assert.ok(res.embedUrl.includes('player.kick.com/example_gamer'));
  assert.equal(res.guild, 'guild_community');
  assert.equal(res.trustTier, 'trusted_member');
  assert.ok(res.boundaryTags.includes('kick'));
  assert.ok(res.attestationNotes.includes('kick.com/example_gamer'));
}

// Test Kick domain without slug
const kickDomainInputs = ['kick.com', 'https://kick.com', 'https://kick.com/', 'kick', 'www.kick.com'];
for (const input of kickDomainInputs) {
  const res = parseChannelAddress(input, 'picarto'); // Even with preferredPlatform=picarto
  assert.ok(res, `Failed for input: ${input}`);
  assert.equal(res.platform, 'kick');
  assert.equal(res.originDomain, 'kick.com');
  assert.equal(res.sourceId, 'kick:stream');
  assert.equal(res.watchUrl, 'https://kick.com');
}
console.log('  ✅ All Kick address variations passed.');

// 3. Picarto Variations (including bare domains with preferredPlatform='kick')
console.log('3. Testing Picarto address variations:');
const picartoInputs = [
  'https://picarto.tv/example_artist',
  'https://www.picarto.tv/example_artist',
  'https://picarto.tv/streampopout/example_artist/public',
  'https://edge1-us-losangeles.picarto.tv/stream/hls/example_artist.m3u8',
  'picarto.tv/example_artist',
  'picarto:example_artist'
];

for (const input of picartoInputs) {
  const res = parseChannelAddress(input, 'kick'); // Even if preferredPlatform is kick
  assert.ok(res, `Failed for input: ${input}`);
  assert.equal(res.platform, 'picarto');
  assert.equal(res.channel, 'example_artist');
  assert.equal(res.sourceId, 'picarto:example_artist');
  assert.equal(res.name, 'Example Artist');
  assert.equal(res.originDomain, 'picarto.tv');
  assert.equal(res.watchUrl, 'https://picarto.tv/example_artist');
  assert.equal(res.embedUrl, '/api/proxy/picarto?channel=example_artist');
  assert.ok(res.hlsUrl.includes('picarto.tv/stream/hls/example_artist.m3u8'));
  assert.ok(res.boundaryTags.includes('picarto'));
}

// Test Picarto domain without slug with preferredPlatform='kick'
const picartoDomainInputs = ['picarto.tv', 'https://picarto.tv', 'https://picarto.tv/', 'picarto', 'www.picarto.tv'];
for (const input of picartoDomainInputs) {
  const res = parseChannelAddress(input, 'kick');
  assert.ok(res, `Failed for input: ${input}`);
  assert.equal(res.platform, 'picarto', `Expected picarto for ${input}, got ${res.platform}`);
  assert.equal(res.originDomain, 'picarto.tv');
  assert.equal(res.sourceId, 'picarto:live');
  assert.equal(res.watchUrl, 'https://picarto.tv');
}
console.log('  ✅ All Picarto address variations and bare domain parsing passed.');

// 4. Owncast Variations
console.log('4. Testing Owncast address variations:');
const owncastInputs = [
  'https://stream.example.org',
  'https://stream.example.org/embed/video',
  'https://stream.example.org/hls/stream.m3u8',
  'http://stream.example.org:8080',
  'stream.example.org',
  'owncast:stream.example.org'
];

for (const input of owncastInputs) {
  const res = parseChannelAddress(input, 'kick'); // Even if preferredPlatform is kick
  assert.ok(res, `Failed for input: ${input}`);
  assert.equal(res.platform, 'owncast');
  assert.equal(res.channel, input.includes(':8080') ? 'stream.example.org:8080' : 'stream.example.org');
  assert.equal(res.sourceId, `owncast:${input.includes(':8080') ? 'stream.example.org:8080' : 'stream.example.org'}`);
  assert.equal(res.name, 'Stream Example');
  assert.equal(res.watchUrl, input.startsWith('http://') ? 'http://stream.example.org:8080' : 'https://stream.example.org');
  assert.equal(res.embedUrl, input.startsWith('http://') ? 'http://stream.example.org:8080/embed/video' : 'https://stream.example.org/embed/video');
  assert.equal(res.hlsUrl, input.startsWith('http://') ? 'http://stream.example.org:8080/hls/stream.m3u8' : 'https://stream.example.org/hls/stream.m3u8');
  assert.ok(res.boundaryTags.includes('owncast'));
}
console.log('  ✅ All Owncast address variations passed.');

// 5. VDO.Ninja Variations
console.log('5. Testing VDO.Ninja address variations:');
const vdoNinjaInputs = [
  'https://vdo.ninja/?room=moviehell_test',
  'vdo.ninja/?room=moviehell_test',
  'vdo-ninja:moviehell_test',
  'ninja:moviehell_test',
  'vdoninja:moviehell_test'
];

for (const input of vdoNinjaInputs) {
  const res = parseChannelAddress(input);
  assert.ok(res, `Failed for input: ${input}`);
  assert.equal(res.platform, 'vdo-ninja');
  assert.equal(res.channel, 'moviehell_test');
  assert.equal(res.sourceId, 'vdo-ninja:moviehell_test');
  assert.ok(res.embedUrl.includes('vdo.ninja/?room=moviehell_test'));
  assert.ok(res.boundaryTags.includes('webrtc'));
}
console.log('  ✅ All VDO.Ninja address variations passed.');

// 6. Edge cases & Empty
console.log('6. Testing invalid / empty inputs:');
assert.equal(parseChannelAddress(''), null);
assert.equal(parseChannelAddress('   '), null);
assert.equal(parseChannelAddress(null), null);
assert.equal(parseChannelAddress(undefined), null);
console.log('  ✅ Edge cases passed.');

console.log('\n🎉 ALL Channel Address Parser test suites passed successfully!\n');
