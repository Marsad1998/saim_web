import { dbQuery } from "@/lib/db";

export interface IDriver {
  id: string;
  user_id: string;
  address?: string | null;
  ni_number?: string | null;
  emergency_contact?: string | null;
  license_number: string;
  pco_expiry?: string | null;
  dvla_license_number?: string | null;
  vehicle_model: string;
  vehicle_plate: string;
  vehicle_year?: string | null;
  vehicle_category: string;
  insurance_number?: string | null;
  insurance_expiry?: string | null;
  bank_name?: string | null;
  sort_code?: string | null;
  account_number?: string | null;
  doc_pco_badge?: string | null;
  doc_dvla_license?: string | null;
  doc_phv_mot?: string | null;
  doc_insurance?: string | null;
  completion_score?: number;
  step1_completed?: boolean;
  step2_completed?: boolean;
  step3_completed?: boolean;
  step4_completed?: boolean;
  verification_status?: 'incomplete' | 'pending_approval' | 'approved' | 'rejected';
  admin_notes?: string | null;
  is_active: boolean;
  created_at?: string;
  // Joined fields when queried with user details
  driver_name?: string;
  driver_email?: string;
  driver_phone?: string;
}

export interface CreateDriverInput {
  userId: string;
  address?: string;
  niNumber?: string;
  emergencyContact?: string;
  licenseNumber?: string;
  pcoExpiry?: string;
  dvlaLicenseNumber?: string;
  vehicleModel?: string;
  vehiclePlate?: string;
  vehicleYear?: string;
  vehicleCategory?: string;
  insuranceNumber?: string;
  insuranceExpiry?: string;
  bankName?: string;
  sortCode?: string;
  accountNumber?: string;
  docPcoBadge?: string;
  docDvlaLicense?: string;
  docPhvMot?: string;
  docInsurance?: string;
  verificationStatus?: 'incomplete' | 'pending_approval' | 'approved' | 'rejected';
  adminNotes?: string;
  isActive?: boolean;
}

export interface UpdateDriverInput {
  address?: string;
  niNumber?: string;
  emergencyContact?: string;
  licenseNumber?: string;
  pcoExpiry?: string;
  dvlaLicenseNumber?: string;
  vehicleModel?: string;
  vehiclePlate?: string;
  vehicleYear?: string;
  vehicleCategory?: string;
  insuranceNumber?: string;
  insuranceExpiry?: string;
  bankName?: string;
  sortCode?: string;
  accountNumber?: string;
  docPcoBadge?: string;
  docDvlaLicense?: string;
  docPhvMot?: string;
  docInsurance?: string;
  completionScore?: number;
  verificationStatus?: 'incomplete' | 'pending_approval' | 'approved' | 'rejected';
  adminNotes?: string;
  isActive?: boolean;
}

export function computeDriverProgress(driver: Partial<IDriver>) {
  // Step 1: Personal Details (25%)
  const step1 = Boolean(
    (driver.address && driver.address.trim().length > 3) ||
    (driver.emergency_contact && driver.emergency_contact.trim().length > 3)
  );

  // Step 2: PCO & DVLA Licensing (25%)
  const step2 = Boolean(
    driver.license_number && driver.license_number.trim().length >= 4 &&
    (driver.pco_expiry || driver.doc_pco_badge || driver.dvla_license_number)
  );

  // Step 3: Vehicle Specification & Compliance (25%)
  const step3 = Boolean(
    driver.vehicle_model && driver.vehicle_model.trim().length >= 3 &&
    driver.vehicle_plate && driver.vehicle_plate.trim().length >= 3
  );

  // Step 4: Insurance & Payout Banking (25%)
  const step4 = Boolean(
    (driver.insurance_number || driver.doc_insurance) &&
    driver.sort_code && driver.sort_code.replace(/\D/g, '').length >= 6 &&
    driver.account_number && driver.account_number.replace(/\D/g, '').length >= 8
  );

  const score = (step1 ? 25 : 0) + (step2 ? 25 : 0) + (step3 ? 25 : 0) + (step4 ? 25 : 0);

  return {
    score,
    step1,
    step2,
    step3,
    step4,
    isComplete: score === 100,
  };
}

