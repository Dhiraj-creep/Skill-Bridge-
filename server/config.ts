import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root directory
export const PROJECT_ROOT = path.resolve(__dirname, '..');

/**
 * Load .env file natively in Node.js 20.6+ if present.
 * Node's process.loadEnvFile() preserves pre-existing process.env variables,
 * guaranteeing external environment variables take precedence.
 */
export function loadEnvironment(customEnvPath?: string): void {
  const envPath = customEnvPath || path.join(PROJECT_ROOT, '.env');
  if (fs.existsSync(envPath)) {
    if (typeof (process as any).loadEnvFile === 'function') {
      try {
        (process as any).loadEnvFile(envPath);
      } catch (err) {
        // Ignore errors if file is unreadable or malformed in non-fatal ways
        console.warn(`[Config] Notice: Could not load env file at ${envPath}:`, err);
      }
    }
  }
}

// Auto-load .env immediately on config module evaluation
loadEnvironment();

// Validate and resolve database path
export function resolveDatabasePath(overridePath?: string): string {
  const rawPath = overridePath || process.env.DB_PATH;
  let resolved: string;
  if (rawPath && rawPath.trim().length > 0) {
    resolved = path.resolve(rawPath.trim());
  } else {
    resolved = path.join(__dirname, 'database', 'cep_portal.sqlite');
  }

  // Ensure parent directory exists
  const parentDir = path.dirname(resolved);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  return resolved;
}

export const DB_PATH = resolveDatabasePath();
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const isProduction = NODE_ENV === 'production';
export const isTest = NODE_ENV === 'test';
export const PORT = parseInt(process.env.PORT || '3001', 10);
export const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true' || isProduction;
export const TRUST_PROXY = process.env.TRUST_PROXY === 'true' || isProduction;
export const SEED_DEMO_ACCOUNTS = process.env.SEED_DEMO_ACCOUNTS === 'true';

// Default allowed origins for CORS
const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:3000',
];
const envOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
export const ALLOWED_ORIGINS = new Set([...defaultOrigins, ...envOrigins]);
