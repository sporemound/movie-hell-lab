import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const IGNORED_DIRS = new Set([
  'node_modules',
  'dist',
  '.git',
  '.wrangler',
  '.vite',
  'coverage',
  'backups'
]);

const IGNORED_FILES = new Set([
  'package-lock.json',
  'privacy-scan.mjs'
]);

// One-way SHA-256 hashes of prohibited identifiers and secrets (zero plaintext in codebase)
const FORBIDDEN_HASHES = new Set([
  'a351bbd7a34f874359f127477669c0683989e9e23a7c9536231daa4bd8f53c29',
  '54a176fd624f2ede74fbc8f3f93be7a21878e870e0b86bc06db1fd9f8e164a0d',
  'e898b87e0bbbfda02c47fa5dfba9804579fd382c49923cd131ae72b18610a012',
  '4fef7d8e4bc0c335a0d041cdd10b3ba43f84caccc4e1c623df04db4e649ecd3c',
  '017751f62311b7ed6915e22ac8d64f8c02e6a0dac658668d5b0acda3e908ea2c',
  'b8f3638e49132e97be0e93fcf2e6f149d88dd436f59f7106a351486d9f4f9271',
  'b1db2e950f83395f6964567e9829c73c1904b67ca399e3348100b49305766acc',
  'a6d55be9ba45e1b9698fb86745e8ab12216570cbf56c4ee58457c09ca8de7d68',
  '60acffd83861ec2668bbb3a7dc214531fee5323f43a2c8bd2007caaff97e1a9c',
  'a4b97ee4769967507d8712bc0552868f3ae5451ae84f5398d24bed1d893decc5',
  'c762c9bbc81827e10a1ce4d589d8c55fb5704966182e041371293555fb964190',
  '2b5fbb07eae04e2d47465f7c53d5fe0d3a8ce899000a4e46b01c0ee898eb72ef',
  '4135aa9dc1b842a653dea846903ddb95bfb8c5a10c504a7fa16e10bc31d1fdf0',
  '52622017161b66973e2645ab6e077e525abbf36ac0da198d9ff3dfb5735dec87',
  'e73a465c9b75a089627b25ce856d94875d049fa43c41ed46d5f56de8e2f34f04'
]);

function hashToken(str) {
  return crypto.createHash('sha256').update(str.toLowerCase().trim()).digest('hex');
}

// Structural Violation patterns
const VIOLATIONS = [
  {
    name: 'Hardcoded Real Email Address',
    regex: /\b[a-zA-Z0-9._%+-]+@(?!example\.(?:com|org|net)\b)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,
  },
  {
    name: 'Live Cloudflare D1 UUID in Config',
    fileFilter: (rel) => rel === 'wrangler.jsonc' || rel === 'pages/wrangler.jsonc',
    regex: /"database_id":\s*"(?!(?:00000000-0000-0000-0000-000000000000|\$|\s*"))[0-9a-fA-F-]{36}"/g,
  }
];

let totalViolations = 0;

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        scanDir(path.join(dir, entry.name));
      }
    } else if (entry.isFile()) {
      if (!IGNORED_FILES.has(entry.name)) {
        scanFile(path.join(dir, entry.name));
      }
    }
  }
}

function scanFile(filePath) {
  const relPath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
  if (/\.(png|jpg|jpeg|gif|webp|ico|wasm|pdf|zip)$/i.test(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  lines.forEach((line, idx) => {
    // 1. Check structural rules (Emails & Live DB UUIDs)
    for (const rule of VIOLATIONS) {
      if (rule.fileFilter && !rule.fileFilter(relPath)) continue;
      rule.regex.lastIndex = 0;
      let match;
      while ((match = rule.regex.exec(line)) !== null) {
        console.error(`[PRIVACY ERROR] ${rule.name}: detected in ${relPath}:${idx + 1}`);
        totalViolations++;
      }
    }

    // 2. Check hashed token matches (Zero plaintext exposure)
    const tokens = line.match(/[a-zA-Z0-9_.-]{3,}/g) || [];
    for (const token of tokens) {
      const h = hashToken(token);
      if (FORBIDDEN_HASHES.has(h)) {
        console.error(`[PRIVACY ERROR] Prohibited Identifier / Secret detected in ${relPath}:${idx + 1}`);
        totalViolations++;
      }
    }
  });
}

console.log('🔒 Running automated Privacy & PII Boundary scan...');
scanDir(process.cwd());

if (totalViolations > 0) {
  console.error(`\n❌ Privacy scan FAILED: ${totalViolations} violation(s) detected.`);
  console.error('All personal user info, third-party accounts, and live resource IDs must follow 12-Factor config and RFC 2606 placeholders.\n');
  process.exit(1);
} else {
  console.log('✅ Privacy scan PASSED: 0 privacy violations detected. 12-Factor standard satisfied.');
}