const DEFAULT_FALLBACK_DRIVERS: Record<string, IDriver> = {
  "usr_driver_1": {
    id: "drv_wilson_1",
    user_id: "usr_driver_1",
    address: "24 Kensington High Street, London W8 4PT",
    ni_number: "QQ 12 34 56 A",
    emergency_contact: "Sarah Wilson (+44 7911 999888)",
    license_number: "PCO-984321",
    pco_expiry: "2027-12-31",
    dvla_license_number: "WILSO812045JW99",
    vehicle_model: "Mercedes-Benz E-Class",
    vehicle_plate: "LO71 ABC",
    vehicle_year: "2023",
    vehicle_category: "saloon",
    insurance_number: "INS-882914-UK",
    insurance_expiry: "2027-11-30",
    bank_name: "Barclays Bank UK",
    sort_code: "20-04-15",
    account_number: "12345678",
    doc_pco_badge: "/uploads/driver_docs/demo_pco_badge.pdf",
    doc_insurance: "/uploads/driver_docs/demo_insurance.pdf",
    completion_score: 100,
    step1_completed: true,
    step2_completed: true,
    step3_completed: true,
    step4_completed: true,
    verification_status: "approved",
    is_active: true,
  },
  "usr_driver_2": {
    id: "drv_chauffeur_2",
    user_id: "usr_driver_2",
    address: "12 Baker Street, London NW1 6XE",
    ni_number: "AB 98 76 54 C",
    emergency_contact: "John Chauffeur (+44 7911 777666)",
    license_number: "PCO-771234",
    pco_expiry: "2027-08-15",
    dvla_license_number: "CHAUF708151AC88",
    vehicle_model: "BMW 5 Series",
    vehicle_plate: "EX22 XYZ",
    vehicle_year: "2022",
    vehicle_category: "saloon",
    insurance_number: "INS-449102-UK",
    insurance_expiry: "2027-09-15",
    bank_name: "NatWest",
    sort_code: "40-12-00",
    account_number: "87654321",
    doc_pco_badge: "/uploads/driver_docs/demo_pco_badge.pdf",
    doc_insurance: "/uploads/driver_docs/demo_insurance.pdf",
    completion_score: 100,
    step1_completed: true,
    step2_completed: true,
    step3_completed: true,
    step4_completed: true,
    verification_status: "approved",
    is_active: true,
  },
};

let inMemoryDrivers: Record<string, IDriver> = { ...DEFAULT_FALLBACK_DRIVERS };

