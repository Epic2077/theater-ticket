/**
 * db:init — connect this project to a Supabase backend and apply the schema.
 *
 * Behavior:
 *   - Remote (default when SUPABASE_ACCESS_TOKEN is set): authenticates the CLI
 *     with the token and pushes `supabase/migrations/*` straight to the hosted
 *     project via `supabase db push --project-ref`. The project ref is derived
 *     automatically from VITE_SUPABASE_URL (https://<ref>.supabase.co).
 *   - Local (SUPABASE_LOCAL=true, or no token/URL): starts the local stack
 *     (Docker) and applies migrations to the local database.
 *
 * Usage: npm run db:init
 */
import { spawnSync } from 'node:child_process';
import { loadEnvFile } from 'node:process';

try {
  loadEnvFile('.env');
} catch {
  /* no .env file — that's fine, process env still applies */
}

/** Extract the project ref from VITE_SUPABASE_URL (https://<ref>.supabase.co). */
function deriveProjectRef(supabaseUrl) {
  const url = (supabaseUrl || '').trim();
  if (!url) return '';
  try {
    const match = new URL(url).hostname.match(/^([^.]+)\.supabase\.co$/);
    return match ? match[1] : '';
  } catch {
    return '';
  }
}

function run(args, label) {
  console.log(`\n$ supabase ${args.join(' ')}`);
  const result = spawnSync('supabase', args, { stdio: 'inherit', shell: true });
  if (result.status !== 0) {
    console.error(`\n✗ '${label}' failed (exit ${result.status}).`);
    process.exit(result.status ?? 1);
  }
}

const local = process.env.SUPABASE_LOCAL === 'true';
const accessToken = (process.env.SUPABASE_ACCESS_TOKEN || '').trim();
const projectRef = deriveProjectRef(process.env.VITE_SUPABASE_URL);

if (local || !accessToken || !projectRef) {
  if (!local) {
    console.log(
      'ℹ SUPABASE_ACCESS_TOKEN / VITE_SUPABASE_URL not set — assuming LOCAL development.\n' +
        '  To push to a hosted project: copy .env.example to .env, set\n' +
        '  SUPABASE_ACCESS_TOKEN and VITE_SUPABASE_URL, then run `npm run db:init`.',
    );
  }
  run(['start'], 'supabase start');
  run(['db', 'push', '--local'], 'supabase db push --local');
} else {
  run(['db', 'push', '--project-ref', projectRef], 'supabase db push');
}

console.log('\n✓ Database schema is up to date.');
console.log(
  '  Next: make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env, then `npm run dev`.',
);
