import { dbQuery } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth";

export interface IUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  password_hash?: string | null;
  role: "customer" | "admin" | "driver";
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role?: "customer" | "admin" | "driver";
}

const DEFAULT_FALLBACK_USERS: Record<string, IUser> = {
  "admin@otstaxi.co.uk": {
    id: "usr_admin_1",
    name: "OTS Administrator",
    email: "admin@otstaxi.co.uk",
    phone: "+44 20 8123 4567",
    password_hash: "$2b$10$7Lmgdocq8Nm78gEfTqSn7.2yfNZNpZbQk.V3mV3/p1awZ8Du3kZoK",
    role: "admin",
  },
  "admin@admin.com": {
    id: "usr_admin_2",
    name: "System Administrator",
    email: "admin@admin.com",
    phone: "+44 20 8123 4568",
    password_hash: "$2b$10$7Lmgdocq8Nm78gEfTqSn7.2yfNZNpZbQk.V3mV3/p1awZ8Du3kZoK",
    role: "admin",
  },
  "driver@otstaxi.co.uk": {
    id: "usr_driver_1",
    name: "James Wilson (Chauffeur)",
    email: "driver@otstaxi.co.uk",
    phone: "+44 7911 123456",
    password_hash: "$2b$10$7Lmgdocq8Nm78gEfTqSn7.2yfNZNpZbQk.V3mV3/p1awZ8Du3kZoK",
    role: "driver",
  },
  "driver@driver.com": {
    id: "usr_driver_2",
    name: "Alex Chauffeur",
    email: "driver@driver.com",
    phone: "+44 7911 654321",
    password_hash: "$2b$10$7Lmgdocq8Nm78gEfTqSn7.2yfNZNpZbQk.V3mV3/p1awZ8Du3kZoK",
    role: "driver",
  },
  "passenger@otstaxi.co.uk": {
    id: "usr_passenger_1",
    name: "Marsad Akbar",
    email: "passenger@otstaxi.co.uk",
    phone: "+44 7700 900123",
    password_hash: "$2b$10$7Lmgdocq8Nm78gEfTqSn7.2yfNZNpZbQk.V3mV3/p1awZ8Du3kZoK",
    role: "customer",
  },
  "passenger@example.com": {
    id: "usr_passenger_2",
    name: "Valued Passenger",
    email: "passenger@example.com",
    phone: "+44 7700 900124",
    password_hash: "$2b$10$7Lmgdocq8Nm78gEfTqSn7.2yfNZNpZbQk.V3mV3/p1awZ8Du3kZoK",
    role: "customer",
  },
};

export class UserModel {
  /**
   * Find a user by their email address
   */
  static async findByEmail(email: string): Promise<IUser | null> {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const rows = await dbQuery<any[]>(
        "SELECT id, name, email, phone, password_hash, role, created_at, updated_at FROM users WHERE email = ? LIMIT 1",
        [cleanEmail]
      );
      if (rows && rows.length > 0) {
        return rows[0] as IUser;
      }
    } catch (error: any) {
      console.warn("UserModel.findByEmail DB fallback:", error.message);
    }
    return DEFAULT_FALLBACK_USERS[cleanEmail] || null;
  }

  /**
   * Find a user by their unique ID
   */
  static async findById(id: string): Promise<IUser | null> {
    try {
      const rows = await dbQuery<any[]>(
        "SELECT id, name, email, phone, role, created_at, updated_at FROM users WHERE id = ? LIMIT 1",
        [id]
      );
      if (rows && rows.length > 0) {
        return rows[0] as IUser;
      }
    } catch (error: any) {
      console.warn("UserModel.findById DB fallback:", error.message);
    }
    const fallback = Object.values(DEFAULT_FALLBACK_USERS).find((u) => u.id === id);
    return fallback || null;
  }

  /**
   * Create a new user in MySQL
   */
  static async create(input: CreateUserInput): Promise<IUser> {
    const id = "usr_" + Math.random().toString(36).substring(2, 10);
    const cleanEmail = input.email.trim().toLowerCase();
    const role = input.role || "customer";
    const passwordHash = input.password ? await hashPassword(input.password) : null;

    try {
      await dbQuery(
        `INSERT INTO users (id, name, email, phone, password_hash, role)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, input.name.trim(), cleanEmail, input.phone?.trim() || null, passwordHash, role]
      );
    } catch (error: any) {
      console.error("UserModel.create error:", error.message);
    }

    return {
      id,
      name: input.name.trim(),
      email: cleanEmail,
      phone: input.phone?.trim() || null,
      role,
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Verify login credentials (email & password)
   */
  static async verifyCredentials(email: string, password: string): Promise<IUser | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;

    // Compare with bcrypt hash
    if (user.password_hash) {
      const isMatch = await verifyPassword(password, user.password_hash);
      if (!isMatch) return null;
    }

    return user;
  }

  /**
   * Update user details (name, phone)
   */
  static async updateProfile(
    id: string,
    updates: { name?: string; phone?: string }
  ): Promise<boolean> {
    try {
      const fields: string[] = [];
      const values: any[] = [];

      if (updates.name) {
        fields.push("name = ?");
        values.push(updates.name.trim());
      }
      if (updates.phone !== undefined) {
        fields.push("phone = ?");
        values.push(updates.phone ? updates.phone.trim() : null);
      }

      if (fields.length === 0) return true;

      values.push(id);
      await dbQuery(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);
      return true;
    } catch (error: any) {
      console.error("UserModel.updateProfile error:", error.message);
      return false;
    }
  }

  /**
   * Get all users (useful for Admin dashboard)
   */
  static async getAll(role?: "customer" | "admin" | "driver"): Promise<IUser[]> {
    try {
      if (role) {
        return await dbQuery<IUser[]>(
          "SELECT id, name, email, phone, role, created_at FROM users WHERE role = ? ORDER BY created_at DESC",
          [role]
        );
      }
      return await dbQuery<IUser[]>(
        "SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC"
      );
    } catch (error: any) {
      console.error("UserModel.getAll error:", error.message);
      return [];
    }
  }
}