export class DriverModel {
  /**
   * Register a new driver in MySQL and memory store
   */
  static async create(input: CreateDriverInput): Promise<IDriver> {
    const id = "drv_" + Math.random().toString(36).substring(2, 10);
    const category = input.vehicleCategory || "saloon";
    const isActive = input.isActive !== undefined ? input.isActive : false;
    const licenseNumber = input.licenseNumber ? input.licenseNumber.trim().toUpperCase() : "";
    const vehicleModel = input.vehicleModel ? input.vehicleModel.trim() : "";
    const vehiclePlate = input.vehiclePlate ? input.vehiclePlate.trim().toUpperCase() : "";

    const rawDriver: Partial<IDriver> = {
      address: input.address || null,
      emergency_contact: input.emergencyContact || null,
      license_number: licenseNumber,
      pco_expiry: input.pcoExpiry || null,
      dvla_license_number: input.dvlaLicenseNumber || null,
      vehicle_model: vehicleModel,
      vehicle_plate: vehiclePlate,
      insurance_number: input.insuranceNumber || null,
      doc_insurance: input.docInsurance || null,
      doc_pco_badge: input.docPcoBadge || null,
      sort_code: input.sortCode || null,
      account_number: input.accountNumber || null,
    };

    const progress = computeDriverProgress(rawDriver);
    const verificationStatus = input.verificationStatus || (progress.isComplete ? "approved" : "incomplete");

    const newDriver: IDriver = {
      id,
      user_id: input.userId,
      address: input.address || null,
      ni_number: input.niNumber || null,
      emergency_contact: input.emergencyContact || null,
      license_number: licenseNumber,
      pco_expiry: input.pcoExpiry || null,
      dvla_license_number: input.dvlaLicenseNumber || null,
      vehicle_model: vehicleModel,
      vehicle_plate: vehiclePlate,
      vehicle_year: input.vehicleYear || null,
      vehicle_category: category,
      insurance_number: input.insuranceNumber || null,
      insurance_expiry: input.insuranceExpiry || null,
      bank_name: input.bankName || null,
      sort_code: input.sortCode || null,
      account_number: input.accountNumber || null,
      doc_pco_badge: input.docPcoBadge || null,
      doc_dvla_license: input.docDvlaLicense || null,
      doc_phv_mot: input.docPhvMot || null,
      doc_insurance: input.docInsurance || null,
      completion_score: progress.score,
      step1_completed: progress.step1,
      step2_completed: progress.step2,
      step3_completed: progress.step3,
      step4_completed: progress.step4,
      verification_status: verificationStatus,
      admin_notes: input.adminNotes || null,
      is_active: isActive,
      created_at: new Date().toISOString(),
    };

    // Save in-memory
    inMemoryDrivers[input.userId] = newDriver;
    inMemoryDrivers[id] = newDriver;

    try {
      await dbQuery(
        `INSERT INTO drivers (
          id, user_id, address, ni_number, emergency_contact,
          license_number, pco_expiry, dvla_license_number,
          vehicle_model, vehicle_plate, vehicle_year, vehicle_category, 
          insurance_number, insurance_expiry, bank_name, sort_code, account_number, 
          doc_pco_badge, doc_dvla_license, doc_phv_mot, doc_insurance,
          completion_score, verification_status, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          input.userId,
          input.address || null,
          input.niNumber || null,
          input.emergencyContact || null,
          licenseNumber || null,
          input.pcoExpiry || null,
          input.dvlaLicenseNumber || null,
          vehicleModel || null,
          vehiclePlate || null,
          input.vehicleYear || null,
          category,
          input.insuranceNumber || null,
          input.insuranceExpiry || null,
          input.bankName || null,
          input.sortCode || null,
          input.accountNumber || null,
          input.docPcoBadge || null,
          input.docDvlaLicense || null,
          input.docPhvMot || null,
          input.docInsurance || null,
          progress.score,
          verificationStatus,
          isActive ? 1 : 0,
        ]
      );
    } catch (error: any) {
      console.warn("DriverModel.create DB fallback:", error.message);
    }

    return newDriver;
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
        return this.formatDriverRow(rows[0]);
      }
    } catch (error: any) {
      console.warn("DriverModel.findById DB fallback:", error.message);
    }

    if (inMemoryDrivers[id]) {
      return inMemoryDrivers[id];
    }

    return null;
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
        return this.formatDriverRow(rows[0]);
      }
    } catch (error: any) {
      console.warn("DriverModel.findByUserId DB fallback:", error.message);
    }

    if (inMemoryDrivers[userId]) {
      return inMemoryDrivers[userId];
    }

    return null;
  }

  /**
   * Format driver database row into full IDriver object with calculated progress
   */
  private static formatDriverRow(row: any): IDriver {
    const raw: Partial<IDriver> = {
      address: row.address || null,
      emergency_contact: row.emergency_contact || null,
      license_number: row.license_number || "",
      pco_expiry: row.pco_expiry || null,
      dvla_license_number: row.dvla_license_number || null,
      vehicle_model: row.vehicle_model || "",
      vehicle_plate: row.vehicle_plate || "",
      insurance_number: row.insurance_number || null,
      doc_insurance: row.doc_insurance || null,
      doc_pco_badge: row.doc_pco_badge || null,
      sort_code: row.sort_code || null,
      account_number: row.account_number || null,
    };

    const progress = computeDriverProgress(raw);

    return {
      id: row.id,
      user_id: row.user_id,
      address: row.address || null,
      ni_number: row.ni_number || null,
      emergency_contact: row.emergency_contact || null,
      license_number: row.license_number || "",
      pco_expiry: row.pco_expiry || null,
      dvla_license_number: row.dvla_license_number || null,
      vehicle_model: row.vehicle_model || "",
      vehicle_plate: row.vehicle_plate || "",
      vehicle_year: row.vehicle_year || null,
      vehicle_category: row.vehicle_category || "saloon",
      insurance_number: row.insurance_number || null,
      insurance_expiry: row.insurance_expiry || null,
      bank_name: row.bank_name || null,
      sort_code: row.sort_code || null,
      account_number: row.account_number || null,
      doc_pco_badge: row.doc_pco_badge || null,
      doc_dvla_license: row.doc_dvla_license || null,
      doc_phv_mot: row.doc_phv_mot || null,
      doc_insurance: row.doc_insurance || null,
      completion_score: row.completion_score !== undefined && row.completion_score !== null ? Number(row.completion_score) : progress.score,
      step1_completed: progress.step1,
      step2_completed: progress.step2,
      step3_completed: progress.step3,
      step4_completed: progress.step4,
      verification_status: row.verification_status || (progress.isComplete ? "approved" : "incomplete"),
      admin_notes: row.admin_notes || null,
      is_active: Boolean(row.is_active),
      created_at: row.created_at ? new Date(row.created_at).toISOString() : undefined,
      driver_name: row.driver_name,
      driver_email: row.driver_email,
      driver_phone: row.driver_phone,
    };
  }

  /**
   * Toggle driver active on/off duty
   */
  static async toggleActive(id: string, isActive: boolean): Promise<boolean> {
    return this.update(id, { isActive });
  }

  /**
   * Update driver vehicle, license, or documentation info
   */
  static async update(id: string, updates: UpdateDriverInput): Promise<boolean> {
    // Update in-memory driver
    let targetDriver = inMemoryDrivers[id];
    if (!targetDriver) {
      targetDriver = inMemoryDrivers[Object.keys(inMemoryDrivers).find(k => inMemoryDrivers[k].id === id) || ""];
    }

    if (targetDriver) {
      if (updates.address !== undefined) targetDriver.address = updates.address;
      if (updates.niNumber !== undefined) targetDriver.ni_number = updates.niNumber;
      if (updates.emergencyContact !== undefined) targetDriver.emergency_contact = updates.emergencyContact;
      if (updates.licenseNumber !== undefined) targetDriver.license_number = updates.licenseNumber.trim().toUpperCase();
      if (updates.pcoExpiry !== undefined) targetDriver.pco_expiry = updates.pcoExpiry;
      if (updates.dvlaLicenseNumber !== undefined) targetDriver.dvla_license_number = updates.dvlaLicenseNumber;
      if (updates.vehicleModel !== undefined) targetDriver.vehicle_model = updates.vehicleModel.trim();
      if (updates.vehiclePlate !== undefined) targetDriver.vehicle_plate = updates.vehiclePlate.trim().toUpperCase();
      if (updates.vehicleYear !== undefined) targetDriver.vehicle_year = updates.vehicleYear;
      if (updates.vehicleCategory !== undefined) targetDriver.vehicle_category = updates.vehicleCategory;
      if (updates.insuranceNumber !== undefined) targetDriver.insurance_number = updates.insuranceNumber.trim();
      if (updates.insuranceExpiry !== undefined) targetDriver.insurance_expiry = updates.insuranceExpiry;
      if (updates.bankName !== undefined) targetDriver.bank_name = updates.bankName;
      if (updates.sortCode !== undefined) targetDriver.sort_code = updates.sortCode.trim();
      if (updates.accountNumber !== undefined) targetDriver.account_number = updates.accountNumber.trim();
      if (updates.docPcoBadge !== undefined) targetDriver.doc_pco_badge = updates.docPcoBadge;
      if (updates.docDvlaLicense !== undefined) targetDriver.doc_dvla_license = updates.docDvlaLicense;
      if (updates.docPhvMot !== undefined) targetDriver.doc_phv_mot = updates.docPhvMot;
      if (updates.docInsurance !== undefined) targetDriver.doc_insurance = updates.docInsurance;
      if (updates.verificationStatus !== undefined) targetDriver.verification_status = updates.verificationStatus;
      if (updates.adminNotes !== undefined) targetDriver.admin_notes = updates.adminNotes;
      if (updates.isActive !== undefined) targetDriver.is_active = updates.isActive;

      // Recalculate progress
      const progress = computeDriverProgress(targetDriver);
      targetDriver.completion_score = progress.score;
      targetDriver.step1_completed = progress.step1;
      targetDriver.step2_completed = progress.step2;
      targetDriver.step3_completed = progress.step3;
      targetDriver.step4_completed = progress.step4;

      if (targetDriver.user_id) {
        inMemoryDrivers[targetDriver.user_id] = targetDriver;
      }
      inMemoryDrivers[targetDriver.id] = targetDriver;
    }

    try {
      const fields: string[] = [];
      const values: any[] = [];

      if (updates.address !== undefined) { fields.push("address = ?"); values.push(updates.address); }
      if (updates.niNumber !== undefined) { fields.push("ni_number = ?"); values.push(updates.niNumber); }
      if (updates.emergencyContact !== undefined) { fields.push("emergency_contact = ?"); values.push(updates.emergencyContact); }
      if (updates.licenseNumber !== undefined) { fields.push("license_number = ?"); values.push(updates.licenseNumber.trim().toUpperCase()); }
      if (updates.pcoExpiry !== undefined) { fields.push("pco_expiry = ?"); values.push(updates.pcoExpiry); }
      if (updates.dvlaLicenseNumber !== undefined) { fields.push("dvla_license_number = ?"); values.push(updates.dvlaLicenseNumber); }
      if (updates.vehicleModel !== undefined) { fields.push("vehicle_model = ?"); values.push(updates.vehicleModel.trim()); }
      if (updates.vehiclePlate !== undefined) { fields.push("vehicle_plate = ?"); values.push(updates.vehiclePlate.trim().toUpperCase()); }
      if (updates.vehicleYear !== undefined) { fields.push("vehicle_year = ?"); values.push(updates.vehicleYear); }
      if (updates.vehicleCategory !== undefined) { fields.push("vehicle_category = ?"); values.push(updates.vehicleCategory); }
      if (updates.insuranceNumber !== undefined) { fields.push("insurance_number = ?"); values.push(updates.insuranceNumber.trim()); }
      if (updates.insuranceExpiry !== undefined) { fields.push("insurance_expiry = ?"); values.push(updates.insuranceExpiry); }
      if (updates.bankName !== undefined) { fields.push("bank_name = ?"); values.push(updates.bankName); }
      if (updates.sortCode !== undefined) { fields.push("sort_code = ?"); values.push(updates.sortCode.trim()); }
      if (updates.accountNumber !== undefined) { fields.push("account_number = ?"); values.push(updates.accountNumber.trim()); }
      if (updates.docPcoBadge !== undefined) { fields.push("doc_pco_badge = ?"); values.push(updates.docPcoBadge); }
      if (updates.docDvlaLicense !== undefined) { fields.push("doc_dvla_license = ?"); values.push(updates.docDvlaLicense); }
      if (updates.docPhvMot !== undefined) { fields.push("doc_phv_mot = ?"); values.push(updates.docPhvMot); }
      if (updates.docInsurance !== undefined) { fields.push("doc_insurance = ?"); values.push(updates.docInsurance); }
      if (updates.completionScore !== undefined) { fields.push("completion_score = ?"); values.push(updates.completionScore); }
      if (updates.verificationStatus !== undefined) { fields.push("verification_status = ?"); values.push(updates.verificationStatus); }
      if (updates.adminNotes !== undefined) { fields.push("admin_notes = ?"); values.push(updates.adminNotes); }
      if (updates.isActive !== undefined) { fields.push("is_active = ?"); values.push(updates.isActive ? 1 : 0); }

      if (fields.length > 0) {
        values.push(id);
        await dbQuery(`UPDATE drivers SET ${fields.join(", ")} WHERE id = ?`, values);
      }
      return true;
    } catch (error: any) {
      console.warn("DriverModel.update DB fallback:", error.message);
      return Boolean(targetDriver);
    }
  }

  /**
   * Get all active drivers
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
        if (rows && rows.length > 0) {
          return rows.map((r) => this.formatDriverRow(r));
        }
      }
    } catch (error: any) {}

    return Object.values(inMemoryDrivers).filter(d => d.is_active && (!category || d.vehicle_category === category));
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
      if (rows && rows.length > 0) {
        return rows.map((r) => this.formatDriverRow(r));
      }
    } catch (error: any) {}

    // Deduplicate in-memory drivers by id
    const uniqueDrivers = new Map<string, IDriver>();
    for (const d of Object.values(inMemoryDrivers)) {
      uniqueDrivers.set(d.id, d);
    }
    return Array.from(uniqueDrivers.values());
  }
}
