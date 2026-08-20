import fs from 'node:fs';

const dbId = process.env.D1_DATABASE_ID || process.argv[2];
if (!dbId) {
  console.log('ℹ️ Usage: node scripts/create-local-config.mjs <D1_DATABASE_ID>');
  console.log('Or set environment variable D1_DATABASE_ID');
  process.exit(0);
}

const tpl = fs.readFileSync('wrangler.jsonc', 'utf8');
const localCfg = tpl
  .replace('"name": "movie-hell"', '"name": "moviehell-lab"')
  .replace('"database_name": "aggregation-hub-db"', '"database_name": "moviehell-lab-db"')
  .replace('00000000-0000-0000-0000-000000000000', dbId.trim());

fs.writeFileSync('wrangler.local.jsonc', localCfg, 'utf8');
console.log('✅ Generated wrangler.local.jsonc successfully.');
