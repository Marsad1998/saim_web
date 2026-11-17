import { dbQuery } from "@/lib/db";

export interface IVehicle {
  id: string;
  name: string;
  categoryName: string;
  image: string;
  passengers: number;
  suitcases: number;
  handLuggage: number;
  description: string;
  features: string[];
  multiplier: number;
  sampleVehicles: string;
  isActive?: boolean;
  sortOrder?: number;
}

export const DEFAULT_VEHICLE_FLEET: IVehicle[] = [
  {
    id: "saloon",
    name: "Standard Saloon",
    categoryName: "Saloon Car",
    image: "https://cdn.otstaxi.com/assets/img/icon/hdiw/2-1.png",
    passengers: 4,
    suitcases: 2,
    handLuggage: 2,
    description: "Ideal for everyday airport transfers, solo travelers, and couples.",
    features: ["Air Conditioning", "Flight Tracking", "45 Mins Free Waiting", "Fixed Price"],
    multiplier: 1.0,
    sampleVehicles: "VW Passat, Ford Mondeo, Skoda Octavia",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "estate",
    name: "Estate Car",
    categoryName: "Estate Vehicle",
    image: "https://cdn.otstaxi.com/assets/img/icon/hdiw/2-1.png",
    passengers: 4,
    suitcases: 4,
    handLuggage: 3,
    description: "Extended boot capacity for travelers with bulky luggage, skis or strollers.",
    features: ["Extra Luggage Capacity", "Air Conditioning", "Flight Tracking", "Fixed Price"],
    multiplier: 1.15,
    sampleVehicles: "Skoda Superb Estate, VW Passat Estate",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "executive-saloon",
    name: "Executive Saloon",
    categoryName: "Executive Chauffeur",
    image: "https://cdn.otstaxi.com/assets/img/icon/hdiw/2-1.png",
    passengers: 3,
    suitcases: 2,
    handLuggage: 2,
    description: "Premium luxury comfort for corporate executives and discerning travelers.",
    features: ["Luxury Leather Interior", "Bottled Water & Wi-Fi", "Meet & Greet Included", "Professional Chauffeur"],
    multiplier: 1.45,
    sampleVehicles: "Mercedes-Benz E-Class, BMW 5 Series, Audi A6",
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "mpv",
    name: "People Carrier / MPV",
    categoryName: "People Carrier (MPV-5/6)",
    image: "https://cdn.otstaxi.com/assets/img/icon/hdiw/2-1.png",
    passengers: 5,
    suitcases: 4,
    handLuggage: 4,
    description: "Designed for small groups and families requiring extra seating room.",
    features: ["Spacious Seating", "Air Conditioning", "Child Seats Available", "Fixed Price"],
    multiplier: 1.4,
    sampleVehicles: "VW Touran, Ford Galaxy, Citroen Spacetourer",
    isActive: true,
    sortOrder: 4,
  },
  {
    id: "minibus-8",
    name: "8-Seater Minibus",
    categoryName: "Minibus (8 Seater)",
    image: "https://cdn.otstaxi.com/assets/img/icon/hdiw/2-1.png",
    passengers: 8,
    suitcases: 8,
    handLuggage: 8,
    description: "Large capacity transport for larger families, corporate groups, and sports tours.",
    features: ["Up to 8 Passengers", "Massive Cargo Space", "Dual Air Conditioning", "Fixed Price"],
    multiplier: 1.85,
    sampleVehicles: "Mercedes Vito Tourer, Ford Tourneo Custom",
    isActive: true,
    sortOrder: 5,
  },
  {
    id: "executive-mpv",
    name: "Executive MPV",
    categoryName: "Luxury Chauffeur MPV",
    image: "https://cdn.otstaxi.com/assets/img/icon/hdiw/2-1.png",
    passengers: 7,
    suitcases: 7,
    handLuggage: 7,
    description: "The pinnacle of VIP group travel with first-class conference seating.",
    features: ["VIP Leather Seating", "Privacy Glass", "Meet & Greet Included", "Complimentary Refreshments"],
    multiplier: 2.2,
    sampleVehicles: "Mercedes-Benz V-Class",
    isActive: true,
    sortOrder: 6,
  },
];

export class VehicleModel {
  /**
   * Helper to format a database row to IVehicle object
   */
  private static formatRow(row: any): IVehicle {
    let features: string[] = [];
    try {
      features = typeof row.features === "string" ? JSON.parse(row.features) : row.features || [];
    } catch {
      features = [];
    }

    return {
      id: row.id,
      name: row.name,
      categoryName: row.category_name,
      image: row.image,
      passengers: Number(row.passengers),
      suitcases: Number(row.suitcases),
      handLuggage: Number(row.hand_luggage),
      description: row.description,
      features,
      multiplier: Number(row.multiplier),
      sampleVehicles: row.sample_vehicles,
      isActive: Boolean(row.is_active),
      sortOrder: Number(row.sort_order),
    };
  }

