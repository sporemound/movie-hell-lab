import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const migrationsDir = path.resolve('migrations');
const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

console.log(`🚀 Applying ${files.length} migrations to remote D1 (moviehell-lab-db)...`);

for (const file of files) {
  const filePath = path.join('migrations', file);
  console.log(`\n⏳ Checking / Applying ${file}...`);
  try {
    const out = execSync(
      `npx wrangler d1 execute moviehell-lab-db --remote --file="${filePath}" --config wrangler.local.jsonc`,
      { encoding: 'utf8', stdio: 'pipe' }
    );
    console.log(`✅ ${file} applied.`);
  } catch (err) {
    const errText = (err.stdout || '') + (err.stderr || '') + err.message;
    if (errText.includes('already exists') || errText.includes('duplicate column')) {
      console.log(`ℹ️ ${file} already applied or partially applied (skipping).`);
    } else {
      console.error(`❌ Error in ${file}:`, errText);
    }
  }
}

console.log('\n🎉 Remote D1 migration sequence finished!');
