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
  ratePerMile?: number;
  minimumFare?: number;
  sampleVehicles: string;
  isActive?: boolean;
  sortOrder?: number;
}

export const DEFAULT_VEHICLE_FLEET: IVehicle[] = [
  {
    id: "saloon",
    name: "Standard Saloon",
    categoryName: "Saloon Car",
    image: "/images/vehicles/standard-saloon.png",
    passengers: 4,
    suitcases: 2,
    handLuggage: 2,
    ratePerMile: 1.50,
    minimumFare: 38.00,
    description: "Ideal for everyday airport transfers, solo travelers, and couples.",
    features: ["Air Conditioning", "Flight Tracking", "45 Mins Free Waiting", "Fixed Price Guarantee"],
    multiplier: 1.0,
    sampleVehicles: "VW Passat, Skoda Octavia, Ford Mondeo",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "estate",
    name: "Estate Car",
    categoryName: "Estate Vehicle",
    image: "/images/vehicles/standard-saloon.png",
    passengers: 4,
    suitcases: 4,
    handLuggage: 3,
    ratePerMile: 1.70,
    minimumFare: 42.00,
    description: "Extended boot capacity for travelers with bulky luggage, skis or strollers.",
    features: ["Extra Luggage Capacity", "Air Conditioning", "Flight Tracking", "Fixed Price Guarantee"],
    multiplier: 1.13,
    sampleVehicles: "Skoda Superb Estate, VW Passat Estate",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "executive-saloon",
    name: "Executive Saloon",
    categoryName: "Executive Chauffeur",
    image: "/images/vehicles/standard-saloon.png",
    passengers: 3,
    suitcases: 2,
    handLuggage: 2,
    ratePerMile: 1.90,
    minimumFare: 48.00,
    description: "Premium luxury comfort for corporate executives and discerning travelers.",
    features: ["Luxury Leather Interior", "Bottled Water & Wi-Fi", "Meet & Greet Included", "Professional Chauffeur"],
    multiplier: 1.27,
    sampleVehicles: "Mercedes-Benz E-Class, BMW 5 Series, Audi A6",
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "mpv",
    name: "MPV (5–6 Seater)",
    categoryName: "People Carrier (MPV-5/6)",
    image: "/images/vehicles/standard-saloon.png",
    passengers: 6,
    suitcases: 4,
    handLuggage: 4,
    ratePerMile: 2.05,
    minimumFare: 52.00,
    description: "Designed for small groups and families requiring extra seating room.",
    features: ["Spacious 5-6 Seater", "Air Conditioning", "Child Seats Available", "Fixed Price Guarantee"],
    multiplier: 1.37,
    sampleVehicles: "VW Sharan, Ford Galaxy, Citroen Spacetourer",
    isActive: true,
    sortOrder: 4,
  },
  {
    id: "minibus-8",
    name: "Minibus (8–9 Seater)",
    categoryName: "Minibus (8–9 Seater)",
    image: "/images/vehicles/standard-saloon.png",
    passengers: 8,
    suitcases: 8,
    handLuggage: 8,
    ratePerMile: 2.55,
    minimumFare: 65.00,
    description: "Large capacity transport for larger families, corporate groups, and sports tours.",
    features: ["Up to 8-9 Passengers", "Massive Cargo Space", "Dual Climate Control", "Fixed Price Guarantee"],
    multiplier: 1.70,
    sampleVehicles: "Mercedes Vito Tourer, Ford Tourneo Custom, VW Caravelle",
    isActive: true,
    sortOrder: 5,
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
      ratePerMile: row.rate_per_mile ? Number(row.rate_per_mile) : undefined,
      minimumFare: row.minimum_fare ? Number(row.minimum_fare) : undefined,
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
      if (updates.ratePerMile !== undefined) {
        fields.push("rate_per_mile = ?");
        values.push(updates.ratePerMile);
      }
      if (updates.minimumFare !== undefined) {
        fields.push("minimum_fare = ?");
        values.push(updates.minimumFare);
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

      // Keep in-memory default fleet synchronized with updates
      const idx = DEFAULT_VEHICLE_FLEET.findIndex((v) => v.id === id);
      if (idx !== -1) {
        DEFAULT_VEHICLE_FLEET[idx] = { ...DEFAULT_VEHICLE_FLEET[idx], ...updates };
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
   * Delete vehicle model from MySQL (Protected core categories cannot be deleted)
   */
  static async delete(id: string): Promise<boolean> {
    const PROTECTED_VEHICLE_IDS = ["saloon", "estate", "executive-saloon", "mpv", "minibus-8"];
    if (PROTECTED_VEHICLE_IDS.includes(id)) {
      return false; // Core official rate card vehicle categories are permanently protected
    }
    try {
      await dbQuery("DELETE FROM vehicles WHERE id = ?", [id]);
      return true;
    } catch (error: any) {
      console.error("VehicleModel.delete error:", error.message);
      return false;
    }
  }
}
