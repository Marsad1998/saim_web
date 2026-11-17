import { dbQuery } from "@/lib/db";

export interface IDriver {
  id: string;
  user_id: string;
  license_number: string;
  vehicle_model: string;
  vehicle_plate: string;
  vehicle_category: string;
  is_active: boolean;
  created_at?: string;
  // Joined fields when queried with user details
  driver_name?: string;
  driver_email?: string;
  driver_phone?: string;
}

export interface CreateDriverInput {
  userId: string;
  licenseNumber: string;
  vehicleModel: string;
  vehiclePlate: string;
  vehicleCategory?: string;
  isActive?: boolean;
}

export interface UpdateDriverInput {
  licenseNumber?: string;
  vehicleModel?: string;
  vehiclePlate?: string;
  vehicleCategory?: string;
  isActive?: boolean;
}

export class DriverModel {
  /**
   * Register a new driver in MySQL
   */
  static async create(input: CreateDriverInput): Promise<IDriver> {
    const id = "drv_" + Math.random().toString(36).substring(2, 10);
    const category = input.vehicleCategory || "saloon";
    const isActive = input.isActive !== undefined ? input.isActive : true;

    try {
      await dbQuery(
        `INSERT INTO drivers (
          id, user_id, license_number, vehicle_model, vehicle_plate, vehicle_category, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          input.userId,
          input.licenseNumber.trim().toUpperCase(),
          input.vehicleModel.trim(),
          input.vehiclePlate.trim().toUpperCase(),
          category,
          isActive ? 1 : 0,
        ]
      );
    } catch (error: any) {
      console.error("DriverModel.create error:", error.message);
    }

    return {
      id,
      user_id: input.userId,
      license_number: input.licenseNumber.trim().toUpperCase(),
      vehicle_model: input.vehicleModel.trim(),
      vehicle_plate: input.vehiclePlate.trim().toUpperCase(),
      vehicle_category: category,
      is_active: isActive,
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Find driver by ID
   */
  static async findById(id: string): Promise<IDriver | null> {
    try {
      const rows = await dbQuery<any[]>(
        `SELECT d.*, u.name as driver_name, u.email as driver_email, u.phone as driver_phone
         FROM drivers d
         LEFT JOIN users u ON d.user_id = u.id
         WHERE d.id = ? LIMIT 1`,
        [id]
      );

      if (rows && rows.length > 0) {
        const row = rows[0];
        return {
          id: row.id,
          user_id: row.user_id,
          license_number: row.license_number,
          vehicle_model: row.vehicle_model,
          vehicle_plate: row.vehicle_plate,
          vehicle_category: row.vehicle_category,
          is_active: Boolean(row.is_active),
          created_at: row.created_at ? new Date(row.created_at).toISOString() : undefined,
          driver_name: row.driver_name,
          driver_email: row.driver_email,
          driver_phone: row.driver_phone,
        };
      }
      return null;
    } catch (error: any) {
      console.error("DriverModel.findById error:", error.message);
      return null;
    }
  }

  /**
   * Find driver record by User Account ID
   */
  static async findByUserId(userId: string): Promise<IDriver | null> {
    try {
      const rows = await dbQuery<any[]>(
        "SELECT * FROM drivers WHERE user_id = ? LIMIT 1",
        [userId]
      );
      if (rows && rows.length > 0) {
        const row = rows[0];
        return {
          id: row.id,
          user_id: row.user_id,
          license_number: row.license_number,
          vehicle_model: row.vehicle_model,
          vehicle_plate: row.vehicle_plate,
          vehicle_category: row.vehicle_category,
          is_active: Boolean(row.is_active),
          created_at: row.created_at ? new Date(row.created_at).toISOString() : undefined,
        };
      }
      return null;
    } catch (error: any) {
      console.error("DriverModel.findByUserId error:", error.message);
      return null;
    }
  }

  /**
   * Toggle driver active on/off duty
   */
  static async toggleActive(id: string, isActive: boolean): Promise<boolean> {
    return this.update(id, { isActive });
  }

  /**
   * Update driver vehicle or license info
   */
  static async update(id: string, updates: UpdateDriverInput): Promise<boolean> {
    try {
      const fields: string[] = [];
      const values: any[] = [];

      if (updates.licenseNumber) {
        fields.push("license_number = ?");
        values.push(updates.licenseNumber.trim().toUpperCase());
      }
      if (updates.vehicleModel) {
        fields.push("vehicle_model = ?");
        values.push(updates.vehicleModel.trim());
      }
      if (updates.vehiclePlate) {
        fields.push("vehicle_plate = ?");
        values.push(updates.vehiclePlate.trim().toUpperCase());
      }
      if (updates.vehicleCategory) {
        fields.push("vehicle_category = ?");
        values.push(updates.vehicleCategory);
      }
      if (updates.isActive !== undefined) {
        fields.push("is_active = ?");
        values.push(updates.isActive ? 1 : 0);
      }

      if (fields.length === 0) return true;

      values.push(id);
      await dbQuery(`UPDATE drivers SET ${fields.join(", ")} WHERE id = ?`, values);
      return true;
    } catch (error: any) {
      console.error("DriverModel.update error:", error.message);
      return false;
    }
  }

  /**
   * Toggle driver online/offline availability status
   */
  static async toggleActiveStatus(id: string, isActive: boolean): Promise<boolean> {
    try {
      await dbQuery("UPDATE drivers SET is_active = ? WHERE id = ?", [isActive ? 1 : 0, id]);
      return true;
    } catch (error: any) {
      console.error("DriverModel.toggleActiveStatus error:", error.message);
      return false;
    }
  }

  /**
   * Get all active drivers (optionally filtered by vehicle category e.g. saloon, mpv, minibus)
   */
  static async getAllActive(category?: string): Promise<IDriver[]> {
    try {
      if (category) {
        const rows = await dbQuery<any[]>(
          `SELECT d.*, u.name as driver_name, u.phone as driver_phone
           FROM drivers d
           JOIN users u ON d.user_id = u.id
           WHERE d.is_active = 1 AND d.vehicle_category = ?`,
          [category]
        );
        return rows.map((r) => ({
          id: r.id,
          user_id: r.user_id,
          license_number: r.license_number,
          vehicle_model: r.vehicle_model,
          vehicle_plate: r.vehicle_plate,
          vehicle_category: r.vehicle_category,
          is_active: true,
          driver_name: r.driver_name,
          driver_phone: r.driver_phone,
        }));
      }

      const rows = await dbQuery<any[]>(
        `SELECT d.*, u.name as driver_name, u.phone as driver_phone
         FROM drivers d
         JOIN users u ON d.user_id = u.id
         WHERE d.is_active = 1`
      );
      return rows.map((r) => ({
        id: r.id,
        user_id: r.user_id,
        license_number: r.license_number,
        vehicle_model: r.vehicle_model,
        vehicle_plate: r.vehicle_plate,
        vehicle_category: r.vehicle_category,
        is_active: true,
        driver_name: r.driver_name,
        driver_phone: r.driver_phone,
      }));
    } catch (error: any) {
      console.error("DriverModel.getAllActive error:", error.message);
      return [];
    }
  }

  /**
   * Get all drivers with their full profile details (for Admin management)
   */
  static async getAll(): Promise<IDriver[]> {
    try {
      const rows = await dbQuery<any[]>(
        `SELECT d.*, u.name as driver_name, u.email as driver_email, u.phone as driver_phone
         FROM drivers d
         JOIN users u ON d.user_id = u.id
         ORDER BY d.created_at DESC`
      );
      return rows.map((r) => ({
        id: r.id,
        user_id: r.user_id,
        license_number: r.license_number,
        vehicle_model: r.vehicle_model,
        vehicle_plate: r.vehicle_plate,
        vehicle_category: r.vehicle_category,
        is_active: Boolean(r.is_active),
        created_at: r.created_at ? new Date(r.created_at).toISOString() : undefined,
        driver_name: r.driver_name,
        driver_email: r.driver_email,
        driver_phone: r.driver_phone,
      }));
    } catch (error: any) {
      console.error("DriverModel.getAll error:", error.message);
      return [];
    }
  }
}
