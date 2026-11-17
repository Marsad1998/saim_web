import { dbQuery } from "@/lib/db";

export interface IReview {
  id?: number;
  quote_ref?: string | null;
  author_name: string;
  route?: string | null;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at?: string;
}

export interface CreateReviewInput {
  quoteRef?: string;
  authorName: string;
  route?: string;
  rating: number;
  comment: string;
  isApproved?: boolean;
}

export class ReviewModel {
  /**
   * Submit a new customer review in MySQL
   */
  static async create(input: CreateReviewInput): Promise<IReview> {
    const authorName = input.authorName.trim();
    const route = input.route?.trim() || null;
    const rating = Math.min(5, Math.max(1, Math.round(input.rating || 5)));
    const comment = input.comment.trim();
    const quoteRef = input.quoteRef?.trim() || null;
    const isApproved = input.isApproved !== undefined ? input.isApproved : true;

    try {
      const result: any = await dbQuery(
        `INSERT INTO reviews (quote_ref, author_name, route, rating, comment, is_approved)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [quoteRef, authorName, route, rating, comment, isApproved ? 1 : 0]
      );

      return {
        id: result?.insertId || 0,
        quote_ref: quoteRef,
        author_name: authorName,
        route,
        rating,
        comment,
        is_approved: isApproved,
        created_at: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error("ReviewModel.create error:", error.message);
      return {
        quote_ref: quoteRef,
        author_name: authorName,
        route,
        rating,
        comment,
        is_approved: isApproved,
        created_at: new Date().toISOString(),
      };
    }
  }

  /**
   * Get public approved reviews (for website homepage and testimonials section)
   */
  static async getApproved(limit: number = 10): Promise<IReview[]> {
    try {
      const rows = await dbQuery<any[]>(
        `SELECT * FROM reviews 
         WHERE is_approved = 1 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [limit]
      );

      return rows.map((r) => ({
        id: r.id,
        quote_ref: r.quote_ref,
        author_name: r.author_name,
        route: r.route,
        rating: r.rating,
        comment: r.comment,
        is_approved: Boolean(r.is_approved),
        created_at: r.created_at ? new Date(r.created_at).toISOString() : undefined,
      }));
    } catch (error: any) {
      console.error("ReviewModel.getApproved error:", error.message);
      return [];
    }
  }

  /**
   * Get review for a specific journey by quote reference
   */
  static async getByQuoteRef(quoteRef: string): Promise<IReview | null> {
    try {
      const rows = await dbQuery<any[]>(
        "SELECT * FROM reviews WHERE quote_ref = ? LIMIT 1",
        [quoteRef]
      );
      if (rows && rows.length > 0) {
        const r = rows[0];
        return {
          id: r.id,
          quote_ref: r.quote_ref,
          author_name: r.author_name,
          route: r.route,
          rating: r.rating,
          comment: r.comment,
          is_approved: Boolean(r.is_approved),
          created_at: r.created_at ? new Date(r.created_at).toISOString() : undefined,
        };
      }
      return null;
    } catch (error: any) {
      console.error("ReviewModel.getByQuoteRef error:", error.message);
      return null;
    }
  }

  /**
   * Calculate overall average rating score and total reviews
   */
  static async getRatingSummary(): Promise<{ averageRating: number; totalReviews: number }> {
    try {
      const rows = await dbQuery<any[]>(
        "SELECT AVG(rating) as avg_rating, COUNT(*) as total FROM reviews WHERE is_approved = 1"
      );
      if (rows && rows.length > 0) {
        const avg = rows[0].avg_rating ? Number(Number(rows[0].avg_rating).toFixed(1)) : 4.9;
        const total = rows[0].total ? Number(rows[0].total) : 0;
        return { averageRating: avg, totalReviews: total };
      }
      return { averageRating: 4.9, totalReviews: 0 };
    } catch (error: any) {
      console.error("ReviewModel.getRatingSummary error:", error.message);
      return { averageRating: 4.9, totalReviews: 0 };
    }
  }

  /**
   * Toggle review approval status (for admin moderation)
   */
  static async toggleApproval(id: number, isApproved: boolean): Promise<boolean> {
    try {
      await dbQuery("UPDATE reviews SET is_approved = ? WHERE id = ?", [isApproved ? 1 : 0, id]);
      return true;
    } catch (error: any) {
      console.error("ReviewModel.toggleApproval error:", error.message);
      return false;
    }
  }

  /**
   * Get all reviews (for Admin moderation)
   */
  static async getAll(): Promise<IReview[]> {
    try {
      const rows = await dbQuery<any[]>(
        "SELECT * FROM reviews ORDER BY created_at DESC"
      );
      return rows.map((r) => ({
        id: r.id,
        quote_ref: r.quote_ref,
        author_name: r.author_name,
        route: r.route,
        rating: r.rating,
        comment: r.comment,
        is_approved: Boolean(r.is_approved),
        created_at: r.created_at ? new Date(r.created_at).toISOString() : undefined,
      }));
    } catch (error: any) {
      console.error("ReviewModel.getAll error:", error.message);
      return [];
    }
  }

  /**
   * Delete a review by ID
   */
  static async delete(id: number): Promise<boolean> {
    try {
      await dbQuery("DELETE FROM reviews WHERE id = ?", [id]);
      return true;
    } catch (error: any) {
      console.error("ReviewModel.delete error:", error.message);
      return false;
    }
  }
}
