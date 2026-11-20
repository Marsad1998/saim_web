import { NextResponse } from 'next/server';
import { testDbConnection, getDbConfig, resetDbPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await testDbConnection();
  const config = getDbConfig();

  return NextResponse.json({
    status: result.connected,
    connected: result.connected,
    message: result.message,
    latencyMs: result.latencyMs,
    error: result.error,
    hint: result.hint,
    databaseConfig: {
      source: config.source,
      host: config.host,
      port: config.port,
      user: config.user,
      database: config.database,
      isSsl: config.isSsl,
      hasPassword: config.hasPassword,
      rawUrlPresent: config.rawUrlPresent,
    },
    timestamp: new Date().toISOString(),
  }, {
    status: result.connected ? 200 : 503,
  });
}

export async function POST() {
  // Reset pool and re-test
  resetDbPool();
  const result = await testDbConnection();
  return NextResponse.json({
    status: result.connected,
    connected: result.connected,
    message: result.message,
    latencyMs: result.latencyMs,
    error: result.error,
    hint: result.hint,
  });
}
