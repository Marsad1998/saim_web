import { dbQuery } from "@/lib/db";

export interface IContactInquiry {
  id?: number;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  status: "new" | "in_progress" | "resolved";
  created_at?: string;
}

export interface CreateInquiryInput {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export class ContactInquiryModel {
  /**
   * Save a new contact inquiry from the Contact Us form
   */
  static async create(input: CreateInquiryInput): Promise<IContactInquiry> {
    const cleanName = input.name.trim();
    const cleanEmail = input.email.trim().toLowerCase();
    const cleanPhone = input.phone?.trim() || null;
    const cleanSubject = input.subject?.trim() || null;
    const cleanMessage = input.message.trim();

    try {
      const result: any = await dbQuery(
        `INSERT INTO contact_inquiries (name, email, phone, subject, message, status)
         VALUES (?, ?, ?, ?, ?, 'new')`,
        [cleanName, cleanEmail, cleanPhone, cleanSubject, cleanMessage]
      );

      return {
        id: result?.insertId || 0,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        subject: cleanSubject,
        message: cleanMessage,
        status: "new",
        created_at: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error("ContactInquiryModel.create error:", error.message);
      return {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        subject: cleanSubject,
        message: cleanMessage,
        status: "new",
        created_at: new Date().toISOString(),
      };
    }
  }

  /**
   * Get an inquiry by its ID
   */
  static async getById(id: number): Promise<IContactInquiry | null> {
    try {
      const rows = await dbQuery<any[]>(
        "SELECT * FROM contact_inquiries WHERE id = ? LIMIT 1",
        [id]
      );
      if (rows && rows.length > 0) {
        const row = rows[0];
        return {
          id: row.id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          subject: row.subject,
          message: row.message,
          status: row.status,
          created_at: row.created_at ? new Date(row.created_at).toISOString() : undefined,
        };
      }
      return null;
    } catch (error: any) {
      console.error("ContactInquiryModel.getById error:", error.message);
      return null;
    }
  }

  /**
   * Update inquiry resolution status (e.g. marked as resolved)
   */
  static async updateStatus(
    id: number,
    status: "new" | "in_progress" | "resolved"
  ): Promise<boolean> {
    try {
      await dbQuery("UPDATE contact_inquiries SET status = ? WHERE id = ?", [status, id]);
      return true;
    } catch (error: any) {
      console.error("ContactInquiryModel.updateStatus error:", error.message);
      return false;
    }
  }

  /**
   * Get all inquiries (optionally filtered by status)
   */
  static async getAll(status?: "new" | "in_progress" | "resolved"): Promise<IContactInquiry[]> {
    try {
      if (status) {
        const rows = await dbQuery<any[]>(
          "SELECT * FROM contact_inquiries WHERE status = ? ORDER BY created_at DESC",
          [status]
        );
        return rows.map((row) => ({
          id: row.id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          subject: row.subject,
          message: row.message,
          status: row.status,
          created_at: row.created_at ? new Date(row.created_at).toISOString() : undefined,
        }));
      }

      const rows = await dbQuery<any[]>(
        "SELECT * FROM contact_inquiries ORDER BY created_at DESC"
      );
      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        subject: row.subject,
        message: row.message,
        status: row.status,
        created_at: row.created_at ? new Date(row.created_at).toISOString() : undefined,
      }));
    } catch (error: any) {
      console.error("ContactInquiryModel.getAll error:", error.message);
      return [];
    }
  }

  /**
   * Delete an inquiry by ID
   */
  static async delete(id: number): Promise<boolean> {
    try {
      await dbQuery("DELETE FROM contact_inquiries WHERE id = ?", [id]);
      return true;
    } catch (error: any) {
      console.error("ContactInquiryModel.delete error:", error.message);
      return false;
    }
  }
}
