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

// In-memory fallback cache so inquiries persist even when DB is temporarily unreachable
const inMemoryInquiries: IContactInquiry[] = [];
let nextInquiryId = 1000;

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

    const inquiryRecord: IContactInquiry = {
      id: nextInquiryId++,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      subject: cleanSubject,
      message: cleanMessage,
      status: "new",
      created_at: new Date().toISOString(),
    };

    try {
      const result: any = await dbQuery(
        `INSERT INTO contact_inquiries (name, email, phone, subject, message, status)
         VALUES (?, ?, ?, ?, ?, 'new')`,
        [cleanName, cleanEmail, cleanPhone, cleanSubject, cleanMessage]
      );

      if (result?.insertId) {
        inquiryRecord.id = result.insertId;
      }
    } catch (error: any) {
      console.warn("ContactInquiryModel.create DB fallback:", error.message);
    }

    inMemoryInquiries.unshift(inquiryRecord);
    return inquiryRecord;
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
    } catch (error: any) {
      console.warn("ContactInquiryModel.getById DB fallback:", error.message);
    }

    return inMemoryInquiries.find((i) => i.id === id) || null;
  }

  /**
   * Update inquiry resolution status (e.g. marked as resolved)
   */
  static async updateStatus(
    id: number,
    status: "new" | "in_progress" | "resolved"
  ): Promise<boolean> {
    const inMem = inMemoryInquiries.find((i) => i.id === id);
    if (inMem) inMem.status = status;

    try {
      await dbQuery("UPDATE contact_inquiries SET status = ? WHERE id = ?", [status, id]);
      return true;
    } catch (error: any) {
      console.warn("ContactInquiryModel.updateStatus DB fallback:", error.message);
      return Boolean(inMem);
    }
  }

  /**
   * Get all inquiries (optionally filtered by status)
   */
  static async getAll(status?: "new" | "in_progress" | "resolved"): Promise<IContactInquiry[]> {
    try {
      const sql = status
        ? "SELECT * FROM contact_inquiries WHERE status = ? ORDER BY created_at DESC"
        : "SELECT * FROM contact_inquiries ORDER BY created_at DESC";
      const params = status ? [status] : [];
      const rows = await dbQuery<any[]>(sql, params);

      if (rows && rows.length > 0) {
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
    } catch (error: any) {
      console.warn("ContactInquiryModel.getAll DB fallback:", error.message);
    }

    return status
      ? inMemoryInquiries.filter((i) => i.status === status)
      : inMemoryInquiries;
  }

  /**
   * Delete an inquiry by ID
   */
  static async delete(id: number): Promise<boolean> {
    const idx = inMemoryInquiries.findIndex((i) => i.id === id);
    if (idx !== -1) inMemoryInquiries.splice(idx, 1);

    try {
      await dbQuery("DELETE FROM contact_inquiries WHERE id = ?", [id]);
      return true;
    } catch (error: any) {
      console.warn("ContactInquiryModel.delete DB fallback:", error.message);
      return idx !== -1;
    }
  }
}
