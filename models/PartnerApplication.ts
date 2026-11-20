import { dbQuery } from "@/lib/db";

export interface IPartnerApplication {
  id?: number;
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string | null;
  partner_type: string;
  fleet_size?: string | null;
  message?: string | null;
  status: "new" | "under_review" | "approved" | "rejected";
  admin_notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePartnerInput {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  partnerType: string;
  fleetSize?: string;
  message?: string;
}

const inMemoryPartners: IPartnerApplication[] = [];
let nextPartnerId = 100;

export class PartnerApplicationModel {
  /**
   * Save a new B2B / corporate / fleet partner application
   */
  static async create(input: CreatePartnerInput): Promise<IPartnerApplication> {
    const cleanCompanyName = input.companyName.trim();
    const cleanContactName = input.contactName.trim();
    const cleanEmail = input.email.trim().toLowerCase();
    const cleanPhone = input.phone?.trim() || null;
    const cleanPartnerType = input.partnerType.trim();
    const cleanFleetSize = input.fleetSize?.trim() || null;
    const cleanMessage = input.message?.trim() || null;

    const partnerRecord: IPartnerApplication = {
      id: nextPartnerId++,
      company_name: cleanCompanyName,
      contact_name: cleanContactName,
      email: cleanEmail,
      phone: cleanPhone,
      partner_type: cleanPartnerType,
      fleet_size: cleanFleetSize,
      message: cleanMessage,
      status: "new",
      created_at: new Date().toISOString(),
    };

    try {
      const result: any = await dbQuery(
        `INSERT INTO partner_applications 
         (company_name, contact_name, email, phone, partner_type, fleet_size, message, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'new')`,
        [
          cleanCompanyName,
          cleanContactName,
          cleanEmail,
          cleanPhone,
          cleanPartnerType,
          cleanFleetSize,
          cleanMessage,
        ]
      );

      if (result?.insertId) {
        partnerRecord.id = result.insertId;
      }
    } catch (error: any) {
      console.warn("PartnerApplicationModel.create DB fallback:", error.message);
    }

    inMemoryPartners.unshift(partnerRecord);
    return partnerRecord;
  }

  /**
   * Get all partner applications with optional status filter
   */
  static async getAll(status?: "new" | "under_review" | "approved" | "rejected"): Promise<IPartnerApplication[]> {
    try {
      const sql = status
        ? "SELECT * FROM partner_applications WHERE status = ? ORDER BY created_at DESC"
        : "SELECT * FROM partner_applications ORDER BY created_at DESC";
      const params = status ? [status] : [];
      const rows = await dbQuery<any[]>(sql, params);

      if (rows && rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          company_name: r.company_name,
          contact_name: r.contact_name,
          email: r.email,
          phone: r.phone,
          partner_type: r.partner_type,
          fleet_size: r.fleet_size,
          message: r.message,
          status: r.status,
          admin_notes: r.admin_notes,
          created_at: r.created_at ? new Date(r.created_at).toISOString() : undefined,
          updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
        }));
      }
    } catch (error: any) {
      console.warn("PartnerApplicationModel.getAll DB fallback:", error.message);
    }

    return status
      ? inMemoryPartners.filter((p) => p.status === status)
      : inMemoryPartners;
  }

  /**
   * Update full partner application details
   */
  static async update(
    id: number,
    updates: Partial<IPartnerApplication>
  ): Promise<boolean> {
    const inMem = inMemoryPartners.find((p) => p.id === id);
    if (inMem) {
      Object.assign(inMem, updates);
    }

    try {
      const fields: string[] = [];
      const values: any[] = [];

      if (updates.company_name !== undefined) { fields.push("company_name = ?"); values.push(updates.company_name); }
      if (updates.contact_name !== undefined) { fields.push("contact_name = ?"); values.push(updates.contact_name); }
      if (updates.email !== undefined) { fields.push("email = ?"); values.push(updates.email); }
      if (updates.phone !== undefined) { fields.push("phone = ?"); values.push(updates.phone); }
      if (updates.partner_type !== undefined) { fields.push("partner_type = ?"); values.push(updates.partner_type); }
      if (updates.fleet_size !== undefined) { fields.push("fleet_size = ?"); values.push(updates.fleet_size); }
      if (updates.message !== undefined) { fields.push("message = ?"); values.push(updates.message); }
      if (updates.status !== undefined) { fields.push("status = ?"); values.push(updates.status); }
      if (updates.admin_notes !== undefined) { fields.push("admin_notes = ?"); values.push(updates.admin_notes); }

      if (fields.length === 0) return true;

      values.push(id);
      await dbQuery(`UPDATE partner_applications SET ${fields.join(", ")} WHERE id = ?`, values);
      return true;
    } catch (error: any) {
      console.warn("PartnerApplicationModel.update DB fallback:", error.message);
      return Boolean(inMem);
    }
  }

  /**
   * Update partner application status and admin review notes
   */
  static async updateStatus(
    id: number,
    status: "new" | "under_review" | "approved" | "rejected",
    adminNotes?: string
  ): Promise<boolean> {
    const inMem = inMemoryPartners.find((p) => p.id === id);
    if (inMem) {
      inMem.status = status;
      if (adminNotes !== undefined) inMem.admin_notes = adminNotes;
    }

    try {
      if (adminNotes !== undefined) {
        await dbQuery(
          "UPDATE partner_applications SET status = ?, admin_notes = ? WHERE id = ?",
          [status, adminNotes, id]
        );
      } else {
        await dbQuery("UPDATE partner_applications SET status = ? WHERE id = ?", [status, id]);
      }
      return true;
    } catch (error: any) {
      console.warn("PartnerApplicationModel.updateStatus DB fallback:", error.message);
      return Boolean(inMem);
    }
  }

  /**
   * Delete application by ID
   */
  static async delete(id: number): Promise<boolean> {
    const idx = inMemoryPartners.findIndex((p) => p.id === id);
    if (idx !== -1) inMemoryPartners.splice(idx, 1);

    try {
      await dbQuery("DELETE FROM partner_applications WHERE id = ?", [id]);
      return true;
    } catch (error: any) {
      console.warn("PartnerApplicationModel.delete DB fallback:", error.message);
      return idx !== -1;
    }
  }
}
