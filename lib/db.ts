import mysql, { Pool, PoolOptions } from 'mysql2/promise';

const globalForDb = globalThis as unknown as {
  __mysqlPool?: Pool;
};

export interface SanitizedDbConfig {
  source: string;
  host: string;
  port: number;
  user: string;
  database: string;
  isSsl: boolean;
  hasPassword: boolean;
  rawUrlPresent: boolean;
}

/**
 * Resolve and sanitize current database connection configuration
 */
export function getDbConfig(): SanitizedDbConfig & { poolConfig: PoolOptions } {
  const databaseUrl =
    process.env.DATABASE_URL ||
    process.env.MYSQL_URL ||
    process.env.CLEARDB_DATABASE_URL ||
    process.env.JAWSDB_URL;

  let poolConfig: PoolOptions;
  let host = '127.0.0.1';
  let port = 3306;
  let user = 'root';
  let database = 'otstaxi_db';
  let hasPassword = false;
  let isSsl = false;
  let source = 'Default Localhost (No DB env vars set)';

  if (databaseUrl && (databaseUrl.startsWith('mysql://') || databaseUrl.startsWith('mysql2://'))) {
    source = process.env.DATABASE_URL
      ? 'DATABASE_URL'
      : process.env.MYSQL_URL
      ? 'MYSQL_URL'
      : 'Cloud Database URL';

    try {
      const parsedUrl = new URL(databaseUrl.replace(/^mysql2:/, 'mysql:'));
      host = parsedUrl.hostname || 'localhost';
      port = parsedUrl.port ? parseInt(parsedUrl.port, 10) : 3306;
      user = decodeURIComponent(parsedUrl.username || 'root');
      const password = decodeURIComponent(parsedUrl.password || '');
      hasPassword = Boolean(password);
      database = parsedUrl.pathname.replace(/^\//, '') || 'otstaxi_db';

      // SSL detection: check explicit env var, query param, or remote host
      const isRemoteHost = host !== 'localhost' && host !== '127.0.0.1';
      const sslParam = parsedUrl.searchParams.get('ssl') || parsedUrl.searchParams.get('sslmode');
      isSsl =
        process.env.MYSQL_SSL === 'true' ||
        process.env.MYSQL_SSL === '1' ||
        Boolean(sslParam && sslParam !== 'false' && sslParam !== 'disabled') ||
        (isRemoteHost && process.env.MYSQL_SSL !== 'false');

      poolConfig = {
        host,
        port,
        user,
        password,
        database,
        waitForConnections: true,
        connectionLimit: 5,
        maxIdle: 2,
        idleTimeout: 30000,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        connectTimeout: 15000,
        ...(isSsl ? { ssl: { rejectUnauthorized: false } } : {}),
      };
    } catch {
      // Fallback if URL cannot be parsed by URL constructor
      poolConfig = {
        uri: databaseUrl,
        waitForConnections: true,
        connectionLimit: 5,
        connectTimeout: 15000,
      };
    }
  } else {
    // Individual environment variables (supporting standard and Railway/cPanel names)
    host =
      process.env.MYSQL_HOST ||
      process.env.MYSQLHOST ||
      process.env.DB_HOST ||
      '127.0.0.1';

    port = parseInt(
      String(
        process.env.MYSQL_PORT ||
        process.env.MYSQLPORT ||
        process.env.DB_PORT ||
        3306
      ),
      10
    );

    user =
      process.env.MYSQL_USER ||
      process.env.MYSQLUSER ||
      process.env.DB_USER ||
      'root';

    const password =
      process.env.MYSQL_PASSWORD ??
      process.env.MYSQLPASSWORD ??
      process.env.DB_PASSWORD ??
      '';
    hasPassword = Boolean(password);

    database =
      process.env.MYSQL_DATABASE ||
      process.env.MYSQLDATABASE ||
      process.env.DB_NAME ||
      'otstaxi_db';

    const isRemoteHost = host !== 'localhost' && host !== '127.0.0.1' && !host.startsWith('192.168.');
    isSsl =
      process.env.MYSQL_SSL === 'true' ||
      process.env.MYSQL_SSL === '1' ||
      (isRemoteHost && process.env.MYSQL_SSL !== 'false');

    if (process.env.MYSQL_HOST || process.env.MYSQLHOST) {
      source = process.env.MYSQLHOST ? 'Railway MYSQLHOST variables' : 'Standard MYSQL_HOST variables';
    }

    poolConfig = {
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 5,
      maxIdle: 2,
      idleTimeout: 30000,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      connectTimeout: 15000,
      ...(isSsl ? { ssl: { rejectUnauthorized: false } } : {}),
    };
  }

  return {
    source,
    host,
    port,
    user,
    database,
    isSsl,
    hasPassword,
    rawUrlPresent: Boolean(databaseUrl),
    poolConfig,
  };
}

export function getDbPool(): Pool {
  if (globalForDb.__mysqlPool) {
    return globalForDb.__mysqlPool;
  }

  const { poolConfig } = getDbConfig();
  globalForDb.__mysqlPool = mysql.createPool(poolConfig);
  return globalForDb.__mysqlPool;
}

export function resetDbPool(): void {
  if (globalForDb.__mysqlPool) {
    globalForDb.__mysqlPool.end().catch(() => {});
    globalForDb.__mysqlPool = undefined;
  }
}

/**
 * Execute a SQL query (safely routes to execute if parameters are provided, or query if no parameters)
 */
export async function dbQuery<T = any>(sql: string, params: any[] = []): Promise<T> {
  const p = getDbPool();
  if (!params || params.length === 0) {
    const [results] = await p.query(sql);
    return results as T;
  }
  const [results] = await p.execute(sql, params);
  return results as T;
}

/**
 * Test MySQL connection with latency measurement and error diagnosis
 */
export async function testDbConnection(): Promise<{
  connected: boolean;
  message: string;
  latencyMs?: number;
  config: SanitizedDbConfig;
  error?: string;
  hint?: string;
}> {
  const config = getDbConfig();
  const startTime = Date.now();

  try {
    const p = getDbPool();
    await p.query('SELECT 1 + 1 AS result');
    const latencyMs = Date.now() - startTime;
    return {
      connected: true,
      message: `MySQL connected successfully (${latencyMs}ms)`,
      latencyMs,
      config,
    };
  } catch (error: any) {
    const rawError = error?.message || 'Unknown database error';
    let hint = 'Please check database credentials and host accessibility.';

    if (rawError.includes('ECONNREFUSED')) {
      hint = `Connection refused at ${config.host}:${config.port}. Ensure MySQL is running on the target server and the port is open/whitelisted.`;
    } else if (rawError.includes('ER_ACCESS_DENIED_ERROR') || rawError.includes('Access denied')) {
      hint = `Authentication failed for user '${config.user}'. Check your MYSQL_USER and MYSQL_PASSWORD environment variables.`;
    } else if (rawError.includes('ER_BAD_DB_ERROR') || rawError.includes('Unknown database')) {
      hint = `Database '${config.database}' does not exist on MySQL server. Please create it or verify the database name in environment variables.`;
    } else if (rawError.includes('ENOTFOUND') || rawError.includes('EAI_AGAIN')) {
      hint = `Host '${config.host}' could not be resolved via DNS. Check host spelling or network configuration.`;
    } else if (rawError.includes('ETIMEDOUT') || rawError.includes('Connect timeout')) {
      hint = `Connection timed out reaching ${config.host}:${config.port}. Check firewall rules, VPN, or IP whitelist on your cloud database.`;
    } else if (rawError.includes('handshake') || rawError.includes('SSL') || rawError.includes('CERT')) {
      hint = `SSL Handshake issue with ${config.host}. Set MYSQL_SSL=true or check SSL certificates.`;
    } else if (rawError.includes('Too many connections')) {
      hint = `MySQL has reached its maximum connection limit. Restart MySQL service or increase max_connections in MySQL configuration.`;
    }

    return {
      connected: false,
      message: `MySQL connection failed: ${rawError}`,
      error: rawError,
      hint,
      config,
    };
  }
}