  /**
   * Seed default vehicles into MySQL if table is empty
   */
  static async seedDefaults(): Promise<void> {
    try {
      // Ensure table exists
      await dbQuery(`
        CREATE TABLE IF NOT EXISTS \`vehicles\` (
          \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
          \`name\` VARCHAR(100) NOT NULL,
          \`category_name\` VARCHAR(100) NOT NULL,
          \`image\` VARCHAR(255) NOT NULL,
          \`passengers\` INT NOT NULL DEFAULT 4,
          \`suitcases\` INT NOT NULL DEFAULT 2,
          \`hand_luggage\` INT NOT NULL DEFAULT 2,
          \`description\` TEXT NOT NULL,
          \`features\` TEXT NOT NULL,
          \`multiplier\` DECIMAL(5, 2) NOT NULL DEFAULT 1.00,
          \`sample_vehicles\` VARCHAR(255) NOT NULL,
          \`is_active\` BOOLEAN NOT NULL DEFAULT TRUE,
          \`sort_order\` INT NOT NULL DEFAULT 0,
          \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      const rows = await dbQuery<any[]>("SELECT COUNT(*) as count FROM vehicles");
      if (rows && rows[0]?.count === 0) {
        for (const v of DEFAULT_VEHICLE_FLEET) {
          await dbQuery(
            `INSERT INTO vehicles (
              id, name, category_name, image, passengers, suitcases, hand_luggage,
              description, features, multiplier, sample_vehicles, is_active, sort_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              v.id,
              v.name,
              v.categoryName,
              v.image,
              v.passengers,
              v.suitcases,
              v.handLuggage,
              v.description,
              JSON.stringify(v.features),
              v.multiplier,
              v.sampleVehicles,
              v.isActive ? 1 : 0,
              v.sortOrder || 0,
            ]
          );
        }
      }
    } catch (err: any) {
      console.warn("VehicleModel.seedDefaults notice:", err.message);
    }
  }

  /**
   * Fetch all vehicles from MySQL (with fallback to default fleet)
   */
  static async getAll(onlyActive: boolean = true): Promise<IVehicle[]> {
    try {
      await this.seedDefaults();

      const sql = onlyActive
        ? "SELECT * FROM vehicles WHERE is_active = 1 ORDER BY sort_order ASC"
        : "SELECT * FROM vehicles ORDER BY sort_order ASC";

      const rows = await dbQuery<any[]>(sql);
      if (rows && rows.length > 0) {
        return rows.map((r) => this.formatRow(r));
      }
    } catch (error: any) {
      console.warn("VehicleModel.getAll query fallback notice:", error.message);
    }

    return DEFAULT_VEHICLE_FLEET.filter((v) => (onlyActive ? v.isActive : true));
  }

  /**
   * Find vehicle by ID (e.g. 'saloon', 'minibus-8')
   */
  static async getById(id: string): Promise<IVehicle | null> {
    try {
      const rows = await dbQuery<any[]>("SELECT * FROM vehicles WHERE id = ? LIMIT 1", [id]);
      if (rows && rows.length > 0) {
        return this.formatRow(rows[0]);
      }
    } catch (error: any) {
      console.error("VehicleModel.getById error:", error.message);
    }

    const fallback = DEFAULT_VEHICLE_FLEET.find((v) => v.id === id);
    return fallback || null;
  }

  /**
   * Add a new vehicle model to MySQL
   */
  static async create(vehicle: IVehicle): Promise<boolean> {
    try {
      await dbQuery(
        `INSERT INTO vehicles (
          id, name, category_name, image, passengers, suitcases, hand_luggage,
          description, features, multiplier, sample_vehicles, is_active, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          vehicle.id,
          vehicle.name,
          vehicle.categoryName,
          vehicle.image,
          vehicle.passengers,
          vehicle.suitcases,
          vehicle.handLuggage,
          vehicle.description,
          JSON.stringify(vehicle.features),
          vehicle.multiplier,
          vehicle.sampleVehicles,
          vehicle.isActive !== undefined ? (vehicle.isActive ? 1 : 0) : 1,
          vehicle.sortOrder || 0,
        ]
      );
      return true;
    } catch (error: any) {
      console.error("VehicleModel.create error:", error.message);
      return false;
    }
  }

  /**
   * Update existing vehicle details or multiplier
   */
  static async update(id: string, updates: Partial<IVehicle>): Promise<boolean> {
    try {
      const fields: string[] = [];
      const values: any[] = [];

      if (updates.name) {
        fields.push("name = ?");
        values.push(updates.name);
      }
      if (updates.categoryName) {
        fields.push("category_name = ?");
        values.push(updates.categoryName);
      }
      if (updates.image) {
        fields.push("image = ?");
        values.push(updates.image);
      }
      if (updates.passengers !== undefined) {
        fields.push("passengers = ?");
        values.push(updates.passengers);
      }
      if (updates.suitcases !== undefined) {
        fields.push("suitcases = ?");
        values.push(updates.suitcases);
      }
      if (updates.handLuggage !== undefined) {
        fields.push("hand_luggage = ?");
        values.push(updates.handLuggage);
      }
      if (updates.description) {
        fields.push("description = ?");
        values.push(updates.description);
      }
      if (updates.features) {
        fields.push("features = ?");
        values.push(JSON.stringify(updates.features));
      }
      if (updates.multiplier !== undefined) {
        fields.push("multiplier = ?");
        values.push(updates.multiplier);
      }
      if (updates.sampleVehicles) {
        fields.push("sample_vehicles = ?");
        values.push(updates.sampleVehicles);
      }
      if (updates.isActive !== undefined) {
        fields.push("is_active = ?");
        values.push(updates.isActive ? 1 : 0);
      }
      if (updates.sortOrder !== undefined) {
        fields.push("sort_order = ?");
        values.push(updates.sortOrder);
      }

      if (fields.length === 0) return true;

      values.push(id);
      await dbQuery(`UPDATE vehicles SET ${fields.join(", ")} WHERE id = ?`, values);
      return true;
    } catch (error: any) {
      console.error("VehicleModel.update error:", error.message);
      return false;
    }
  }

  /**
   * Delete vehicle model from MySQL
   */
  static async delete(id: string): Promise<boolean> {
    try {
      await dbQuery("DELETE FROM vehicles WHERE id = ?", [id]);
      return true;
    } catch (error: any) {
      console.error("VehicleModel.delete error:", error.message);
      return false;
    }
  }
}
