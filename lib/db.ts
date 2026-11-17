import mysql, { Pool, PoolOptions } from 'mysql2/promise';

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (pool) {
    return pool;
  }

  const databaseUrl = process.env.DATABASE_URL;

  let poolConfig: PoolOptions;

  if (databaseUrl && databaseUrl.startsWith('mysql://')) {
    // Parse DATABASE_URL: mysql://user:password@host:port/database
    try {
      const url = new URL(databaseUrl);
      poolConfig = {
        host: url.hostname || 'localhost',
        port: url.port ? parseInt(url.port, 10) : 3306,
        user: decodeURIComponent(url.username || 'root'),
        password: decodeURIComponent(url.password || ''),
        database: url.pathname.replace(/^\//, '') || 'otstaxi_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
      };
    } catch {
      poolConfig = {
        uri: databaseUrl,
        waitForConnections: true,
        connectionLimit: 10,
      };
    }
  } else {
    // Individual environment variables
    poolConfig = {
      host: process.env.MYSQL_HOST || '127.0.0.1',
      port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'otstaxi_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    };
  }

  pool = mysql.createPool(poolConfig);
  return pool;
}

/**
 * Execute a parameterized SQL query
 */
export async function dbQuery<T = any>(sql: string, params: any[] = []): Promise<T> {
  const p = getDbPool();
  const [results] = await p.execute(sql, params);
  return results as T;
}

/**
 * Test MySQL connection
 */
export async function testDbConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    const p = getDbPool();
    const [rows] = await p.query('SELECT 1 + 1 AS result');
    return { connected: true, message: 'MySQL connection successful' };
  } catch (error: any) {
    return { connected: false, message: error.message || 'MySQL connection failed' };
  }
}
