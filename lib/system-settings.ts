import { dbQuery } from './db';

export interface SystemSettings {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_pass: string;
  smtp_from: string;
  admin_email: string;
  require_email_verification: boolean;
  require_driver_approval: boolean;
}

const DEFAULT_SETTINGS: SystemSettings = {
  smtp_host: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtp_port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
  smtp_user: process.env.SMTP_USER || '',
  smtp_pass: process.env.SMTP_PASS || '',
  smtp_from: process.env.SMTP_FROM || '"OTS Taxi UK" <no-reply@otstaxi.co.uk>',
  admin_email: process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@otstaxi.co.uk',
  require_email_verification: false,
  require_driver_approval: true,
};

let inMemorySettings: SystemSettings = { ...DEFAULT_SETTINGS };

/**
 * Retrieve system settings from database with in-memory caching fallback
 */
export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    const rows = await dbQuery<any[]>(
      'SELECT key_name, key_value FROM system_settings'
    );

    if (Array.isArray(rows) && rows.length > 0) {
      const dbSettings: Partial<SystemSettings> = {};
      rows.forEach((row) => {
        const key = row.key_name;
        const val = row.key_value;

        if (key === 'smtp_port') {
          dbSettings.smtp_port = parseInt(val, 10) || DEFAULT_SETTINGS.smtp_port;
        } else if (key === 'require_email_verification') {
          dbSettings.require_email_verification = val === 'true' || val === '1';
        } else if (key === 'require_driver_approval') {
          dbSettings.require_driver_approval = val === 'true' || val === '1';
        } else if (key in DEFAULT_SETTINGS) {
          (dbSettings as any)[key] = val;
        }
      });

      inMemorySettings = {
        ...DEFAULT_SETTINGS,
        ...inMemorySettings,
        ...dbSettings,
      };
    }
  } catch (error) {
    // If table doesn't exist yet or DB connection offline, in-memory cache is used
  }

  return inMemorySettings;
}

/**
 * Update system settings in database and in-memory cache
 */
export async function updateSystemSettings(
  updates: Partial<SystemSettings>
): Promise<SystemSettings> {
  inMemorySettings = {
    ...inMemorySettings,
    ...updates,
  };

  try {
    for (const [key, value] of Object.entries(updates)) {
      const strVal = typeof value === 'boolean' ? (value ? 'true' : 'false') : String(value ?? '');
      await dbQuery(
        `INSERT INTO system_settings (key_name, key_value) 
         VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE key_value = VALUES(key_value)`,
        [key, strVal]
      );
    }
  } catch (err) {
    console.warn('[Settings] Failed to persist to MySQL system_settings table, kept in-memory:', (err as any)?.message);
  }

  return inMemorySettings;
}
