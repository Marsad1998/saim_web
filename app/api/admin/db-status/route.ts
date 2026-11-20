import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import { testDbConnection, getDbConfig, resetDbPool, dbQuery } from '@/lib/db';
import { initDatabaseSchema } from '@/lib/db-init';

export const dynamic = 'force-dynamic';

function checkAdminAuth(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyJwtToken(token);
  if (!payload || payload.role !== 'admin') return null;
  return payload;
}

export async function GET(request: NextRequest) {
  const admin = checkAdminAuth(request);
  if (!admin) {
    return NextResponse.json({ status: false, message: 'Forbidden: Admin access required' }, { status: 403 });
  }

  const result = await testDbConnection();
  const config = getDbConfig();

  let tablesInfo: Array<{ name: string; rows: number }> = [];

  if (result.connected) {
    try {
      const tablesRows = await dbQuery<any[]>('SHOW TABLES');
      const tableNames = (tablesRows || []).map((r) => Object.values(r)[0] as string);

      for (const t of tableNames) {
        try {
          const countRows = await dbQuery<any[]>(`SELECT COUNT(*) as count FROM \`${t}\``);
          tablesInfo.push({
            name: t,
            rows: countRows[0]?.count ?? 0,
          });
        } catch {
          tablesInfo.push({ name: t, rows: -1 });
        }
      }
    } catch (e: any) {
      console.warn('Could not inspect tables:', e.message);
    }
  }

  // Detect which environment variable names are set on this host
  const detectedEnvVars = {
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    MYSQL_URL: Boolean(process.env.MYSQL_URL),
    CLEARDB_DATABASE_URL: Boolean(process.env.CLEARDB_DATABASE_URL),
    MYSQL_HOST: Boolean(process.env.MYSQL_HOST),
    MYSQLHOST: Boolean(process.env.MYSQLHOST),
    MYSQL_PORT: Boolean(process.env.MYSQL_PORT),
    MYSQLPORT: Boolean(process.env.MYSQLPORT),
    MYSQL_USER: Boolean(process.env.MYSQL_USER),
    MYSQLUSER: Boolean(process.env.MYSQLUSER),
    MYSQL_PASSWORD: Boolean(process.env.MYSQL_PASSWORD),
    MYSQLPASSWORD: Boolean(process.env.MYSQLPASSWORD),
    MYSQL_DATABASE: Boolean(process.env.MYSQL_DATABASE),
    MYSQLDATABASE: Boolean(process.env.MYSQLDATABASE),
    MYSQL_SSL: process.env.MYSQL_SSL || null,
  };

  return NextResponse.json({
    status: true,
    connected: result.connected,
    message: result.message,
    latencyMs: result.latencyMs,
    error: result.error,
    hint: result.hint,
    config: {
      source: config.source,
      host: config.host,
      port: config.port,
      user: config.user,
      database: config.database,
      isSsl: config.isSsl,
      hasPassword: config.hasPassword,
      rawUrlPresent: config.rawUrlPresent,
    },
    tables: tablesInfo,
    detectedEnvVars,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  const admin = checkAdminAuth(request);
  if (!admin) {
    return NextResponse.json({ status: false, message: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || 'test';

    if (action === 'init_schema') {
      const initResult = await initDatabaseSchema();
      return NextResponse.json({
        status: initResult.success,
        ...initResult,
      });
    }

    // Default action: reset connection pool & test
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
  } catch (err: any) {
    return NextResponse.json({
      status: false,
      message: err.message || 'Action failed',
    }, { status: 500 });
  }
}
