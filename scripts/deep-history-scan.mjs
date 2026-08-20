import { execSync } from 'node:child_process';

const log = execSync('git log -p', { maxBuffer: 50 * 1024 * 1024 }).toString('utf8');

// 1. Email check: ignore example.(com|org|net) and github noreply
const emailRegex = /\b[a-zA-Z0-9._%+-]+@(?!example\.(?:com|org|net)\b)(?!users\.noreply\.github\.com\b)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g;
const emails = log.match(emailRegex) || [];

// 2. Live database UUID check: non-zero UUIDs in database_id
const uuidRegex = /"database_id":\s*"(?!00000000-0000-0000-0000-000000000000)[0-9a-fA-F-]{36}"/g;
const uuids = log.match(uuidRegex) || [];

// 3. Check for any commit authors/committers
const authorLog = execSync('git log --format="%an <%ae>"', { encoding: 'utf8' });
const authors = Array.from(new Set(authorLog.trim().split('\n')));

console.log('--- GIT HISTORY AUDIT RESULTS ---');
console.log(`1. Real User Emails in Git History: ${emails.length === 0 ? '0 (CLEAN)' : JSON.stringify(emails)}`);
console.log(`2. Live Cloudflare D1 UUIDs in Git History: ${uuids.length === 0 ? '0 (CLEAN)' : JSON.stringify(uuids)}`);
console.log(`3. Commit Authors in Git History:`, authors);
